import { zValidator } from "@hono/zod-validator";
import { DbCharacterFilters } from "../../data/character";
import SeatRoleRepository, { DbSeatRoleFilters } from "../../data/seat_role";
import SeatRoleUserRepository from "../../data/seat_user_role";
import { Hono } from "hono";
import { Permissions } from "../../model/permission";
import {
  GetSeatRolesDto,
  GetSeatRoleUsersDto,
  SeatRoleDto,
} from "../../model/seat_role";
import { getUserFromSession } from "../../service/auth";
import { getRolePermissions, setRolePermissions } from "../../service/roles";
import { getUserCharacters } from "../../service/user";
import { AppHono, Context } from "../../types";
import { z } from "zod";

const roleRoutes: AppHono = new Hono();

const getRolesQuerySchema = z.object({
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val)),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val)),
  name: z.string().optional(),
  id: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || !isNaN(val)),
});

const getRoleUsersQuerySchema = z.object({
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val)),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val)),
  character: z.string().optional(),
});

const getRolePermissionsQuerySchema = z.object({
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val)),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val)),
});

const postRolePermissionsQuerySchema = z.array(
  z.enum(
    Object.values(Permissions) as [
      Permissions.ViewApplication,
      Permissions.AcceptApplication,
      Permissions.RejectApplication,
      Permissions.SetRolePermissions,
      Permissions.ManageSettings,
      Permissions.Admin,
    ],
  ),
);

interface GetRolesQueryParams {
  limit: number;
  page: number;
  name?: string;
  id?: number;
}

interface GetRoleUsersQueryParams {
  limit: number;
  page: number;
  character?: string;
}

interface GetRolePermissionsQueryParams {
  limit: number;
  page: number;
}

roleRoutes.get(
  "/",
  zValidator("query", getRolesQuerySchema),
  async (ctx: Context) => {
    const query = ctx.req.query();
    const { limit, page, name, id }: GetRolesQueryParams = {
      limit: parseInt(query.limit, 10),
      page: parseInt(query.page, 10),
      name: query.name,
      id: parseInt(query.id, 10),
    };

    const seatRoleRepository = new SeatRoleRepository(ctx.var.db);

    const user = await getUserFromSession(ctx, [Permissions.ViewApplication]);
    if (user instanceof Response) return user;

    const filters: Partial<DbSeatRoleFilters> = {
      like_name: name,
      id: id,
    };

    const offset = limit * (page - 1);

    const roles = await seatRoleRepository.get(filters, limit, offset);
    const total_role_entries = await seatRoleRepository.getRoleCount(filters);
    const member_counts = await seatRoleRepository.getRoleMemberCount(
      roles.map((role) => role.seat_role_id),
    );

    const role_dtos: SeatRoleDto[] = roles.map((role) => ({
      id: role.id,
      seat_role_id: role.seat_role_id,
      name: role.name,
      member_count:
        member_counts.find((c) => c.seat_role_id === role.seat_role_id)
          ?.count ?? 0,
    }));

    const getSeatRolesDto: GetSeatRolesDto = {
      roles: role_dtos,
      total: total_role_entries,
    };

    return ctx.json(getSeatRolesDto);
  },
);

roleRoutes.get(
  "/:id/users",
  zValidator("query", getRoleUsersQuerySchema),
  zValidator(
    "param",
    z.object({
      id: z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val)),
    }),
  ),
  async (ctx: Context) => {
    const param = ctx.req.param();
    const query = ctx.req.query();
    const { seat_role_id }: { seat_role_id: number } = {
      seat_role_id: parseInt(param.id, 10),
    };
    const { limit, page, character }: GetRoleUsersQueryParams = {
      limit: parseInt(query.limit, 10),
      page: parseInt(query.page, 10),
      character: query.character,
    };

    const seatRoleUserRepository = new SeatRoleUserRepository(ctx.var.db);

    const user = await getUserFromSession(ctx, [Permissions.ViewApplication]);
    if (user instanceof Response) return user;

    const role_user_ids = await seatRoleUserRepository.get({
      seat_role_ids: [seat_role_id],
    });

    const filters: Partial<DbCharacterFilters> = {
      user_ids: role_user_ids.map((role) => role.user.id),
      like_character_name: character,
    };

    const role_user_characters = await getUserCharacters(
      ctx.var.db,
      filters,
      limit,
      page,
    );
    const role_user_count =
      await seatRoleUserRepository.getRoleUserCount(seat_role_id);

    const getSeatRoleUsersDto: GetSeatRoleUsersDto = {
      users: role_user_characters,
      total: role_user_count,
    };

    return ctx.json(getSeatRoleUsersDto);
  },
);

roleRoutes.get(
  "/:id/permissions",
  zValidator("query", getRolePermissionsQuerySchema),
  zValidator(
    "param",
    z.object({
      id: z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val)),
    }),
  ),
  async (ctx: Context) => {
    const param = ctx.req.param();
    const query = ctx.req.query();
    const { seat_role_id }: { seat_role_id: number } = {
      seat_role_id: parseInt(param.id, 10),
    };
    const { limit, page }: GetRolePermissionsQueryParams = {
      limit: parseInt(query.limit, 10),
      page: parseInt(query.page, 10),
    };

    const user = await getUserFromSession(ctx, [Permissions.ViewApplication]);
    if (user instanceof Response) return user;

    const permissions = await getRolePermissions(
      ctx.var.db,
      ctx,
      seat_role_id,
      page,
      limit,
    );
    if (permissions instanceof Response) return permissions;

    return ctx.json(permissions);
  },
);

roleRoutes.post(
  "/:id/permissions",
  zValidator("json", postRolePermissionsQuerySchema),
  zValidator(
    "param",
    z.object({
      id: z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val)),
    }),
  ),
  async (ctx: Context) => {
    const param = ctx.req.param();
    const { seat_role_id }: { seat_role_id: number } = {
      seat_role_id: parseInt(param.id, 10),
    };

    const user = await getUserFromSession(ctx, [Permissions.Admin]);
    if (user instanceof Response) return user;

    const body: Permissions[] = await ctx.req.json();

    const permissions = await setRolePermissions(ctx, seat_role_id, body);
    if (permissions instanceof Response) return permissions;

    return ctx.json(permissions);
  },
);

export default roleRoutes;
