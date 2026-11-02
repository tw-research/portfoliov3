import { getDraftPostById, publishDraftSnapshot } from "../db/posts.js";
import { PostContentSchema } from "../../shared/schemas/postContent.js";
import { editorSchema } from "./posts.js";

export function publishDraft(postId: string, expectedRevision: number) {
  const result = getDraftPostById(postId);
  if (!result) return { ok: false as const, reason: "not_found" as const };
  const draft = result.draft;
  if (draft.revision !== expectedRevision)
    return { ok: false as const, reason: "stale" as const };
  let content;
  let document;
  try {
    content = PostContentSchema.parse(draft.postContent);
    document = editorSchema.nodeFromJSON(content.content);
    if (document.type !== editorSchema.topNodeType)
      throw new Error("Invalid document root");
    document.check();
  } catch {
    return { ok: false as const, reason: "invalid" as const };
  }
  if (!draft.title.trim() || !document.textContent.trim())
    return { ok: false as const, reason: "incomplete" as const };
  return publishDraftSnapshot(postId, expectedRevision, {
    title: draft.title,
    summary: draft.summary,
    authors: draft.authors,
    tags: draft.tags,
    postContent: content,
  });
}
