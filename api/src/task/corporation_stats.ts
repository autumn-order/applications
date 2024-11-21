import { drizzle } from "drizzle-orm/d1";

import { ZkillCorporationStats } from "model/zkill";
import { Result } from "types";
import StatsRepository, { CreateStatsEntry } from "data/stats";
import { AUTUMN_CORPORATION_IDS, USER_AGENT } from "../constants";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

const ZKILL_CORPORATION_STATS_URL =
  "https://zkillboard.com/api/stats/corporationID";

async function fetchZkillCorporationStats(
  corporationId: number,
): Promise<Result<ZkillCorporationStats>> {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const headers = {
        "User-Agent": `${USER_AGENT(env)}`,
      };
      const response = await fetch(
        `${ZKILL_CORPORATION_STATS_URL}/${corporationId}/`,
        { headers },
      );
      const data = (await response.json()) as ZkillCorporationStats;

      return { success: true, data };
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        return {
          success: false,
          error: `Failed to fetch stats for corporationID ${corporationId} after 3 tries: ${(error as Error)?.message ?? String(error)}`,
        };
      }
    }
  }

  return {
    success: false,
    error: "Unexpected error, exited retry attempt unexpectedly.",
  };
}

export default async function updateCorporationStats(
  db: BetterSQLite3Database,
): Promise<void> {
  const db = drizzle(env.DB);
  const statsRepository = new StatsRepository(db);

  const outdated_corporation_ids =
    await statsRepository.getOutdatedCorporationIds(AUTUMN_CORPORATION_IDS);

  for (const corporation_id of outdated_corporation_ids) {
    const result = await fetchZkillCorporationStats(env, corporation_id);

    if (result.success) {
      const statsEntry: CreateStatsEntry = {
        corporation_id,
        members: result.data.info.memberCount,
        ships_destroyed: result.data.shipsDestroyed ?? 0,
      };

      await statsRepository.createEntry(statsEntry);
    } else {
      throw new Error(
        `Failed to fetch data for corporation ID ${corporation_id}: ${result.error}`,
      );
    }
  }

  console.info(
    `Ran update corporation task, updated data for ${outdated_corporation_ids.length} corporations.`,
  );
}
