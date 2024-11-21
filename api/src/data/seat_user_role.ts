import { and, eq, inArray, desc, or, count } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import * as schema from "../schema";
import { DbUser } from "./user";
import { DbCharacter } from "./character";
import { DbCorporation } from "./corporation";

export type DbSeatUserRole = {
  id: number;
  seat_user_id: number;
  seat_role_id: number;
};

export type DbCreateSeatUserRole = Omit<DbSeatUserRole, "id">;
export type DbSeatUserRoleFilters = {
  seat_role_ids: number[];
};

interface ConsolidatedRoleUsers {
  role_id: number;
  user_ids: number[];
}

export default class SeatRoleUserRepository {
  private db: BetterSQLite3Database<Record<string, never>>;

  constructor(db: BetterSQLite3Database<Record<string, never>>) {
    this.db = db;
  }

  private consolidateEntries(
    entries: { role_id: number; user_id: number }[],
  ): ConsolidatedRoleUsers[] {
    const map = new Map<number, number[]>();

    entries.forEach((entry) => {
      if (map.has(entry.role_id)) {
        map.get(entry.role_id)!.push(entry.user_id);
      } else {
        map.set(entry.role_id, [entry.user_id]);
      }
    });

    const consolidatedEntries: ConsolidatedRoleUsers[] = [];
    map.forEach((user_ids, role_id) => {
      consolidatedEntries.push({ role_id, user_ids });
    });

    return consolidatedEntries;
  }

  async get(
    filters?: Partial<DbSeatUserRoleFilters>,
    limit?: number,
    offset?: number,
  ): Promise<{ seat_user_role: DbSeatUserRole; user: DbUser }[]> {
    let query = this.db
      .select()
      .from(schema.SeatRoleUser)
      .innerJoin(
        schema.User,
        eq(schema.SeatRoleUser.seat_user_id, schema.User.seat_user_id),
      );

    if (filters) {
      const conditions = [];

      if (filters.seat_role_ids) {
        conditions.push(
          inArray(schema.SeatRoleUser.seat_role_id, filters.seat_role_ids),
        );
      }

      if (conditions.length > 0) {
        //@ts-ignore TODO: set type
        query = query.where(and(...conditions));
      }
    }

    //@ts-ignore TODO: set type
    query = query.orderBy(desc(schema.SeatRoleUser.seat_user_id));

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

  async getRoleUserCount(seat_role_id: number): Promise<number> {
    let query = this.db
      .select({ count: count() })
      .from(schema.SeatRoleUser)
      .where(eq(schema.SeatRoleUser.seat_role_id, seat_role_id));

    const result: { count: number }[] = await query;

    return result[0].count;
  }

  async create(
    new_entries: { role_id: number; user_id: number }[],
  ): Promise<DbSeatUserRole[]> {
    const roles = new_entries.map((entry) => ({
      seat_role_id: entry.role_id,
      seat_user_id: entry.user_id,
    }));

    return await this.db.insert(schema.SeatRoleUser).values(roles).returning();
  }

  async delete(entries: { role_id: number; user_id: number }[]): Promise<void> {
    const consolidatedEntries = this.consolidateEntries(entries);

    const conditions = [];

    for (const entry of consolidatedEntries) {
      conditions.push(
        and(
          eq(schema.SeatRoleUser.seat_role_id, entry.role_id),
          inArray(schema.SeatRoleUser.seat_user_id, entry.user_ids),
        ),
      );
    }

    if (conditions.length === 0) {
      return;
    }

    await this.db.delete(schema.SeatRoleUser).where(or(...conditions));
  }

  async deleteEntriesByRoleId(role_ids: number[]): Promise<void> {
    await this.db
      .delete(schema.SeatRoleUser)
      .where(inArray(schema.SeatRoleUser.seat_role_id, role_ids));
  }
}
