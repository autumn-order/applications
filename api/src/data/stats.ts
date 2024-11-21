import { LibSQLDatabase } from "drizzle-orm/libsql";
import { desc, eq } from "drizzle-orm";

import * as schema from "../schema";

export type StatsEntry = {
  id?: number;
  corporation_id: number;
  members: number;
  ships_destroyed: number;
  date: string;
};

export type CreateStatsEntry = Omit<StatsEntry, "id" | "date">;

export default class StatsRepository {
  private db: LibSQLDatabase<Record<string, never>>;

  constructor(db: LibSQLDatabase<Record<string, never>>) {
    this.db = db;
  }

  private getTodaysDate(): string {
    return new Date().toISOString().split("T")[0];
  }

  async createEntry(entry: CreateStatsEntry): Promise<void> {
    const entryData: StatsEntry = {
      ...entry,
      date: this.getTodaysDate(),
    };

    await this.db.insert(schema.Stats).values(entryData);
  }

  async getOutdatedCorporationIds(
    corporation_ids: number[],
  ): Promise<number[]> {
    const entries = await this.db
      .select()
      .from(schema.Stats)
      .where(eq(schema.Stats.date, this.getTodaysDate()));
    const corporationIdsWithEntriesForToday = entries.map(
      (entry) => entry.corporation_id,
    );
    return corporation_ids.filter(
      (id) => !corporationIdsWithEntriesForToday.includes(id),
    );
  }

  async getEntries(
    corporation_id: number,
    entries_limit: number,
  ): Promise<StatsEntry[]> {
    return await this.db
      .select()
      .from(schema.Stats)
      .orderBy(desc(schema.Stats.date))
      .where(eq(schema.Stats.corporation_id, corporation_id))
      .limit(entries_limit);
  }

  async getCurrentStats(corporation_id: number): Promise<StatsEntry | null> {
    const result = await this.db
      .select()
      .from(schema.Stats)
      .orderBy(desc(schema.Stats.date))
      .where(eq(schema.Stats.corporation_id, corporation_id))
      .limit(1);
    if (result.length === 0) {
      return null;
    } else {
      return result[0];
    }
  }
}
