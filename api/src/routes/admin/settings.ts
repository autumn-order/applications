import { zValidator } from "@hono/zod-validator";
import SettingRepository from "data/setting";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { DiscordWebhooksDto } from "model/settings";
import { AppHono, Context, } from "types";
import { z } from 'zod';
import { Webhook } from 'discord-webhook-node';
import { getUserFromSession } from "service/auth";
import { Permissions } from "model/permission";

const settingsRoutes: AppHono = new Hono();

const postWebhooksSchema = z.object({
    discord_webhook_new_application: z.string().optional(),
    discord_webhook_application_ready_for_review: z.string().optional(),
    discord_webhook_application_accepted: z.string().optional(),
    discord_webhook_application_rejected: z.string().optional(),
    discord_webhook_application_expired: z.string().optional(),
    discord_webhook_applicant_joined: z.string().optional()
})

const keyEnum = z.enum([
    "discord_webhook_new_application",
    "discord_webhook_application_ready_for_review",
    "discord_webhook_application_accepted",
    "discord_webhook_application_rejected",
    "discord_webhook_application_expired",
    "discord_webhook_applicant_joined"
]);

const testWebhookSchema = z.record(keyEnum, z.string());

const discordWebhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;

settingsRoutes.post("/webhooks",
    zValidator('json', postWebhooksSchema),
    async (ctx: Context) => {
        const db = drizzle(ctx.env.DB);
        const settingsRepository = new SettingRepository(db);

        const user = await getUserFromSession(db, ctx, [Permissions.ManageSettings]);
        if (user instanceof Response) return user

        const body: Partial<DiscordWebhooksDto> = await ctx.req.json();

        if (
            !body.discord_webhook_new_application &&
            !body.discord_webhook_application_ready_for_review &&
            !body.discord_webhook_application_accepted &&
            !body.discord_webhook_application_rejected &&
            !body.discord_webhook_application_expired &&
            !body.discord_webhook_applicant_joined
        ) {
            ctx.status(400);
            return ctx.text("No webhooks provided");
        }

        for (const key in body) {
            if (body.hasOwnProperty(key)) {
                const value = body[key as keyof DiscordWebhooksDto];

                if (value && !discordWebhookRegex.test(value)) {
                    ctx.status(400);
                    return ctx.text(`Invalid ${key} webhook`);
                }

                if (value) {
                    await settingsRepository.set(key, value);
                } else {
                    await settingsRepository.delete(key);
                }
            }
        }

        return ctx.json(body);
    });

settingsRoutes.get("/webhooks",
    async (ctx: Context) => {
        const db = drizzle(ctx.env.DB);
        const settingsRepository = new SettingRepository(db);

        const user = await getUserFromSession(db, ctx, [Permissions.ManageSettings]);
        if (user instanceof Response) return user

        const discordWebhookKeys = [
            "discord_webhook_new_application",
            "discord_webhook_application_ready_for_review",
            "discord_webhook_application_accepted",
            "discord_webhook_application_rejected",
            "discord_webhook_application_expired",
            "discord_webhook_applicant_joined"
        ];

        const response: Partial<DiscordWebhooksDto> = {};

        for (const key of discordWebhookKeys) {
            const value = await settingsRepository.get(key);

            if (value) {
                response[key as keyof DiscordWebhooksDto] = value.value;
            }
        }

        return ctx.json(response);
    });

settingsRoutes.post("/webhooks/test",
    zValidator('json', testWebhookSchema),
    async (ctx: Context) => {
        const db = drizzle(ctx.env.DB);

        const user = await getUserFromSession(db, ctx, [Permissions.ManageSettings]);
        if (user instanceof Response) return user

        const body: Partial<DiscordWebhooksDto> = await ctx.req.json();

        const discordWebhookDescriptions = {
            "discord_webhook_new_application": "New Application",
            "discord_webhook_application_ready_for_review": "Application Ready for Review",
            "discord_webhook_application_accepted": "Applicant Accepted",
            "discord_webhook_application_rejected": "Applicant Rejected",
            "discord_webhook_application_expired": "Application Expired",
            "discord_webhook_applicant_joined": "Applicant Joined"
        };

        for (const key in body) {
            if (body.hasOwnProperty(key)) {
                const value = body[key as keyof DiscordWebhooksDto];

                if (value && !discordWebhookRegex.test(value)) {
                    ctx.status(400);
                    return ctx.text(`Invalid ${key} webhook`);
                }

                if (value) {
                    const hook = new Webhook(value);

                    const description = discordWebhookDescriptions[key as keyof typeof discordWebhookDescriptions] || "Unknown Webhook";

                    try {
                        await hook.info("Webhook test message", "Webhook Type", description);
                    } catch (error: unknown) {
                        if (error instanceof Error) {
                            ctx.status(400);
                            return ctx.text(`Failed to send test message to ${description} webhook: ${error.message}`);
                        } else {
                            ctx.status(500);
                            return ctx.text(`Failed to send test message to ${description} webhook: Unknown error`);
                        }
                    }
                }
            }
        }

        return ctx.text("ok")
    });

export default settingsRoutes;