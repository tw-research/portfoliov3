import { createHash, randomBytes } from "node:crypto";
import {
  deleteExpiredSessions,
  deleteSessionByHash,
  findSessionByHash,
  insertSession,
} from "../db/sessions.js";

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function createSessionTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

//12 hour life - 12 hours * 60min/hour * 60sec/min * 1k milli/sec
const SESSION_LIFETIME_MS = 12 * 60 * 60 * 1000;

export function createSession(issuer: string, subject: string) {
  const token = createSessionToken();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_LIFETIME_MS);

  //might as well run cleanup each time we log in
  deleteExpiredSessions(createdAt);

  insertSession({
    tokenHash: createSessionTokenHash(token),
    issuer,
    subject,
    createdAt,
    expiresAt,
  });

  return { token, expiresAt };
}

export function getSession(token: string) {
  const tokenHash = createSessionTokenHash(token);
  const session = findSessionByHash(tokenHash);

  if (!session || session.expiresAt.getTime() <= Date.now()) {
    return undefined;
  }

  return session;
}

export function revokeSession(token: string): void {
  deleteSessionByHash(createSessionTokenHash(token));
}
