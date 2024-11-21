import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq, inArray } from "drizzle-orm";

import * as schema from "../schema";

export type DbCorporation = {
  id?: number;
  corporation_id: number;
  corporation_name: string;
};

export type DbCreateCorporation = Omit<DbCorporation, "id">;

export default class CorporationRepository {
  private db: BetterSQLite3Database<Record<string, never>>;

  constructor(db: BetterSQLite3Database<Record<string, never>>) {
    this.db = db;
  }

  async createCorporation(
    corporation: DbCreateCorporation,
  ): Promise<DbCorporation | null> {
    const corp_values: DbCorporation = {
      ...corporation,
    };

    const created_corporation = await this.db
      .insert(schema.Corporation)
      .values(corp_values)
      .returning();
    if (created_corporation.length === 0) {
      return null;
    } else {
      return created_corporation[0];
    }
  }

  async getCorporations(user_ids: number[]): Promise<DbCorporation[]> {
    return await this.db
      .select()
      .from(schema.Corporation)
      .where(inArray(schema.Corporation.corporation_id, user_ids));
  }

  async getCorporation(corporation_id: number): Promise<DbCorporation | null> {
    const corporation = await this.db
      .select()
      .from(schema.Corporation)
      .where(eq(schema.Corporation.corporation_id, corporation_id))
      .limit(1);

    if (corporation.length === 0) {
      return null;
    } else {
      return corporation[0];
    }
  }
}
