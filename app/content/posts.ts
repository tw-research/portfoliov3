import { randomUUID } from "node:crypto";
import { CreatePostSchema } from "../../shared/schemas/api.js";
import { createPostDraft } from "../db/posts.js";
import { PostSchema } from "../../shared/schemas/post.js";
import type { postDrafts } from "../db/schema.js";
import {
  getDraftPostById,
  getPublishedPostById,
  updateDraft,
} from "../db/posts.js";
import { getSchema } from "@tiptap/core";
import { SaveDraftSchema } from "../../shared/schemas/api.js";
import { editorExtensions } from "../../shared/editor/extensions.js";

type PostSnapshot = Pick<
  typeof postDrafts.$inferSelect,
  "title" | "summary" | "authors" | "tags" | "postContent"
>;

export function mapPost(id: string, slug: string, snapshot: PostSnapshot) {
  return PostSchema.parse({
    metadata: {
      id,
      slug,
      title: snapshot.title,
      summary: snapshot.summary,
      authors: snapshot.authors,
      tags: snapshot.tags,
    },
    content: snapshot.postContent,
  });
}

export function loadDraft(postId: string) {
  const result = getDraftPostById(postId);

  if (!result) return undefined;

  return {
    post: mapPost(result.id, result.slug, result.draft),
    revision: result.draft.revision,
  };
}

export function loadPublishedPost(postId: string) {
  const result = getPublishedPostById(postId);

  if (!result) return undefined;

  return mapPost(result.id, result.slug, result.published);
}

export class InvalidDraftContentError extends Error {
  constructor() {
    super("Invalid Tiptap document");
  }
}

export const editorSchema = getSchema(editorExtensions);

export function saveDraft(postId: string, input: unknown) {
  const draft = SaveDraftSchema.parse(input);

  try {
    const document = editorSchema.nodeFromJSON(draft.content.content);
    if (document.type !== editorSchema.topNodeType)
      throw new Error("Invalid document root");
    document.check();
  } catch {
    throw new InvalidDraftContentError();
  }

  const result = updateDraft(postId, draft.expectedRevision, {
    ...draft.metadata,
    postContent: draft.content,
  });

  if (!result) {
    return { ok: false as const, reason: "not_found_or_stale" as const };
  }

  return { ok: true as const, revision: result.revision };
}

export function createDraft(input: unknown) {
  const { title } = CreatePostSchema.parse(input);
  const base =
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .replace(/-+$/, "") || "draft";
  const id = randomUUID();
  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${randomUUID().slice(0, 8)}`;
    if (createPostDraft(id, slug, title)) return { id, slug, revision: 0 };
  }
  throw new Error("Could not allocate a unique post slug");
}
