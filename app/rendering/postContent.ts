import { getSchema } from "@tiptap/core";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { editorExtensions } from "../../shared/editor/extensions.js";
import { PostContentSchema } from "../../shared/schemas/postContent.js";

const tiptapSchema = getSchema(editorExtensions);

export function renderPostContent(value: unknown) {
  const postContent = PostContentSchema.parse(value);
  const document = tiptapSchema.nodeFromJSON(postContent.content);

  if (document.type !== tiptapSchema.topNodeType) {
    throw new Error("Post content must be a Tiptap document");
  }

  document.check();

  return renderToReactElement({
    extensions: editorExtensions,
    content: document,
  });
}
