import { readFileSync } from "node:fs";
import { db } from "../app/db/client.js";
import { posts, publishedPosts } from "../app/db/schema.js";
import { PostContentSchema } from "../shared/schemas/postContent.js";

const file = readFileSync(
  new URL("../tests/fixtures/post-v1.json", import.meta.url),
  "utf8",
);
const postContent = PostContentSchema.parse(JSON.parse(file));

db.transaction((tx) => {
  tx.insert(posts)
    .values({
      id: "example-post",
      slug: "example-post",
    })
    .onConflictDoNothing({ target: posts.id })
    .run();

  tx.insert(publishedPosts)
    .values({
      postID: "example-post",
      title: "An example post",
      summary: "A sample post for building the public page.",
      authors: [{ name: "Thomas" }, { name: "Rhombus" }],
      tags: ["example", "cool", "test", "demo"],
      postContent,
    })
    .onConflictDoNothing({ target: publishedPosts.postID })
    .run();
});

console.log("Done");
