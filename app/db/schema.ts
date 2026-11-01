import { sqliteTable, text } from "drizzle-orm/sqlite-core";
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
});
