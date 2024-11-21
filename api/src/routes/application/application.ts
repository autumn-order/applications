import {
  ApplicationInterests,
  ApplicationLanguages,
  ApplicationLocation,
  ApplicationReferrer,
  ApplicationRegion,
} from "../../model/application";
import { Hono } from "hono";
import { AppHono, Context } from "../../types";
import { AUTUMN_CORPORATION_IDS } from "../../constants";
import { getUserFromSession } from "../../service/auth";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import {
  getApplication,
  getApplicationSeatStatus,
  setApplicationDiscordComplete,
  setApplicationLocation,
  setApplicationQuestions,
} from "../../service/application";

const putApplicationLocationSchema = z.object({
  location: z.enum(
    Object.values(ApplicationLocation) as [
      ApplicationLocation.Highsec,
      ApplicationLocation.Nullsec,
    ],
  ),
});

const putApplicationQuestionsSchema = z.object({
  referrer: z.optional(
    z.enum(
      Object.values(ApplicationReferrer) as [
        ApplicationReferrer.CorpFinder,
        ApplicationReferrer.EnglishRecruitment,
        ApplicationReferrer.EveForums,
        ApplicationReferrer.Friend,
        ApplicationReferrer.LocalChat,
        ApplicationReferrer.Other,
        ApplicationReferrer.RedditEve,
        ApplicationReferrer.RedditEveJobs,
      ],
    ),
  ),
  region: z.optional(
    z.enum(
      Object.values(ApplicationRegion) as [
        ApplicationRegion.Africa,
        ApplicationRegion.Asia,
        ApplicationRegion.Australia,
        ApplicationRegion.Europe,
        ApplicationRegion.NorthAmerica,
        ApplicationRegion.SouthAmerica,
      ],
    ),
  ),
  end_goals: z.string(),
  why_autumn: z.string(),
  interests: z.array(
    z.enum(
      Object.values(ApplicationInterests) as [
        ApplicationInterests.CorporationLeadership,
        ApplicationInterests.Exploration,
        ApplicationInterests.FleetCommand,
        ApplicationInterests.Industry,
        ApplicationInterests.Mining,
        ApplicationInterests.PvE,
        ApplicationInterests.PvP,
      ],
    ),
  ),
  languages: z.array(
    z.enum(
      Object.values(ApplicationLanguages) as [
        ApplicationLanguages.Chinese,
        ApplicationLanguages.English,
        ApplicationLanguages.French,
        ApplicationLanguages.German,
        ApplicationLanguages.Japanese,
        ApplicationLanguages.Korean,
        ApplicationLanguages.Russian,
        ApplicationLanguages.Spanish,
      ],
    ),
  ),
});

interface PutApplicationLocationBody {
  location: ApplicationLocation;
}

export interface PutApplicationQuestionsBody {
  referrer: ApplicationReferrer | null;
  region: ApplicationRegion | null;
  end_goals: string;
  why_autumn: string;
  interests: ApplicationInterests[];
  languages: ApplicationLanguages[];
}

const applicationRoute: AppHono = new Hono();

applicationRoute.get("/", async (ctx: Context): Promise<Response> => {
  const user = await getUserFromSession(ctx);
  if (user instanceof Response) return user;

  const application = await getApplication(ctx, user.user.id);
  if (application instanceof Response) return application;

  return ctx.json(application);
});

applicationRoute.get(
  "/seat-status",
  async (ctx: Context): Promise<Response> => {
    const user = await getUserFromSession(ctx);
    if (user instanceof Response) return user;

    if (AUTUMN_CORPORATION_IDS.includes(user.character.corporation_id)) {
      ctx.status(400);
      return ctx.text("Already a member of Autumn");
    }

    const application = await getApplicationSeatStatus(ctx, user.user.id);
    if (application instanceof Response) return application;

    return ctx.json(application);
  },
);

applicationRoute.get(
  "/discord-complete",
  async (ctx: Context): Promise<Response> => {
    const user = await getUserFromSession(ctx);
    if (user instanceof Response) return user;

    if (AUTUMN_CORPORATION_IDS.includes(user.character.corporation_id)) {
      ctx.status(400);
      return ctx.text("Already a member of Autumn");
    }

    const application = await setApplicationDiscordComplete(ctx, user.user.id);
    if (application instanceof Response) return application;

    return ctx.json(application);
  },
);

applicationRoute.put(
  "/location",
  zValidator("json", putApplicationLocationSchema),
  async (ctx: Context): Promise<Response> => {
    const body: PutApplicationLocationBody = await ctx.req.json();

    const user = await getUserFromSession(ctx);
    if (user instanceof Response) return user;

    if (AUTUMN_CORPORATION_IDS.includes(user.character.corporation_id)) {
      ctx.status(400);
      return ctx.text("Already a member of Autumn");
    }

    const application = await setApplicationLocation(
      ctx,
      user.user.id,
      body.location,
    );
    if (application instanceof Response) return application;

    return ctx.json(application);
  },
);

applicationRoute.put(
  "/questions",
  zValidator("json", putApplicationQuestionsSchema),
  async (ctx: Context): Promise<Response> => {
    const user = await getUserFromSession(ctx);
    if (user instanceof Response) return user;

    if (AUTUMN_CORPORATION_IDS.includes(user.character.corporation_id)) {
      ctx.status(400);
      return ctx.text("Already a member of Autumn");
    }

    const body: PutApplicationQuestionsBody = await ctx.req.json();

    const application = await setApplicationQuestions(ctx, user.user.id, body);
    if (application instanceof Response) return application;

    return ctx.json(application);
  },
);

export default applicationRoute;
