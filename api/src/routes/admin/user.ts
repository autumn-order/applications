import { zValidator } from "@hono/zod-validator";
import CharacterRepository, { DbCharacterFilters } from "data/character";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { AppHono, Context } from "types";
import { z } from 'zod';
import { getUserCharacters, getUserRoles } from "service/user";
import { GetUsersDto } from "model/user";
import { getUserFromSession } from "service/auth";
import { Permissions } from "model/permission";

const getUsersQuerySchema = z.object({
    limit: z.string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val)),
    page: z.string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val)),
    character: z.string().optional(),
    user_id: z.string().optional()
        .transform((val) => val ? parseInt(val, 10) : undefined)
        .refine((val) => val === undefined || !isNaN(val)),
})

const getUserRolesQuerySchema = z.object({
    limit: z.string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val)),
    page: z.string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val)),
})

interface GetUsersQueryParams {
    limit: number;
    page: number;
    character?: string;
    user_id?: number;
}

interface GetUserRolesQueryParams {
    limit: number;
    page: number;
}

const userRoutes: AppHono = new Hono();

userRoutes.get(
    "/",
    zValidator('query', getUsersQuerySchema),
    async (ctx: Context) => {
        const query = ctx.req.query();
        const { limit, page, character, user_id }: GetUsersQueryParams = {
            limit: parseInt(query.limit, 10),
            page: parseInt(query.page, 10),
            character: query.character,
            user_id: parseInt(query.user_id, 10)
        };

        const db = drizzle(ctx.env.DB);
        const characterRepository = new CharacterRepository(db);

        const user = await getUserFromSession(db, ctx, [Permissions.ViewApplication]);
        if (user instanceof Response) return user

        const filters: Partial<DbCharacterFilters> = {
            like_character_name: character,
        };

        if (user_id) {
            filters.user_ids = [user_id];
        }

        const user_characters = await getUserCharacters(db, filters, limit, page);

        const total_user_entries = await characterRepository.getCharacterCount(filters);

        const getUsersDto: GetUsersDto = {
            users: user_characters,
            total: total_user_entries
        }

        return ctx.json(getUsersDto)
    })

userRoutes.get(
    "/:id/roles",
    zValidator('query', getUserRolesQuerySchema),
    async (ctx: Context) => {
        const param = ctx.req.param();
        const { user_id }: { user_id: number } = {
            user_id: parseInt(param.id, 10)
        };
        const query = ctx.req.query();
        const { limit, page }: GetUserRolesQueryParams = {
            limit: parseInt(query.limit, 10),
            page: parseInt(query.page, 10),
        };

        const db = drizzle(ctx.env.DB);

        const user = await getUserFromSession(db, ctx, [Permissions.ViewApplication]);
        if (user instanceof Response) return user

        const user_roles_dto = await getUserRoles(db, ctx, user_id, limit, page);
        if (user_roles_dto instanceof Response) return user_roles_dto;

        return ctx.json(user_roles_dto)
    }
)

export default userRoutes;