
import SettingRepository from "data/setting";
import { MessageBuilder, Webhook } from "discord-webhook-node";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { ApplicationLocation } from "model/application";
import { GetApplicationResult } from "data/application";
import { UserDto } from "model/user";

async function sendEmbed(embed: MessageBuilder, webhook: string): Promise<void> {
    const hook = new Webhook(webhook);

    try {
        await hook.send(embed);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Failed to send new application notification to webhook: ${error.message}`);
        } else {
            console.error(`Failed to send new application notification to webhook: Unknown error`);
        }
    }
}

function getCorpInfo(location: string): { corporation_name: string, corporation_logo: string } {
    if (location === ApplicationLocation.Highsec) {
        return { corporation_name: "Autumn Highsec Division", corporation_logo: "https://images.evetech.net/corporations/98784256/logo?size=32" };
    } else {
        return { corporation_name: "The Order of Autumn", corporation_logo: "https://images.evetech.net/corporations/98785281/logo?size=32" };
    }
}

export async function sendNewApplicationNotification(
    db: DrizzleD1Database<Record<string, never>>,
    env: Env,
    application: GetApplicationResult
): Promise<void> {
    const settingsRepository = new SettingRepository(db);
    const webhook = await settingsRepository.get("discord_webhook_new_application")

    if (!webhook) {
        return;
    }

    const { corporation_name, corporation_logo } = getCorpInfo(application.application.location);

    const embed = new MessageBuilder()
        .setTitle("New Application")
        .setURL(`${env.APPLICATION_FRONTEND_URL}/admin/applications/${application.application.id}`)
        .setAuthor(application.character.character_name, `https://images.evetech.net/characters/${application.character.character_id}/portrait?size=32`, `https://zkillboard.com/character/${application.character.character_id}/`)
        .setDescription(`New application from ${application.character.character_name} to ${corporation_name}.`)
        .addField("Current Corporation", application.corporation.corporation_name)
        .setFooter(corporation_name, corporation_logo)
        .setTimestamp();

    await sendEmbed(embed, webhook.value);
}

export async function sendReviewReadyApplicationNotification(
    db: DrizzleD1Database<Record<string, never>>,
    env: Env,
    application: GetApplicationResult
): Promise<void> {
    const settingsRepository = new SettingRepository(db);
    const webhook = await settingsRepository.get("discord_webhook_application_ready_for_review")

    if (!webhook) {
        return;
    }

    const { corporation_name, corporation_logo } = getCorpInfo(application.application.location);

    const embed = new MessageBuilder()
        .setTitle("Application Ready for Review")
        .setURL(`${env.APPLICATION_FRONTEND_URL}/admin/applications/${application.application.id}`)
        .setAuthor(application.character.character_name, `https://images.evetech.net/characters/${application.character.character_id}/portrait?size=32`, `https://zkillboard.com/character/${application.character.character_id}/`)
        .setDescription(`${application.character.character_name} has completed all application steps to join ${corporation_name} and is ready for review!`)
        .setFooter(corporation_name, corporation_logo)
        .setTimestamp();

    await sendEmbed(embed, webhook.value);
}

export async function sendAcceptedApplicationNotification(
    db: DrizzleD1Database<Record<string, never>>,
    env: Env,
    application: GetApplicationResult,
    reviewer: UserDto
): Promise<void> {
    const settingsRepository = new SettingRepository(db);
    const webhook = await settingsRepository.get("discord_webhook_application_accepted")

    if (!webhook) {
        return;
    }

    const corporation_name = getCorpInfo(application.application.location).corporation_name;

    const embed = new MessageBuilder()
        .setTitle("Application Accepted")
        .setURL(`${env.APPLICATION_FRONTEND_URL}/admin/applications/${application.application.id}`)
        .setAuthor(application.character.character_name, `https://images.evetech.net/characters/${application.character.character_id}/portrait?size=32`, `https://zkillboard.com/character/${application.character.character_id}/`)
        .setDescription(`${application.character.character_name}'s application to ${corporation_name} has been accepted!`)
        .setFooter(`Reviewer: ${reviewer.character_name}`, `https://images.evetech.net/characters/${reviewer.character_id}/portrait?size=32`)
        .setTimestamp();

    await sendEmbed(embed, webhook.value);
}

export async function sendRejectedApplicationNotification(
    db: DrizzleD1Database<Record<string, never>>,
    env: Env,
    application: GetApplicationResult,
    reviewer: UserDto
): Promise<void> {
    const settingsRepository = new SettingRepository(db);
    const webhook = await settingsRepository.get("discord_webhook_application_rejected")

    if (!webhook) {
        return;
    }

    const corporation_name = getCorpInfo(application.application.location).corporation_name;

    const embed = new MessageBuilder()
        .setTitle("Application Rejected")
        .setURL(`${env.APPLICATION_FRONTEND_URL}/admin/applications/${application.application.id}`)
        .setAuthor(application.character.character_name, `https://images.evetech.net/characters/${application.character.character_id}/portrait?size=32`, `https://zkillboard.com/character/${application.character.character_id}/`)
        .setDescription(`${application.character.character_name}'s application to ${corporation_name} has been rejected.`)
        .addField("Rejection Reason", application.application.rejection_reason)
        .setFooter(`${reviewer.character_name}`, `https://images.evetech.net/characters/${reviewer.character_id}/portrait?size=32`)
        .setTimestamp();

    await sendEmbed(embed, webhook.value);
}

export async function sendExpiredApplicationNotification(
    db: DrizzleD1Database<Record<string, never>>,
    env: Env,
    application: GetApplicationResult,
): Promise<void> {
    const settingsRepository = new SettingRepository(db);
    const webhook = await settingsRepository.get("discord_webhook_application_expired")

    if (!webhook) {
        return;
    }

    const { corporation_name, corporation_logo } = getCorpInfo(application.application.location);

    const embed = new MessageBuilder()
        .setTitle("Application Expired")
        .setURL(`${env.APPLICATION_FRONTEND_URL}/admin/applications/${application.application.id}`)
        .setAuthor(application.character.character_name, `https://images.evetech.net/characters/${application.character.character_id}/portrait?size=32`, `https://zkillboard.com/character/${application.character.character_id}/`)
        .setDescription(`${application.character.character_name}'s application to ${corporation_name} has expired after 30 days of inactivity.`)
        .setFooter(`${corporation_name}`, corporation_logo)
        .setTimestamp();

    await sendEmbed(embed, webhook.value);
}

export async function sendJoinedApplicationNotification(
    db: DrizzleD1Database<Record<string, never>>,
    env: Env,
    application: GetApplicationResult,
): Promise<void> {
    const settingsRepository = new SettingRepository(db);
    const webhook = await settingsRepository.get("discord_webhook_applicant_joined")

    if (!webhook) {
        return;
    }

    const { corporation_name, corporation_logo } = getCorpInfo(application.application.location);

    const embed = new MessageBuilder()
        .setTitle("Applicant Joined")
        .setURL(`${env.APPLICATION_FRONTEND_URL}/admin/applications/${application.application.id}`)
        .setAuthor(application.character.character_name, `https://images.evetech.net/characters/${application.character.character_id}/portrait?size=32`, `https://zkillboard.com/character/${application.character.character_id}/`)
        .setDescription(`${application.character.character_name} has joined ${corporation_name}!`)
        .setFooter(`${corporation_name}`, corporation_logo)
        .setTimestamp();

    await sendEmbed(embed, webhook.value);
}