import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { PostMetadata } from "../../shared/schemas/post.js";
import type { PostContent } from "../../shared/schemas/postContent.js";

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
});

export const postDrafts = sqliteTable("post_drafts", {
  postID: text("post_id")
    .primaryKey()
    .references(() => posts.id),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  authors: text("authors", { mode: "json" })
    .$type<PostMetadata["authors"]>()
    .notNull(),
  tags: text("tags", { mode: "json" }).$type<PostMetadata["tags"]>().notNull(),
  postContent: text("post_content", { mode: "json" })
    .$type<PostContent>()
    .notNull(),
});

export const publishedPosts = sqliteTable("published_posts", {
  postID: text("post_id")
    .primaryKey()
    .references(() => posts.id),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  authors: text("authors", { mode: "json" })
    .$type<PostMetadata["authors"]>()
    .notNull(),
  tags: text("tags", { mode: "json" }).$type<PostMetadata["tags"]>().notNull(),
  postContent: text("post_content", { mode: "json" })
    .$type<PostContent>()
    .notNull(),
});

export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  issuer: text("issuer").notNull(),
  subject: text("subject").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

export const oidcLoginAttempts = sqliteTable("oidc_login_attempts", {
  stateHash: text("state_hash").primaryKey(),
  nonce: text("nonce").notNull(),
  codeVerifier: text("code_verifier").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});
