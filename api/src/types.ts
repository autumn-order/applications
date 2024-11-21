import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { Hono, Context as HonoContext } from "hono";
import { Session } from "hono-sessions";

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type SessionVariables = {
  session: Session<SessionDataTypes>;
  session_key_rotation: boolean;
  db: BetterSQLite3Database;
};

export type Context = HonoContext<{
  Variables: SessionVariables;
}>;

export type SessionDataTypes = {
  oauth_state?: string;
  user_id?: number;
};

export type AppHono = Hono<{
  Variables: SessionVariables;
}>;
