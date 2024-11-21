import { Hono } from "hono";
import { AppHono, Context } from "types";

import { drizzle } from "drizzle-orm/d1";
import ApplicationRepository, { DbApplicationFilters, UpdateDbApplication } from "data/application";
import { ApplicationLocation, ApplicationStatus, GetApplicationsDto } from "model/application";
import convertToApplicationDto from "lib/convert_application_to_dto";
import UserRepository, { DbUser } from "data/user";
import convertUserToDto from "lib/convert_user_to_dto";
import { UserDto } from "model/user";
import CharacterRepository, { DbCharacter } from "data/character";
import { sendAcceptedApplicationNotification, sendRejectedApplicationNotification } from "service/webhook";
import { Permissions } from "model/permission";
import { getUserFromSession } from "service/auth";
import { DbCorporation } from "data/corporation";
import { z } from 'zod';
import { zValidator } from "@hono/zod-validator";

const putApplicationStatusSchema = z.object({
    status: z.enum(Object.values(ApplicationStatus) as [
        ApplicationStatus.Rejected,
        ApplicationStatus.Accepted,
        ApplicationStatus.Cancelled,
    ]),
    rejection_reason: z.string().optional()
});

interface PutApplicationStatusBody {
    status: ApplicationStatus;
    rejection_reason?: string;
}

const applicationRoutes: AppHono = new Hono();

function parseStatus(statusParam: string | undefined): ApplicationStatus | undefined {
    if (statusParam && Object.values(ApplicationStatus).includes(statusParam as ApplicationStatus)) {
        return statusParam as ApplicationStatus;
    }
    return undefined;
}

function parseLocation(locationParam: string | undefined): ApplicationLocation | undefined {
    if (locationParam && Object.values(ApplicationLocation).includes(locationParam as ApplicationLocation)) {
        return locationParam as ApplicationLocation;
    }
    return undefined;
}

function parseBoolean(param: string | undefined): boolean | undefined {
    if (param === undefined) return undefined;
    return param.toLowerCase() === 'true';
}

applicationRoutes.get("/", async (ctx: Context) => {
    const limitParam: string | undefined = ctx.req.query('limit');
    const pageParam: string | undefined = ctx.req.query('page');

    if (!limitParam || !pageParam) {
        ctx.status(400)
        return ctx.text('Missing limit or page parameter');
    }

    const limit: number = parseInt(limitParam, 10);
    const page: number = parseInt(pageParam, 10);

    if (isNaN(limit) || isNaN(page)) {
        ctx.status(400)
        return ctx.text('Invalid limit or page parameter');
    }

    const statusQueryParam: string | undefined = ctx.req.query('status');
    const locationQueryParam: string | undefined = ctx.req.query('location');
    const discordQueryParam: string | undefined = ctx.req.query('discord_completed');
    const seatQueryParam: string | undefined = ctx.req.query('seat_completed');
    const userQueryParam: string | undefined = ctx.req.query('user');
    const characterQueryParam: string | undefined = ctx.req.query('character');

    const application_filters: Partial<DbApplicationFilters> = {};

    if (statusQueryParam) {
        const application_status: ApplicationStatus | undefined = parseStatus(statusQueryParam)
        if (application_status === undefined) {
            ctx.status(400)
            return ctx.text('Invalid status parameter');
        } else {
            application_filters.status = application_status;
        }
    }
    if (locationQueryParam) {
        const application_location: ApplicationLocation | undefined = parseLocation(locationQueryParam)
        if (application_location === undefined) {
            ctx.status(400)
            return ctx.text('Invalid location parameter');
        } else {
            application_filters.location = application_location;
        }
    }
    if (discordQueryParam) {
        const application_discord_completed: boolean | undefined = parseBoolean(discordQueryParam);
        if (application_discord_completed === undefined) {
            ctx.status(400)
            return ctx.text('Invalid discord completed parameter');
        } else {
            application_filters.discord_completed = application_discord_completed ? 1 : 0;
        }
    }
    if (seatQueryParam) {
        const application_seat_completed: boolean | undefined = parseBoolean(seatQueryParam);
        if (application_seat_completed === undefined) {
            ctx.status(400)
            return ctx.text('Invalid seat completed parameter');
        } else {
            application_filters.seat_completed = application_seat_completed ? 1 : 0;
        }
    }
    if (userQueryParam) {
        const application_user_id: number = parseInt(userQueryParam);
        if (isNaN(application_user_id)) {
            ctx.status(400)
            return ctx.text('Invalid seat completed parameter');
        } else {
            application_filters.user_id = application_user_id;
        }
    }

    const db = drizzle(ctx.env.DB);

    const userRepository = new UserRepository(db);
    const characterRepository = new CharacterRepository(db);
    const applicationRepository = new ApplicationRepository(db);

    const user = await getUserFromSession(db, ctx, [Permissions.ViewApplication]);
    if (user instanceof Response) return user;

    if (characterQueryParam) {
        const character_name = characterQueryParam;
        const result = await characterRepository.get({ like_character_name: character_name });

        application_filters.user_ids = result
            .map(user => user.character_ownership)
            .filter(ownership => ownership !== null)
            .map(ownership => ownership.user_id);
    }

    const offset = limit * (page - 1);

    const applications = await applicationRepository.get(application_filters, limit, offset);

    let applicationDtos = [];

    for (const application of applications) {
        let reviewer_user_dto: UserDto | undefined = undefined;
        if (application.application.reviewer_user_id) {
            const reviewer = await userRepository.getUserMainCharacter(application.application.reviewer_user_id)
            if (!reviewer) {
                throw new Error(`Reviewing User with ID ${application.application.reviewer_user_id} not found for application ID ${application.application.id}`);
            }

            reviewer_user_dto = convertUserToDto(reviewer.user.id, reviewer.character, reviewer.corporation)
        }

        const user_dto = convertUserToDto(application.user.id, application.character, application.corporation);
        applicationDtos.push(convertToApplicationDto(application.application, user_dto, application.interests, application.languages, reviewer_user_dto));
    }

    const total_application_entries = await applicationRepository.getApplicationCount(application_filters);

    const GetApplicationsDto: GetApplicationsDto = {
        applications: applicationDtos,
        total: total_application_entries
    }

    return ctx.json(GetApplicationsDto);
});

