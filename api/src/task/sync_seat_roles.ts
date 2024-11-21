import SeatRoleRepository, {
  DbCreateSeatRole,
  DbSeatRole,
} from "../data/seat_role";
import SeatRoleUserRepository, { DbSeatUserRole } from "../data/seat_user_role";
import UserRepository from "../data/user";
import { fetchSeatRoleDetails, fetchSeatRoles } from "../utils/seat/role";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

interface RoleUserEntries {
  role_id: number;
  user_id: number;
}

async function updateSeatRoles(
  db: BetterSQLite3Database<Record<string, never>>,
): Promise<DbSeatRole[]> {
  const roles = await fetchSeatRoles(1);

  const total_pages = roles.meta.last_page;

  for (let i = 2; i <= total_pages; i++) {
    const page_roles = await fetchSeatRoles(i);

    roles.data = roles.data.concat(page_roles.data);
  }

  const seatRoleRepository = new SeatRoleRepository(db);
  const seatRoleUserRepository = new SeatRoleUserRepository(db);

  let existing_roles = await seatRoleRepository.get();

  const removed_role_ids = existing_roles
    .filter(
      (existing_role) =>
        !roles.data.some((role) => role.id === existing_role.seat_role_id),
    )
    .map((role) => role.seat_role_id);
  if (removed_role_ids.length > 0) {
    await seatRoleUserRepository.deleteEntriesByRoleId(removed_role_ids);
    await seatRoleRepository.deleteRolesById(removed_role_ids);

    existing_roles = existing_roles.filter(
      (existing_role) => !removed_role_ids.includes(existing_role.seat_role_id),
    );
  }

  const new_roles: DbCreateSeatRole[] = roles.data
    .filter(
      (role) =>
        !existing_roles.some(
          (existing_role) => existing_role.seat_role_id === role.id,
        ),
    )
    .map((role) => ({ seat_role_id: role.id, name: role.title }));

  if (new_roles.length > 0) {
    const created_roles = await seatRoleRepository.create(new_roles);
    existing_roles.push(...created_roles);
  }

  return existing_roles;
}

async function getRoleUsers(
  role_id: number,
  existing_entries: DbSeatUserRole[],
  linked_seat_user_ids: number[],
): Promise<{
  new_entries: RoleUserEntries[];
  delete_entries: RoleUserEntries[];
}> {
  const role_info = await fetchSeatRoleDetails(role_id);
  const role_members = role_info.data.members;

  const removed_users = existing_entries
    .filter(
      (existing_entry) =>
        !role_members.some(
          (user_id) =>
            user_id === existing_entry.seat_user_id &&
            role_id === existing_entry.seat_role_id,
        ),
    )
    .map((user) => user.seat_user_id);

  const delete_entries = removed_users.map((user_id) => ({
    role_id: role_id,
    user_id,
  }));

  const new_users = role_members
    .filter(
      (user_id) =>
        !existing_entries.some(
          (existing_entry) =>
            existing_entry.seat_user_id === user_id &&
            existing_entry.seat_role_id === role_id,
        ) && linked_seat_user_ids.includes(user_id),
    )
    .map((user_id) => user_id);

  const new_entries = new_users.map((user_id) => ({
    role_id: role_id,
    user_id,
  }));

  return { new_entries, delete_entries };
}

async function updateSeatRoleUsers(
  db: BetterSQLite3Database<Record<string, never>>,
  existing_roles: DbSeatRole[],
) {
  const userRepository = new UserRepository(db);
  const role_ids = existing_roles.map((role) => role.seat_role_id);

  const seatRoleUserRepository = new SeatRoleUserRepository(db);

  const existing_entries = await seatRoleUserRepository.get({
    seat_role_ids: role_ids,
  });
  const linked_seat_users = await userRepository.get({
    seat_user_exists: true,
  });

  const linked_seat_user_ids: number[] = linked_seat_users
    .map((user) => user.seat_user_id)
    .filter((user_id): user_id is number => user_id !== null);

  const total_new_entries: RoleUserEntries[] = [];
  const total_delete_entries: RoleUserEntries[] = [];

  for (const role of existing_roles) {
    const { new_entries, delete_entries } = await getRoleUsers(
      role.seat_role_id,
      existing_entries.map((e) => e.seat_user_role),
      linked_seat_user_ids,
    );

    total_new_entries.push(...new_entries);
    total_delete_entries.push(...delete_entries);
  }

  if (total_delete_entries.length > 0) {
    await seatRoleUserRepository.delete(total_delete_entries);
  }

  if (total_new_entries.length > 0) {
    await seatRoleUserRepository.create(total_new_entries);
  }
}

export default async function syncSeatRoles(
  db: BetterSQLite3Database,
): Promise<string> {
  const existing_roles = await updateSeatRoles(db);
  await updateSeatRoleUsers(db, existing_roles);

  return "Synced seat roles successfully";
}
