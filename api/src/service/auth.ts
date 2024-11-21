import CharacterOwnershipRepository, { dbCharacterOwnership } from "data/character_ownership"
import UserRepository, { DbUser } from "data/user";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1"
import fetchSeatCharacterUserId from "utils/seat/character";
import { fetchSeatUser } from "utils/seat/user";
import { createEveCharacter } from "./character";
import { Context } from "types";
import { DbCorporation } from "data/corporation";
import { DbCharacter } from "data/character";
import { Permissions } from "model/permission";

async function syncSeatUser(env: Env, db: DrizzleD1Database<Record<string, never>>, character_id: number): Promise<DbUser | number | null> {
    const userRepository = new UserRepository(db);
    const characterOwnershipRepository = new CharacterOwnershipRepository(db);

    const seat_user_id = await fetchSeatCharacterUserId(env, character_id);

    if (!seat_user_id) {
        return null;
    }

    const existing_seat_user_entry = await userRepository.get({ seat_user_id }, 1);

    if (existing_seat_user_entry[0]) {
        const new_user_id = existing_seat_user_entry[0].id;

        let ownerships = await characterOwnershipRepository.get({ character_id }, 1);

        if (ownerships[0]) {
            let ownership: dbCharacterOwnership | null = ownerships[0];

            ownership.user_id = new_user_id;

            ownership = await characterOwnershipRepository.update(ownership);

            if (!ownership) {
                throw new Error(`Failed to update character ownership for character with id ${character_id} to user with id ${new_user_id}`);
            }
        }

        const existing_user = await userRepository.getUserById(new_user_id);

        if (!existing_user) {
            throw new Error(`Failed to retrieve user with id ${new_user_id} after updating character ownership.`);
        }

        return existing_user;
    }

    return seat_user_id;
}

async function getExistingUser(env: Env, db: DrizzleD1Database<Record<string, never>>, user_id: number, character_id: number): Promise<DbUser> {
    const userRepository = new UserRepository(db);

    let user = await userRepository.getUserById(user_id);

    if (!user) {
        throw new Error(`User with id ${user_id} not found yet ownership entry is present in violation of foreign key constraint.`);
    }

    if (!user.seat_user_id) {
        const result = await syncSeatUser(env, db, character_id);

        if (typeof result === 'number') {
            const seat_user_id: number = result;

            user.seat_user_id = seat_user_id;

            const seat_user_data = await fetchSeatUser(env, seat_user_id);

            if (user.main_character_id !== seat_user_data.main_character_id) {
                await createEveCharacter(env, db, seat_user_data.main_character_id);

                user.main_character_id = seat_user_data.main_character_id;
            }
        } else if (result !== null) {
            const user_linked_via_seat = result;
            user = user_linked_via_seat;
        }
    }

    return user;
}

async function createNewUser(env: Env, db: DrizzleD1Database<Record<string, never>>, owner_hash: string, character_id: number, character_name: string): Promise<DbUser> {
    const userRepository = new UserRepository(db);
    const characterOwnershipRepository = new CharacterOwnershipRepository(db);
    const result = await syncSeatUser(env, db, character_id);

    let seat_user_id: number | null = null;

    if (typeof result === 'number') {

        seat_user_id = result;
    } else if (result !== null) {
        const existing_user = result;

        await createEveCharacter(env, db, character_id, character_name);

        const ownership = await characterOwnershipRepository.create({
            user_id: existing_user.id,
            owner_hash,
            character_id,
        })

        if (!ownership) {
            throw new Error(`Failed to create ownership entry for user with id ${existing_user.id} and character with id ${character_id}`);
        }

        if (!existing_user.seat_user_id) {
            throw new Error(`User with id ${existing_user.id} has no seat_user_id after sync.`);
        }

        const seat_user_data = await fetchSeatUser(env, existing_user.seat_user_id);

        if (existing_user.main_character_id !== seat_user_data.main_character_id) {
            await createEveCharacter(env, db, seat_user_data.main_character_id);

            existing_user.main_character_id = seat_user_data.main_character_id;
        }

        return existing_user;
    }

    await createEveCharacter(env, db, character_id);

    const user = await userRepository.create({
        seat_user_id,
        main_character_id: character_id,
    });

    if (!user) {
        throw new Error(`Failed to create user with main character id ${character_id}`);
    }

    const ownership = await characterOwnershipRepository.create({
        user_id: user.id,
        owner_hash,
        character_id,
    })

    if (!ownership) {
        throw new Error(`Failed to create ownership entry for user with id ${user.id} and character with id ${character_id}`);
    }

    return user;
}

export async function getOrCreateUser(env: Env, owner_hash: string, character_id: number, character_name: string): Promise<DbUser> {
    const db = drizzle(env.DB)
    const characterOwnershipRepository = new CharacterOwnershipRepository(db);

    const ownership = await characterOwnershipRepository.get({ owner_hash, character_id }, 1);

    let user: DbUser;

    if (ownership[0]) {
        user = await getExistingUser(env, db, ownership[0].user_id, character_id);
    } else {
        user = await createNewUser(env, db, owner_hash, character_id, character_name);
    }

    return user;
}

export async function getUserFromSession(
    db: DrizzleD1Database<Record<string, never>>,
    ctx: Context,
    permissions?: Permissions[]
): Promise<{ user: DbUser, character: DbCharacter, corporation: DbCorporation, permissions: Permissions[] } | Response> {
    const session = ctx.get('session');
    const user_id = session.get('user_id');

    if (!user_id) {
        ctx.status(401)
        return ctx.text("User not logged in")
    }

    const userRepository = new UserRepository(db);
    const user = await userRepository.getUserMainCharacter(user_id);

    if (!user) {
        ctx.status(404)
        return ctx.text("User not found")
    }

    const admin_character_id = ctx.env.APPLICATION_ADMIN_CHARACTER_ID;

    const mapped_permissions: Permissions[] = [];

    if (user.character.character_id == admin_character_id) {
        mapped_permissions.push(Permissions.Admin);
    } else {
        const user_permissions = await userRepository.getUserPermissions(user.user.id);

        const admin = user_permissions.find(entry => entry.seat_role_permissions.permission === Permissions.Admin);

        if (admin) {
            mapped_permissions.push(Permissions.Admin);
        } else {
            for (const entry of user_permissions) {
                const permission = entry.seat_role_permissions.permission;
                const permission_enum = Object.values(Permissions).find(value => value === permission);
                if (permission_enum === undefined) {
                    console.error(`Unknown permission found in database: ${permission}`);
                } else {
                    mapped_permissions.push(permission_enum);
                }
            }

            if (permissions) {
                for (const permission of permissions) {
                    if (!mapped_permissions.includes(permission)) {
                        ctx.status(403)
                        return ctx.text(`Missing sufficient permissions.`)
                    }
                }
            }
        }
    }

    const result = {
        user: user.user,
        character: user.character,
        corporation: user.corporation,
        permissions: mapped_permissions,
    }

    return result;
}