import { Hono } from "hono";
import { getOrCreateUser } from "service/auth";
import { AppHono, Context } from "types";
import crypto from "crypto";

function create_oauth_authorization_uri(
  client_id: string,
  application_callback: string,
  state: string,
): string {
  return `https://login.eveonline.com/v2/oauth/authorize?response_type=code&redirect_uri=${application_callback}&client_id=${client_id}&state=${state}`;
}

async function get_access_token(
  client_id: string,
  client_secret: string,
  code: string,
): Promise<Response> {
  const authString = Buffer.from(`${client_id}:${client_secret}`).toString(
    "base64",
  );

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
  });

  const response = await fetch("https://login.eveonline.com/v2/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${authString}`,
    },
    body: body.toString(),
  });

  return response;
}

function generateState(length: number = 16): string {
  return crypto.randomBytes(length).toString("hex");
}

const loginRoute: AppHono = new Hono();
const callbackRoute: AppHono = new Hono();
const logoutRoute: AppHono = new Hono();

loginRoute.get("/", async (ctx: Context) => {
  const application_url = ctx.env.APPLICATION_BACKEND_URL;
  const eve_esi_client_id = ctx.env.EVE_ESI_CLIENT_ID;
  const session = ctx.get("session");

  const callback_url = `${application_url}/auth/callback`;

  const state = generateState();
  session.set("oauth_state", state);

  const oauth_authorization_uri = create_oauth_authorization_uri(
    eve_esi_client_id,
    callback_url,
    state,
  );

  return ctx.redirect(oauth_authorization_uri);
});

callbackRoute.get("/", async (ctx: Context) => {
  const code = ctx.req.query("code");
  const state = ctx.req.query("state");
  const session = ctx.get("session");

  if (!code) {
    ctx.status(400);
    return ctx.body("No authorization code provided");
  }

  if (!state) {
    ctx.status(400);
    return ctx.body("No authorization state provided");
  }

  const storedState = session.get("oauth_state");
  if (!storedState) {
    console.error("No stored state in session");
    return ctx.status(500);
  }

  if (state !== storedState) {
    ctx.status(400);
    return ctx.body("Invalid state");
  }

  const client_id = ctx.env.EVE_ESI_CLIENT_ID;
  const client_secret = ctx.env.EVE_ESI_SECRET_KEY;

  const response = await get_access_token(client_id, client_secret, code);

  if (!response.ok) {
    ctx.status(500);
    return ctx.body("Failed to fetch access token");
  }

  const tokenResult: OAuthResponse = await response.json();

  const accessToken = tokenResult.access_token;
  const verifyResponse = await fetch(
    "https://login.eveonline.com/oauth/verify",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!verifyResponse.ok) {
    ctx.status(500);
    return ctx.body("Failed to verify access token");
  }

  const tokenData: TokenData = await verifyResponse.json();

  const user = await getOrCreateUser(
    ctx.env,
    tokenData.CharacterOwnerHash,
    tokenData.CharacterID,
    tokenData.CharacterName,
  );

  session.set("user_id", user.id);

  const application_frontend_url = ctx.env.APPLICATION_FRONTEND_URL;
  const apply_page_url = `${application_frontend_url}/application`;

  return ctx.redirect(apply_page_url);
});

logoutRoute.get("/", async (ctx: Context) => {
  const session = ctx.get("session");
  session.set("user_id", undefined);

  return ctx.text("Logout successful");
});

export { loginRoute, callbackRoute, logoutRoute };