applicationRoutes.get("/:id", async (ctx: Context) => {
    const applicationIdParam: string = ctx.req.param('id');
    const applicationId: number = parseInt(applicationIdParam, 10);

    if (isNaN(applicationId)) {
        ctx.status(400);
        return ctx.text('Invalid application ID');
    }

    const db = drizzle(ctx.env.DB);
    const userRepository = new UserRepository(db);
    const applicationRepository = new ApplicationRepository(db);

    const user = await getUserFromSession(db, ctx, [Permissions.ViewApplication]);
    if (user instanceof Response) return user

    const applications = await applicationRepository.get({ id: applicationId });

    if (!applications[0]) {
        ctx.status(404)
        return ctx.text('Application not found');
    }

    const application = applications[0]

    const user_dto = convertUserToDto(application.user.id, application.character, application.corporation);

    let reviewer_user_dto: UserDto | undefined = undefined;
    if (application.application.reviewer_user_id) {
        const reviewer = await userRepository.getUserMainCharacter(application.application.reviewer_user_id)
        if (!reviewer) {
            throw new Error(`Reviewing User with ID ${application.application.reviewer_user_id} not found for application ID ${application.application.id}`);
        }

        reviewer_user_dto = convertUserToDto(reviewer.user.id, reviewer.character, reviewer.corporation)
    }

    return ctx.json(convertToApplicationDto(application.application, user_dto, application.interests, application.languages, reviewer_user_dto));
});

applicationRoutes.put(
    "/:id/status",
    zValidator('json', putApplicationStatusSchema),
    async (ctx: Context) => {
        const param = ctx.req.param();
        const query = ctx.req.query();
        const { application_id }: { application_id: number } = {
            application_id: parseInt(param.id, 10)
        };
        const { status, rejection_reason }: PutApplicationStatusBody = await ctx.req.json();

        console.log(query.status)

        const db = drizzle(ctx.env.DB);
        const applicationRepository = new ApplicationRepository(db);

        let user: { user: DbUser, character: DbCharacter, corporation: DbCorporation, permissions: Permissions[] };
        if (status === ApplicationStatus.Rejected || status === ApplicationStatus.Cancelled) {
            const result = await getUserFromSession(db, ctx, [Permissions.RejectApplication]);
            if (result instanceof Response) return result;

            user = result;
        } else if (status === ApplicationStatus.Accepted) {
            const result = await getUserFromSession(db, ctx, [Permissions.AcceptApplication]);
            if (result instanceof Response) return result;

            user = result;
        } else {
            ctx.status(400)
            return ctx.text('Invalid status parameter');
        }

        const [application] = await applicationRepository.get({ id: application_id });

        if (!application) {
            ctx.status(404)
            return ctx.text('Application not found');
        }

        if (
            application.application.status === ApplicationStatus.Joined ||
            application.application.status === ApplicationStatus.Rejected ||
            application.application.status === ApplicationStatus.Expired
        ) {
            ctx.status(400)
            return ctx.text('Cannot modify application with status ' + application.application.status);
        }

        application.application.status = status;
        application.application.reviewer_user_id = user.user.id;

        if (status === ApplicationStatus.Rejected) {
            if (!rejection_reason) {
                ctx.status(400)
                return ctx.text('Rejection reason required for rejected applications');
            }

            application.application.rejection_reason = rejection_reason;
        }

        const result = await applicationRepository.update(application.application);

        if (!result) {
            throw new Error(`Failed to update application with ID ${application_id} to status ${status}`);
        }

        application.application = result;

        const user_dto = convertUserToDto(application.user.id, application.character, application.corporation);
        const reviewer_user_dto = convertUserToDto(user.user.id, user.character, user.corporation);

        if (status === ApplicationStatus.Accepted) {
            await sendAcceptedApplicationNotification(db, ctx.env, application, reviewer_user_dto);
        } else if (status === ApplicationStatus.Rejected) {
            await sendRejectedApplicationNotification(db, ctx.env, application, reviewer_user_dto);
        }

        return ctx.json(convertToApplicationDto(application.application, user_dto, application.interests, application.languages, reviewer_user_dto));
    });

export default applicationRoutes;