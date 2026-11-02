import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { ZodError } from "zod";
import { requireSameOrigin } from "../auth/middleware/requireSameOrigin.js";
import {
  createDraft,
  InvalidDraftContentError,
  loadDraft,
  saveDraft,
} from "../content/posts.js";
import { publishDraft } from "../content/publishing.js";
import { PublishDraftSchema } from "../../shared/schemas/api.js";

export function registerPostRoutes(app: Hono): void {
  const limit = bodyLimit({
    maxSize: 1024 * 1024,
    onError: (c) => c.json({ error: "Request too large" }, 413),
  });
  app.get("/api/admin/posts/:id/draft", (c) => {
    const draft = loadDraft(c.req.param("id"));
    return draft ? c.json(draft) : c.json({ error: "Draft not found" }, 404);
  });
  app.post("/api/admin/posts", requireSameOrigin, limit, async (c) => {
    try {
      return c.json(createDraft(await c.req.json()), 201);
    } catch (error) {
      if (error instanceof ZodError || error instanceof SyntaxError)
        return c.json({ error: "Invalid request" }, 400);
      throw error;
    }
  });
  app.put("/api/admin/posts/:id/draft", requireSameOrigin, limit, async (c) => {
    let input: unknown;
    try {
      input = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON" }, 400);
    }
    try {
      const result = saveDraft(c.req.param("id"), input);
      return result.ok
        ? c.json(result)
        : c.json({ error: "Draft missing or revision conflict" }, 409);
    } catch (error) {
      if (
        error instanceof ZodError ||
        error instanceof InvalidDraftContentError
      )
        return c.json({ error: "Invalid draft" }, 400);
      throw error;
    }
  });
  app.post(
    "/api/admin/posts/:id/publish",
    requireSameOrigin,
    limit,
    async (c) => {
      let input: unknown;
      try {
        input = await c.req.json();
      } catch {
        return c.json({ error: "Invalid JSON" }, 400);
      }
      const parsed = PublishDraftSchema.safeParse(input);
      if (!parsed.success) return c.json({ error: "Invalid request" }, 400);
      try {
        const result = publishDraft(
          c.req.param("id"),
          parsed.data.expectedRevision,
        );
        if (result.ok) return c.json(result);
        if (result.reason === "not_found")
          return c.json({ error: "Draft not found" }, 404);
        if (result.reason === "stale")
          return c.json({ error: "Revision conflict" }, 409);
        if (result.reason === "invalid")
          return c.json({ error: "Invalid draft" }, 422);
        return c.json({ error: "A title and body are required" }, 422);
      } catch (error) {
        if (
          error instanceof ZodError ||
          error instanceof RangeError ||
          error instanceof TypeError
        )
          return c.json({ error: "Invalid draft" }, 422);
        throw error;
      }
    },
  );
}
