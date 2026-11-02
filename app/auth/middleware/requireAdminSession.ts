import { createMiddleware } from "hono/factory";
import { config } from "../../config.js";
import { getSessionCookie } from "../sessionCookie.js";
import { getSession } from "../sessions.js";

export const requireAdminSession = createMiddleware(async (context, next) => {
  context.header("Cache-Control", "no-store");

  const token = getSessionCookie(context);
  const session = token ? getSession(token) : undefined;

  if (
    !session ||
    !config.AUTHENTIK_ISSUER ||
    session.issuer !== config.AUTHENTIK_ISSUER
  ) {
    return context.text("Unauthorized", 401);
  }

  await next();
});
