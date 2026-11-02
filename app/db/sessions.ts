import { db } from "./client.js";
import { sessions } from "./schema.js";
import { eq, lte } from "drizzle-orm";

export function insertSession(session: typeof sessions.$inferInsert): void {
  db.insert(sessions).values(session).run();
}

export function findSessionByHash(tokenHash: string) {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.tokenHash, tokenHash))
    .get();
}

export function deleteSessionByHash(tokenHash: string): void {
  db.delete(sessions).where(eq(sessions.tokenHash, tokenHash)).run();
}

export function deleteExpiredSessions(currentTime: Date): void {
  db.delete(sessions).where(lte(sessions.expiresAt, currentTime)).run();
}
