import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { config } from "../config.js";

const LOGIN_STATE_COOKIE = "login_state";
const LOGIN_STATE_LIFETIME_SECONDS = 10 * 60;

export function setLoginStateCookie(context: Context, state: string): void {
  setCookie(context, LOGIN_STATE_COOKIE, state, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/auth",
    maxAge: LOGIN_STATE_LIFETIME_SECONDS,
  });
}

export function getLoginStateCookie(context: Context): string | undefined {
  return getCookie(context, LOGIN_STATE_COOKIE);
}

export function clearLoginStateCookie(context: Context): void {
  deleteCookie(context, LOGIN_STATE_COOKIE, { path: "/auth" });
}
