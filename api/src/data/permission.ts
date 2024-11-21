import { LibSQLDatabase } from "drizzle-orm/libsql";
import { eq, and, count } from "drizzle-orm";

import * as schema from "../schema";

export type DbPermission = {
  id: number;
  seat_role_id: number;
  permission: string;
};

export default class PermissionRepository {
  private db: LibSQLDatabase<Record<string, never>>;

  constructor(db: LibSQLDatabase<Record<string, never>>) {
    this.db = db;
  }

  async get(
    seat_role_id: number,
    limit?: number,
    offset?: number,
  ): Promise<DbPermission[]> {
    let query = this.db
      .select()
      .from(schema.SeatRolePermissions)
      .where(eq(schema.SeatRolePermissions.seat_role_id, seat_role_id));

    if (limit) {
      //@ts-ignore TODO: set type
      query = query.limit(limit);
    }

    if (offset) {
      //@ts-ignore TODO: set type
      query = query.offset(offset);
    }

    return await query;
  }

  async getCount(seat_role_id: number): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(schema.SeatRolePermissions)
      .where(eq(schema.SeatRolePermissions.seat_role_id, seat_role_id));

    return result.count;
  }

  async set(
    seat_role_id: number,
    permissions: string[],
  ): Promise<DbPermission[]> {
    const existing_permissions = await this.get(seat_role_id);
    const existing_permissions_set = new Set(
      existing_permissions.map((p) => p.permission),
    );

    const result: DbPermission[] = [];

    for (const existing_permission of existing_permissions) {
      if (!permissions.includes(existing_permission.permission)) {
        await this.db
          .delete(schema.SeatRolePermissions)
          .where(
            and(
              eq(schema.SeatRolePermissions.seat_role_id, seat_role_id),
              eq(
                schema.SeatRolePermissions.permission,
                existing_permission.permission,
              ),
            ),
          );
      } else {
        result.push(existing_permission);
      }
    }

    for (const permission of permissions) {
      if (!existing_permissions_set.has(permission)) {
        const entry = await this.db
          .insert(schema.SeatRolePermissions)
          .values({ seat_role_id, permission })
          .returning()
          .get();

        result.push(entry);
      }
    }

    return result;
  }
}
