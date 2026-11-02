import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { z } from "zod";

// Shared independently of app authentication so Drizzle can run migrations.
export const databasePath = z
  .string()
  .trim()
  .min(1)
  .default("data/portfolio.sqlite")
  .parse(process.env.DATABASE_PATH);

export function ensureDatabaseDirectory(path: string): void {
  mkdirSync(dirname(path), { recursive: true });
}
