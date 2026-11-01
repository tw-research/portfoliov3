import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./app/db/schema.ts",
  out: "./app/db/migrations",
  dbCredentials: { url: "./data/portfolio.sqlite" },
});
