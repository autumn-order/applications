import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq, isNotNull, isNull, and, count } from "drizzle-orm";

import * as schema from "../schema";
import { DbCharacter } from "./character";
import { DbCorporation } from "./corporation";
import { DbSeatUserRole } from "./seat_user_role";
import { DbSeatRole } from "./seat_role";
import { DbPermission } from "./permission";

export type DbUser = {
  id: number;
  seat_user_id: number | null;
  main_character_id: number;
  created: string;
};

export type CreateDbUser = Omit<DbUser, "id" | "last_updated" | "created">;
export type DbUserFilters = Pick<
  DbUser,
  "id" | "seat_user_id" | "main_character_id"
> & {
  main?: boolean;
  seat_user_exists?: boolean;
};

export default class UserRepository {
  private db: BetterSQLite3Database<Record<string, never>>;

  constructor(db: BetterSQLite3Database<Record<string, never>>) {
    this.db = db;
  }

  async create(user: CreateDbUser): Promise<DbUser | null> {
    const user_values = {
      ...user,
      created: new Date().toISOString(),
    };

    const new_user = await this.db
      .insert(schema.User)
      .values(user_values)
      .returning();
    if (new_user.length === 0) {
      return null;
    } else {
      return new_user[0];
    }
  }

  async get(
    filters: Partial<DbUserFilters>,
    limit?: number,
    offset?: number,
  ): Promise<DbUser[]> {
    let query = this.db.select().from(schema.User);

    if (filters) {
      const conditions = [];

      if (filters.id) {
        //@ts-ignore TODO: set type
        conditions.push(eq(schema.User.id, filters.id));
      }
      if (filters.seat_user_id) {
        //@ts-ignore TODO: set type
        conditions.push(eq(schema.User.seat_user_id, filters.seat_user_id));
      }
      if (filters.main_character_id) {
        //@ts-ignore TODO: set type
        conditions.push(
          eq(schema.User.main_character_id, filters.main_character_id),
        );
      }
      if (filters.main !== undefined) {
        //@ts-ignore TODO: set type
        if (filters.has_main) {
          //@ts-ignore TODO: set type
          conditions.push(isNotNull(schema.User.main_character_id));
        } else {
          //@ts-ignore TODO: set type
          conditions.push(isNull(schema.User.main_character_id));
        }
      }
      if (filters.seat_user_exists !== undefined) {
        //@ts-ignore TODO: set type
        if (filters.seat_user_exists) {
          //@ts-ignore TODO: set type
          conditions.push(isNotNull(schema.User.seat_user_id));
        } else {
          //@ts-ignore TODO: set type
          conditions.push(isNull(schema.User.seat_user_id));
        }
      }

      if (conditions.length > 0) {
        //@ts-ignore TODO: set type
        query = query.where(and(...conditions));
      }
    }

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

  async update(user: DbUser): Promise<DbUser | null> {
    const updated_user = await this.db
      .update(schema.User)
      .set(user)
      .where(eq(schema.User.id, user.id))
      .returning();

    if (updated_user.length === 0) {
      return null;
    } else {
      return updated_user[0];
    }
  }

  async getUserById(id: number): Promise<DbUser | null> {
    const user = await this.db
      .select()
      .from(schema.User)
      .where(eq(schema.User.id, id))
      .limit(1);
    if (user.length === 0) {
      return null;
    } else {
      return user[0];
    }
  }

  async getUserMainCharacter(user_id: number): Promise<{
    user: DbUser;
    character: DbCharacter;
    corporation: DbCorporation;
  } | null> {
    const result = await this.db
      .select()
      .from(schema.User)
      .where(eq(schema.User.id, user_id))
      .innerJoin(
        schema.Character,
        eq(schema.User.main_character_id, schema.Character.character_id),
      )
      .innerJoin(
        schema.Corporation,
        eq(schema.Character.corporation_id, schema.Corporation.corporation_id),
      );

    if (result.length === 0) {
      return null;
    } else {
      return result[0];
    }
  }

  async getUserRoles(
    user_id: number,
    limit?: number,
    offset?: number,
  ): Promise<
    { user: DbUser; seat_user_role: DbSeatUserRole; seat_role: DbSeatRole }[]
  > {
    let query = this.db
      .select()
      .from(schema.User)
      .innerJoin(
        schema.SeatRoleUser,
        eq(schema.User.seat_user_id, schema.SeatRoleUser.seat_user_id),
      )
      .innerJoin(
        schema.SeatRole,
        eq(schema.SeatRoleUser.seat_role_id, schema.SeatRole.seat_role_id),
      )
      .where(eq(schema.User.id, user_id));

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

  async getUserRoleCount(user_id: number): Promise<number> {
    let query = this.db
      .select({ count: count() })
      .from(schema.User)
      .innerJoin(
        schema.SeatRoleUser,
        eq(schema.User.seat_user_id, schema.SeatRoleUser.seat_user_id),
      )
      .innerJoin(
        schema.SeatRole,
        eq(schema.SeatRoleUser.seat_role_id, schema.SeatRole.seat_role_id),
      )
      .where(eq(schema.User.id, user_id));

    const result: { count: number }[] = await query;

    return result[0].count;
  }

  async getUserPermissions(user_id: number): Promise<
    {
      user: DbUser;
      seat_user_role: DbSeatUserRole;
      seat_role_permissions: DbPermission;
    }[]
  > {
    return await this.db
      .select()
      .from(schema.User)
      .innerJoin(
        schema.SeatRoleUser,
        eq(schema.User.seat_user_id, schema.SeatRoleUser.seat_user_id),
      )
      .innerJoin(
        schema.SeatRolePermissions,
        eq(
          schema.SeatRoleUser.seat_role_id,
          schema.SeatRolePermissions.seat_role_id,
        ),
      )
      .where(eq(schema.User.id, user_id));
  }
}
