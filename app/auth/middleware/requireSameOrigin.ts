import { createMiddleware } from "hono/factory";
import { config } from "../../config.js";

export const requireSameOrigin = createMiddleware(async (context, next) => {
  const origin = context.req.header("Origin");
  const referer = context.req.header("Referer");
  let requestOrigin = origin;
  if (!requestOrigin && referer) {
    try {
      requestOrigin = new URL(referer).origin;
    } catch {
      requestOrigin = undefined;
    }
  }
  if (requestOrigin !== config.PUBLIC_ORIGIN)
    return context.text("Forbidden", 403);
  await next();
});
