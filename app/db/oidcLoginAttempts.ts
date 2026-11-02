import { and, eq, gt, lte } from "drizzle-orm";
import { db } from "./client.js";
import { oidcLoginAttempts } from "./schema.js";

export function insertLoginAttempt(
  attempt: typeof oidcLoginAttempts.$inferInsert,
): void {
  db.insert(oidcLoginAttempts).values(attempt).run();
}

export function consumeLoginAttempt(stateHash: string, now: Date) {
  return db
    .delete(oidcLoginAttempts)
    .where(
      and(
        eq(oidcLoginAttempts.stateHash, stateHash),
        gt(oidcLoginAttempts.expiresAt, now),
      ),
    )
    .returning()
    .get();
}

export function deleteExpiredLoginAttempts(now: Date): void {
  db.delete(oidcLoginAttempts)
    .where(lte(oidcLoginAttempts.expiresAt, now))
    .run();
}
