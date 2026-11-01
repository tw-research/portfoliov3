//Schema for the actual post content
import { z } from "zod";

export const PostContentSchema = z.object({
  format: z.literal("tiptap"),
  version: z.literal(1),
  content: z.json(),
});

export type PostContent = z.infer<typeof PostContentSchema>;
