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
      title: "Pizza With Gun",
      summary: "A platformer with elementary procedural generation features",
      authors: [
        { name: "Thomas Wessel", url: "https://github.com/collectioncard" },
        { name: "Jarod Spangler", url: "https://github.com/LifeHckr" },
        { name: "Jack Wilhelm", url: "https://github.com/JackWilhelm" },
      ],
      tags: ["PCG", "Platformer", "2D", "Phaser"],
      postContent,
    })
    .onConflictDoNothing({ target: publishedPosts.postID })
    .run();
});

console.log("Done");
