import { Hono } from "hono";
import { cors } from "hono/cors";
import { AppHono } from "./types";
import cron from "node-cron";
import dotenv from "dotenv";
import { CookieStore, sessionMiddleware } from "hono-sessions";
import { drizzle } from "drizzle-orm/libsql";
import { serve, type HttpBindings } from "@hono/node-server";

import joinRoutes from "./routes/join";

import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import syncSeatRoles from "./task/sync_seat_roles";
import updateApplications from "./task/update_applications";
import updateCorporationStats from "./task/corporation_stats";
import applicationRoutes from "./routes/application";

dotenv.config();

const application_encryption_key = process.env.APPLICATION_ENCRYPTION_KEY;
const application_frontend_url = process.env.APPLICATION_FRONTEND_URL;

if (!application_encryption_key) {
  throw new Error("APPLICATION_ENCRYPTION_KEY is not set");
}

if (!application_frontend_url) {
  throw new Error("APPLICATION_FRONTEND_URL is not set");
}

const app: AppHono = new Hono();

const store = new CookieStore();
const thirty_minutes = 30 * 60;

const db = drizzle({
  connection: {
    url: "file:./data/db.sqlite",
  },
});

app.use(
  "*",
  sessionMiddleware({
    store,
    encryptionKey: application_encryption_key,
    expireAfterSeconds: thirty_minutes,
    cookieOptions: {
      sameSite: "Lax",
      path: "/",
      httpOnly: true,
    },
  }),
);

app.use(
  "*",
  cors({
    origin: [application_frontend_url], // TODO fetch these from .env instead
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    maxAge: 600,
    credentials: true,
  }),
);

app.use("*", async (ctx, next) => {
  ctx.set("db", db);
  await next();
});

app.route("/join", joinRoutes);
app.route("/auth", authRoutes);
app.route("/admin", adminRoutes);
app.route("/application", applicationRoutes);

cron.schedule("36 */12 * * *", async () => {
  await updateCorporationStats(db);
});

cron.schedule("17 */6 * * *", async () => {
  const result_message = await updateApplications(db);
  console.info(result_message);
});

cron.schedule("25 */1 * * *", async () => {
  const result_message = await syncSeatRoles(db);
  console.info(result_message);
});

console.log("Listening on 0.0.0.0:8787");

serve({
  fetch: app.fetch,
  port: 8787,
  hostname: "0.0.0.0",
});
