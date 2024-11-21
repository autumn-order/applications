import { LibSQLDatabase } from "drizzle-orm/libsql";
import { eq, and, desc, like, inArray, sql } from "drizzle-orm";

import * as schema from "../schema";
import { DbCorporation } from "./corporation";
import { dbCharacterOwnership } from "./character_ownership";
import { DbUser } from "./user";

export type DbCharacter = {
  id: number;
  character_id: number;
  character_name: string;
  corporation_id: number;
  last_updated: string;
  created: string;
};

export type CreateDbCharacter = Omit<
  DbCharacter,
  "id" | "last_updated" | "created"
>;
export type DbCharacterFilters = Pick<
  DbCharacter,
  "character_id" | "corporation_id"
> & {
  like_character_name?: string;
  exact_character_name?: string;
  character_ids: number[];
  user_ids: number[];
};

export default class CharacterRepository {
  private db: LibSQLDatabase<Record<string, never>>;

  constructor(db: LibSQLDatabase<Record<string, never>>) {
    this.db = db;
  }

  async create(user: CreateDbCharacter): Promise<DbCharacter | null> {
    const user_values = {
      ...user,
      last_updated: new Date().toISOString(),
      created: new Date().toISOString(),
    };

    const new_user = await this.db
      .insert(schema.Character)
      .values(user_values)
      .returning();
    if (new_user.length === 0) {
      return null;
    } else {
      return new_user[0];
    }
  }

  async update(character: DbCharacter): Promise<DbCharacter | null> {
    character.last_updated = new Date().toISOString();

    const updated_user = await this.db
      .update(schema.Character)
      .set(character)
      .where(eq(schema.Character.id, character.id))
      .returning();
    if (updated_user.length === 0) {
      return null;
    } else {
      return updated_user[0];
    }
  }

  async get(
    filters?: Partial<DbCharacterFilters>,
    limit?: number,
    offset?: number,
  ): Promise<
    {
      user: DbUser;
      character: DbCharacter;
      corporation: DbCorporation;
      character_ownership: dbCharacterOwnership;
    }[]
  > {
    let filter_query = this.db
      .select({ id: schema.User.id })
      .from(schema.Character)
      .innerJoin(
        schema.Corporation,
        eq(schema.Character.corporation_id, schema.Corporation.corporation_id),
      )
      .innerJoin(
        schema.CharacterOwnership,
        eq(
          schema.Character.character_id,
          schema.CharacterOwnership.character_id,
        ),
      )
      .innerJoin(
        schema.User,
        eq(schema.CharacterOwnership.user_id, schema.User.id),
      );

    if (filters) {
      const conditions = [];

      if (filters.user_ids) {
        conditions.push(inArray(schema.User.id, filters.user_ids));
      }
      if (filters.character_id) {
        conditions.push(
          eq(schema.Character.character_id, filters.character_id),
        );
      }
      if (filters.character_ids) {
        conditions.push(
          inArray(schema.Character.character_id, filters.character_ids),
        );
      }
      if (filters.corporation_id) {
        conditions.push(
          eq(schema.Character.corporation_id, filters.corporation_id),
        );
      }
      if (filters.like_character_name) {
        conditions.push(
          like(
            schema.Character.character_name,
            `%${filters.like_character_name}%`,
          ),
        );
      }
      if (filters.exact_character_name) {
        conditions.push(
          eq(schema.Character.character_name, filters.exact_character_name),
        );
      }

      if (conditions.length > 0) {
        //@ts-ignore TODO: set type
        filter_query = filter_query.where(and(...conditions));
      }
    }

    let limit_query = this.db
      .select({ id: schema.User.id })
      .from(schema.Character)
      .innerJoin(
        schema.Corporation,
        eq(schema.Character.corporation_id, schema.Corporation.corporation_id),
      )
      .innerJoin(
        schema.CharacterOwnership,
        eq(
          schema.Character.character_id,
          schema.CharacterOwnership.character_id,
        ),
      )
      .innerJoin(
        schema.User,
        eq(
          schema.CharacterOwnership.character_id,
          schema.User.main_character_id,
        ),
      )
      .where(inArray(schema.User.id, filter_query));

    //@ts-ignore TODO: set type
    limit_query = limit_query.orderBy(desc(schema.Character.character_name));

    if (limit) {
      //@ts-ignore TODO: set type
      limit_query = limit_query.limit(limit);
    }

    if (offset) {
      //@ts-ignore TODO: set type
      limit_query = limit_query.offset(offset);
    }

    // filter_query allows search of users via linked characters
    // limit_query will then provide a list of users equal to the set limit
    // This query fetches linked characters up to limit of users, if limit is set to 10 users then linked characters will only be fetched for those 10 users
    const query = this.db
      .select()
      .from(schema.User)
      .innerJoin(
        schema.CharacterOwnership,
        eq(schema.User.id, schema.CharacterOwnership.user_id),
      )
      .innerJoin(
        schema.Character,
        eq(
          schema.CharacterOwnership.character_id,
          schema.Character.character_id,
        ),
      )
      .innerJoin(
        schema.Corporation,
        eq(schema.Character.corporation_id, schema.Corporation.corporation_id),
      )
      .where(inArray(schema.User.id, limit_query));

    return await query;
  }

  async getCharacterCount(
    filters?: Partial<DbCharacterFilters>,
  ): Promise<number> {
    let filter_query = this.db
      .select({ id: schema.User.id })
      .from(schema.Character)
      .innerJoin(
        schema.Corporation,
        eq(schema.Character.corporation_id, schema.Corporation.corporation_id),
      )
      .innerJoin(
        schema.CharacterOwnership,
        eq(
          schema.Character.character_id,
          schema.CharacterOwnership.character_id,
        ),
      )
      .innerJoin(
        schema.User,
        eq(schema.CharacterOwnership.user_id, schema.User.id),
      );

    if (filters) {
      const conditions = [];

      if (filters.character_id) {
        conditions.push(
          eq(schema.Character.character_id, filters.character_id),
        );
      }
      if (filters.character_ids) {
        conditions.push(
          inArray(schema.Character.character_id, filters.character_ids),
        );
      }
      if (filters.corporation_id) {
        conditions.push(
          eq(schema.Character.corporation_id, filters.corporation_id),
        );
      }
      if (filters.like_character_name) {
        conditions.push(
          like(
            schema.Character.character_name,
            `%${filters.like_character_name}%`,
          ),
        );
      }
      if (filters.exact_character_name) {
        conditions.push(
          eq(schema.Character.character_name, filters.exact_character_name),
        );
      }

      if (conditions.length > 0) {
        //@ts-ignore TODO: set type
        filter_query = filter_query.where(and(...conditions));
      }
    }

    // We use 2 queries so that we can allow linked characters to be searched which is then represented via InArray which is an array of users meeting filter requirements
    // If this was done via 1 query then it would return multiple entries for a user rather than a unique user
    const query = this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.Character)
      .innerJoin(
        schema.Corporation,
        eq(schema.Character.corporation_id, schema.Corporation.corporation_id),
      )
      .innerJoin(
        schema.CharacterOwnership,
        eq(
          schema.Character.character_id,
          schema.CharacterOwnership.character_id,
        ),
      )
      .innerJoin(
        schema.User,
        eq(
          schema.CharacterOwnership.character_id,
          schema.User.main_character_id,
        ),
      )
      .where(inArray(schema.User.id, filter_query));

    const result: { count: number }[] = await query;

    return result[0].count;
  }
}
