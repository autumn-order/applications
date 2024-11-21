import PermissionRepository from "../data/permission";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { Permissions, RolePermissionsDto } from "../model/permission";
import { Context } from "../types";

export async function getRolePermissions(
  db: BetterSQLite3Database<Record<string, never>>,
  ctx: Context,
  seat_role_id: number,
  page: number,
  limit: number,
): Promise<RolePermissionsDto | Response> {
  const permissionRepository = new PermissionRepository(db);

  const offset = limit * (page - 1);

  const permissions = await permissionRepository.get(
    seat_role_id,
    limit,
    offset,
  );

  const mappedPermissions: Permissions[] = [];

  for (const p of permissions) {
    const permission = Object.values(Permissions).find(
      (value) => value === p.permission,
    );
    if (permission === undefined) {
      console.error(`Unknown permission found in database: ${p.permission}`);
    } else {
      mappedPermissions.push(permission);
    }
  }

  const count = await permissionRepository.getCount(seat_role_id);

  return {
    permissions: mappedPermissions,
    total: count,
  };
}

export async function setRolePermissions(
  ctx: Context,
  seat_role_id: number,
  permissions: Permissions[],
): Promise<RolePermissionsDto | Response> {
  const permissionRepository = new PermissionRepository(ctx.var.db);

  const result = await permissionRepository.set(
    seat_role_id,
    permissions.map((p) => p.toString()),
  );

  const mappedPermissions: Permissions[] = [];

  for (const p of result) {
    const permission = Object.values(Permissions).find(
      (value) => value === p.permission,
    );
    if (permission === undefined) {
      console.error(`Unknown permission found in database: ${p.permission}`);
      ctx.status(500);
      return ctx.text("Internal Server Error");
    }
    mappedPermissions.push(permission);
  }

  const count = await permissionRepository.getCount(seat_role_id);

  return {
    permissions: mappedPermissions,
    total: count,
  };
}
