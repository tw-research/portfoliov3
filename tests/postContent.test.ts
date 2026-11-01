import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getSchema } from "@tiptap/core";
import { editorExtensions } from "../shared/editor/extensions.js";
import { PostContentSchema } from "../shared/schemas/postContent.js";

const fixture = JSON.parse(
  readFileSync(new URL("./fixtures/post-v1.json", import.meta.url), "utf8"),
);

describe("post content", () => {
  it("accepts a V1 document that follows the Tiptap schema", () => {
    const postContent = PostContentSchema.parse(fixture);
    const schema = getSchema(editorExtensions);
    const document = schema.nodeFromJSON(postContent.content);

    expect(() => document.check()).not.toThrow();
  });

  it("rejects an unsupported format version", () => {
    const result = PostContentSchema.safeParse({
      ...fixture,
      version: 2,
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown Tiptap node", () => {
    const schema = getSchema(editorExtensions);

    expect(() =>
      schema.nodeFromJSON({
        type: "doc",
        content: [{ type: "notARealBlock" }],
      }),
    ).toThrow();
  });
});
