import StatsRepository from "../../data/stats";

import { Hono } from "hono";
import { Context } from "../../types";
import {
  StatsDto,
  CorporationStatsEntriesDto,
  StatsRequestDto,
} from "../../model/stats";

const statsRoute = new Hono();

export default statsRoute.post("/", async (ctx: Context): Promise<Response> => {
  let body: StatsRequestDto;

  try {
    body = await ctx.req.json();
  } catch (error) {
    ctx.status(400);
    return ctx.text("Invalid request body");
  }

  const statsRepository = new StatsRepository(ctx.var.db);

  let result: StatsDto = {
    corporation_stats: [],
    corporation_stats_entries: [],
  };

  for (const corporation_id of body.statsCorporationIds) {
    const currentStats = await statsRepository.getCurrentStats(corporation_id);

    if (currentStats) {
      result.corporation_stats.push({
        corporation_id: currentStats.corporation_id,
        members: currentStats.members,
        ships_destroyed: currentStats.ships_destroyed,
      });
    }
  }

  for (const corporation_id of body.statsHistoryCorporationIds) {
    const entry_limit = 60;
    const statsEntries = await statsRepository.getEntries(
      corporation_id,
      entry_limit,
    );

    const corporationStatsEntries: CorporationStatsEntriesDto = {
      corporation_id,
      entries: statsEntries.map((entry) => ({
        members: entry.members,
        ships_destroyed: entry.ships_destroyed,
        date: entry.date,
      })),
    };

    result.corporation_stats_entries.push(corporationStatsEntries);
  }

  return ctx.json(result);
});
