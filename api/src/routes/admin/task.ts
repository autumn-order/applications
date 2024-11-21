import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { Permissions } from "model/permission";
import { getUserFromSession } from "service/auth";
import syncSeatRoles from "task/sync_seat_roles";
import updateApplications from 'task/update_applications'
import { AppHono, Context, } from "types";

const taskRoutes: AppHono = new Hono();

taskRoutes.get("/sync-seat-roles", async (ctx: Context) => {
    const db = drizzle(ctx.env.DB);

    const user = await getUserFromSession(db, ctx, [Permissions.ManageSettings]);
    if (user instanceof Response) return user

    const result_message = await syncSeatRoles(ctx.env);

    return ctx.text(result_message);
});

taskRoutes.get("/check-accepted-applications", async (ctx: Context) => {
    const db = drizzle(ctx.env.DB);

    const user = await getUserFromSession(db, ctx, [Permissions.ManageSettings]);
    if (user instanceof Response) return user

    const result_message = await updateApplications(ctx.env);

    return ctx.text(result_message);
});

export default taskRoutes;