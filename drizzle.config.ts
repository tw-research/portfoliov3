import { defineConfig } from "drizzle-kit";
import {
  databasePath,
  ensureDatabaseDirectory,
} from "./app/db/databasePath.js";

ensureDatabaseDirectory(databasePath);

export default defineConfig({
  dialect: "sqlite",
  schema: "./app/db/schema.ts",
  out: "./app/db/migrations",
  dbCredentials: { url: databasePath },
});
