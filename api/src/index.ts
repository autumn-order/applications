import { Hono } from "hono";
import { cors } from "hono/cors";
import { AppHono } from "types";
import cron from "node-cron";
import dotenv from "dotenv";
import { CookieStore, sessionMiddleware } from "hono-sessions";
import { drizzle } from "drizzle-orm/better-sqlite3";

import updateCorporationStats from "task/corporation_stats";

import joinRoutes from "routes/application";
import authRoutes from "routes/auth";
import adminRoutes from "routes/admin";
import syncSeatRoles from "task/sync_seat_roles";
import updateApplications from "task/update_applications";
import applicationRoutes from "routes/application";

dotenv.config();

const application_encryption_key = process.env.APPLICATION_ENCRYPTION_KEY;
const application_frontend_url = process.env.APPLICATION_FRONTEND_URL;
const application_database_url = process.env.APPLICATION_DATABASE_URL;

if (!application_encryption_key) {
  throw new Error("APPLICATION_ENCRYPTION_KEY is not set");
}

if (!application_frontend_url) {
  throw new Error("APPLICATION_FRONTEND_URL is not set");
}

if (!application_database_url) {
  throw new Error("APPLICATION_DATABASE_URL is not set");
}

const app: AppHono = new Hono();

const store = new CookieStore();
const thirty_minutes = 30 * 60;

// @ts-ignore
const db = drizzle(application_database_url, {
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
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

app.use("*", async (c, next) => {
  c.set("db", db);
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

export default app;
