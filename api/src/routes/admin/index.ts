import { Hono } from "hono";
import { AppHono } from "types";

import applicationRoutes from "./application";
import userRoutes from "./user";
import roleRoutes from "./roles";
import taskRoutes from "./task";
import settingsRoutes from "./settings";

const adminRoutes: AppHono = new Hono();

adminRoutes.route("/applications", applicationRoutes);
adminRoutes.route("/users", userRoutes);
adminRoutes.route("/roles", roleRoutes);
adminRoutes.route("/task", taskRoutes);
adminRoutes.route("/settings", settingsRoutes);

export default adminRoutes;