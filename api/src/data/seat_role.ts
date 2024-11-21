import { like, desc, inArray, eq, and, sql, count } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import * as schema from "schema";

export type DbSeatRole = {
  id: number;
  seat_role_id: number;
  name: string;
};

export type DbCreateSeatRole = Omit<DbSeatRole, "id">;
export type DbSeatRoleFilters = Pick<DbSeatRole, "id"> & {
  like_name?: string;
};

export default class SeatRoleRepository {
  private db: BetterSQLite3Database<Record<string, never>>;

  constructor(db: BetterSQLite3Database<Record<string, never>>) {
    this.db = db;
  }

  async get(
    filters?: Partial<DbSeatRoleFilters>,
    limit?: number,
    offset?: number,
  ): Promise<DbSeatRole[]> {
    let query = this.db.select().from(schema.SeatRole);

    if (filters) {
      const conditions = [];

      if (filters.id) {
        conditions.push(eq(schema.SeatRole.id, filters.id));
      }

      if (filters.like_name) {
        conditions.push(like(schema.SeatRole.name, `%${filters.like_name}%`));
      }

      if (conditions.length > 0) {
        //@ts-ignore TODO: set type
        query = query.where(and(...conditions));
      }
    }

    //@ts-ignore TODO: set type
    query = query.orderBy(desc(schema.SeatRole.name));

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

  async getRoleMemberCount(
    role_ids: number[],
  ): Promise<{ seat_role_id: number; count: number }[]> {
    let query = this.db
      .select({
        count: count(),
        seat_role_id: schema.SeatRoleUser.seat_role_id,
      })
      .from(schema.SeatRoleUser)
      .groupBy(schema.SeatRoleUser.seat_role_id);

    //@ts-ignore TODO: set type
    query = query.where(inArray(schema.SeatRoleUser.seat_role_id, role_ids));

    return await query;
  }

  async getRoleCount(filters?: Partial<DbSeatRoleFilters>): Promise<number> {
    let query = this.db.select({ count: count() }).from(schema.SeatRole);

    if (filters) {
      const conditions = [];

      if (filters.id) {
        conditions.push(eq(schema.SeatRole.id, filters.id));
      }

      if (filters.like_name) {
        conditions.push(like(schema.SeatRole.name, `%${filters.like_name}%`));
      }

      if (conditions.length > 0) {
        //@ts-ignore TODO: set type
        query = query.where(and(...conditions));
      }
    }

    const result: { count: number }[] = await query;

    return result[0].count;
  }

  async create(roles: DbCreateSeatRole[]): Promise<DbSeatRole[]> {
    return await this.db.insert(schema.SeatRole).values(roles).returning();
  }

  async deleteRolesById(role_ids: number[]): Promise<void> {
    await this.db
      .delete(schema.SeatRole)
      .where(inArray(schema.SeatRole.seat_role_id, role_ids));
  }
}
