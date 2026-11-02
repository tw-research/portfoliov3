import { z } from "zod";
import { PostMetadataSchema, PostSchema } from "./post.js";
import { PostContentSchema } from "./postContent.js";

export const SaveDraftSchema = z.object({
  expectedRevision: z.number().int().nonnegative(),
  metadata: PostMetadataSchema.omit({
    id: true,
    slug: true,
  }),
  content: PostContentSchema,
});

export type SaveDraft = z.infer<typeof SaveDraftSchema>;

export const CreatePostSchema = z.object({
  title: z.string().max(200).default(""),
});
export const PublishDraftSchema = z.object({
  expectedRevision: z.number().int().nonnegative(),
});

export const DraftResponseSchema = z.object({
  post: PostSchema,
  revision: z.number().int().nonnegative(),
});
export const CreatePostResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  revision: z.number().int().nonnegative(),
});
export const RevisionResponseSchema = z.object({
  ok: z.literal(true),
  revision: z.number().int().nonnegative(),
});
