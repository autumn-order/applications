import { Hono } from "hono";
import { AppHono } from "../../types";

import { callbackRoute, loginRoute, logoutRoute } from "./login";
import userRoute from "./user";

const authRoutes: AppHono = new Hono();

authRoutes.route("/login", loginRoute);
authRoutes.route("/callback", callbackRoute);
authRoutes.route("/logout", logoutRoute);
authRoutes.route("/user", userRoute);

export default authRoutes;
