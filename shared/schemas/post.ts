//Schema for blog post metadata.
import { z } from "zod";
import { PostContentSchema } from "./postContent.js";

export const AuthorSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  url: z.string().optional(),
});

export const PostMetadataSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  authors: z.array(AuthorSchema),
  tags: z.array(z.string()),
  summary: z.string(),
});

export const PostSchema = z.object({
  metadata: PostMetadataSchema,
  content: PostContentSchema,
});

export type PostMetadata = z.infer<typeof PostMetadataSchema>;
export type Post = z.infer<typeof PostSchema>;
