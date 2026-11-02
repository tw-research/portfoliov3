import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { config } from "../config.js";
import { ensureDatabaseDirectory } from "./databasePath.js";

ensureDatabaseDirectory(config.DATABASE_PATH);

const sqlite = new Database(config.DATABASE_PATH);

export const db = drizzle({ client: sqlite });
