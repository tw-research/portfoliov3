import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { config } from "../config.js";

const SESSION_COOKIE_NAME = "session";

export function setSessionCookie(
  context: Context,
  token: string,
  expiresAt: Date,
): void {
  setCookie(context, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    expires: expiresAt,
  });
}

export function getSessionCookie(context: Context): string | undefined {
  return getCookie(context, SESSION_COOKIE_NAME);
}

export function clearSessionCookie(context: Context): void {
  deleteCookie(context, SESSION_COOKIE_NAME, { path: "/" });
}
