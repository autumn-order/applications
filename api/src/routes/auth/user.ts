import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import convertUserToDto from "lib/convert_user_to_dto";
import { getUserFromSession } from "service/auth";
import { AppHono, Context } from "types";

const userRoute: AppHono = new Hono();

userRoute.get("/", async (ctx: Context) => {
    const db = drizzle(ctx.env.DB)

    const user = await getUserFromSession(db, ctx);
    if (user instanceof Response) {
        const session = ctx.get('session');
        session.set('user_id', undefined);

        return user;
    }

    const user_dto = convertUserToDto(user.user.id, user.character, user.corporation, user.permissions);

    return ctx.json(user_dto);
});

export default userRoute;