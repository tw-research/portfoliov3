import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { posts, publishedPosts } from "./schema.js";

export function getPublishedPostBySlug(slug: string) {
  return db
    .select({ slug: posts.slug, published: publishedPosts })
    .from(posts)
    .innerJoin(publishedPosts, eq(posts.id, publishedPosts.postID))
    .where(eq(posts.slug, slug))
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
