import { eq, and } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";

import * as schema from "../schema";

export type dbCharacterOwnership = {
  id: number;
  user_id: number;
  character_id: number;
  owner_hash: string;
};

export type CreateDbCharacterOwnership = Omit<dbCharacterOwnership, "id">;
export type DbCharacterOwnershipFilters = Pick<
  dbCharacterOwnership,
  "user_id" | "character_id" | "owner_hash"
>;

export default class CharacterOwnershipRepository {
  private db: LibSQLDatabase<Record<string, never>>;

  constructor(db: LibSQLDatabase<Record<string, never>>) {
    this.db = db;
  }

  async create(
    characterOwnership: CreateDbCharacterOwnership,
  ): Promise<dbCharacterOwnership | null> {
    const new_characterOwnership = await this.db
      .insert(schema.CharacterOwnership)
      .values(characterOwnership)
      .returning();

    if (new_characterOwnership.length === 0) {
      return null;
    } else {
      return new_characterOwnership[0];
    }
  }

  async update(
    characterOwnership: dbCharacterOwnership,
  ): Promise<dbCharacterOwnership | null> {
    const updated_characterOwnership = await this.db
      .update(schema.CharacterOwnership)
      .set(characterOwnership)
      .where(eq(schema.CharacterOwnership.id, characterOwnership.id))
      .returning();

    if (updated_characterOwnership.length === 0) {
      return null;
    } else {
      return updated_characterOwnership[0];
    }
  }

  async get(
    filters: Partial<dbCharacterOwnership>,
    limit?: number,
    offset?: number,
  ): Promise<dbCharacterOwnership[]> {
    let query = this.db.select().from(schema.CharacterOwnership);

    if (filters) {
      const conditions = [];

      if (filters.user_id) {
        conditions.push(eq(schema.CharacterOwnership.user_id, filters.user_id));
      }
      if (filters.character_id) {
        conditions.push(
          eq(schema.CharacterOwnership.character_id, filters.character_id),
        );
      }
      if (filters.owner_hash) {
        conditions.push(
          eq(schema.CharacterOwnership.owner_hash, filters.owner_hash),
        );
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
}
