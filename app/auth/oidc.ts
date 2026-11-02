import { createHash } from "node:crypto";
import * as oidc from "openid-client";
import {
  deleteExpiredLoginAttempts,
  insertLoginAttempt,
} from "../db/oidcLoginAttempts.js";
import { config } from "../config.js";

export async function discoverProvider() {
  if (
    !config.AUTHENTIK_ISSUER ||
    !config.AUTHENTIK_CLIENT_ID ||
    !config.AUTHENTIK_CLIENT_SECRET
  ) {
    throw new Error("Authentik is not configured");
  }

  return oidc.discovery(
    new URL(config.AUTHENTIK_ISSUER),
    config.AUTHENTIK_CLIENT_ID,
    config.AUTHENTIK_CLIENT_SECRET,
  );
}

export async function createLoginAttempt() {
  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
  return { state, nonce, codeVerifier, codeChallenge };
}

export function hashLoginState(state: string): string {
  return createHash("sha256").update(state).digest("hex");
}

export async function prepareLogin() {
  const provider = await discoverProvider();
  const attempt = await createLoginAttempt();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

  const authorizationUrl = oidc.buildAuthorizationUrl(provider, {
    redirect_uri: `${config.PUBLIC_ORIGIN}/auth/callback`,
    scope: "openid",
    state: attempt.state,
    nonce: attempt.nonce,
    code_challenge: attempt.codeChallenge,
    code_challenge_method: "S256",
  });

  deleteExpiredLoginAttempts(now);
  insertLoginAttempt({
    stateHash: hashLoginState(attempt.state),
    nonce: attempt.nonce,
    codeVerifier: attempt.codeVerifier,
    expiresAt,
  });

  return { state: attempt.state, authorizationUrl };
}
