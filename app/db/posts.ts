import { and, eq, sql } from "drizzle-orm";
import { db } from "./client.js";
import { posts, publishedPosts, postDrafts } from "./schema.js";

export function getPublishedPostBySlug(slug: string) {
  return db
    .select({ slug: posts.slug, published: publishedPosts })
    .from(posts)
    .innerJoin(publishedPosts, eq(posts.id, publishedPosts.postID))
    .where(eq(posts.slug, slug))
    .get();
}

export function getDraftPostById(postId: string) {
  return db
    .select({
      id: posts.id,
      slug: posts.slug,
      draft: postDrafts,
    })
    .from(posts)
    .innerJoin(postDrafts, eq(posts.id, postDrafts.postID))
    .where(eq(posts.id, postId))
    .get();
}

export function getPublishedPostById(postId: string) {
  return db
    .select({
      id: posts.id,
      slug: posts.slug,
      published: publishedPosts,
    })
    .from(posts)
    .innerJoin(publishedPosts, eq(posts.id, publishedPosts.postID))
    .where(eq(posts.id, postId))
    .get();
}

export function getPublishedPosts() {
  return db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: publishedPosts.title,
      summary: publishedPosts.summary,
    })
    .from(posts)
    .innerJoin(publishedPosts, eq(posts.id, publishedPosts.postID))
    .all();
}

type DraftChanges = Pick<
  typeof postDrafts.$inferInsert,
  "title" | "summary" | "authors" | "tags" | "postContent"
>;

export function updateDraft(
  postId: string,
  expectedRevision: number,
  changes: DraftChanges,
) {
  return db
    .update(postDrafts)
    .set({
      ...changes,
      revision: sql`${postDrafts.revision} + 1`,
    })
    .where(
      and(
        eq(postDrafts.postID, postId),
        eq(postDrafts.revision, expectedRevision),
      ),
    )
    .returning({ revision: postDrafts.revision })
    .get();
}

export function createPostDraft(id: string, slug: string, title: string) {
  return db.transaction((tx) => {
    const created = tx
      .insert(posts)
      .values({ id, slug })
      .onConflictDoNothing({ target: posts.slug })
      .returning({ id: posts.id })
      .get();
    if (!created) return false;
    tx.insert(postDrafts)
      .values({
        postID: id,
        title,
        summary: "",
        authors: [],
        tags: [],
        postContent: {
          format: "tiptap",
          version: 1,
          content: { type: "doc", content: [{ type: "paragraph" }] },
        },
      })
      .run();
    return true;
  });
}

export function publishDraftSnapshot(
  postId: string,
  expectedRevision: number,
  changes: DraftChanges,
) {
  return db.transaction((tx) => {
    const current = tx
      .select({ revision: postDrafts.revision })
      .from(postDrafts)
      .where(eq(postDrafts.postID, postId))
      .get();
    if (!current) return { ok: false as const, reason: "not_found" as const };
    if (current.revision !== expectedRevision)
      return { ok: false as const, reason: "stale" as const };
    const snapshot = { postID: postId, ...changes };
    tx.insert(publishedPosts)
      .values(snapshot)
      .onConflictDoUpdate({ target: publishedPosts.postID, set: snapshot })
      .run();
    return { ok: true as const, revision: current.revision };
  });
}
