import CharacterRepository, { DbCharacter, DbCharacterFilters } from "data/character";
import { GetUserRolesDto, UserCharactersDto, UserRoleDto } from "model/user";
import { DrizzleD1Database } from "drizzle-orm/d1";
import UserRepository, { DbUser } from "data/user";
import { dbCharacterOwnership } from "data/character_ownership";
import { DbCorporation } from "data/corporation";
import { Context } from "types";
import { DbSeatUserRole } from "data/seat_user_role";
import { DbSeatRole } from "data/seat_role";

interface TempUserData {
    id: number;
    main_character: CharacterDto | null;
    characters: CharacterDto[];
}

export async function getUserCharacters(db: DrizzleD1Database<Record<string, never>>, filters: Partial<DbCharacterFilters>, limit: number, page: number): Promise<UserCharactersDto[]> {
    const characterRepository = new CharacterRepository(db);

    const offset = limit * (page - 1);

    const entries: { user: DbUser, character: DbCharacter, corporation: DbCorporation, character_ownership: dbCharacterOwnership }[] = await characterRepository.get(filters, limit, offset);

    const user_characters: UserCharactersDto[] = entries.reduce((acc, entry) => {
        let userDto = acc.find(data => data.id === entry.user.id);

        const characterDto: CharacterDto = {
            character_id: entry.character.character_id,
            character_name: entry.character.character_name,
            corporation_id: entry.corporation.corporation_id,
            corporation_name: entry.corporation.corporation_name
        };

        if (userDto) {
            if (entry.user.main_character_id === entry.character.character_id) {
                userDto.main_character = characterDto;
            } else {
                userDto.characters.push(characterDto);
            }
        } else {
            acc.push({
                id: entry.user.id,
                main_character: entry.user.main_character_id === entry.character.character_id ? characterDto : null,
                characters: entry.user.main_character_id === entry.character.character_id ? [] : [characterDto]
            });
        }

        return acc;
    }, [] as TempUserData[]).filter(user => user.main_character !== null) as UserCharactersDto[];

    return user_characters;
}

export async function getUserRoles(
    db: DrizzleD1Database<Record<string, never>>,
    ctx: Context,
    user_id: number,
    limit: number,
    page: number
): Promise<GetUserRolesDto | Response> {
    const userRepository = new UserRepository(db);
    const user = await userRepository.getUserMainCharacter(user_id);

    if (!user) {
        ctx.status(404)
        return ctx.text("User not found")
    }

    const offset = limit * (page - 1);

    const user_roles = await userRepository.getUserRoles(user_id, limit, offset);
    const user_role_count = await userRepository.getUserRoleCount(user_id);

    const user_roles_dto: UserRoleDto[] = user_roles.map(entry => {
        return {
            id: entry.seat_user_role.id,
            seat_role_id: entry.seat_role.seat_role_id,
            seat_role_name: entry.seat_role.name
        }
    });

    const get_user_roles_dto: GetUserRolesDto = {
        roles: user_roles_dto,
        total: user_role_count
    }

    return get_user_roles_dto;
}