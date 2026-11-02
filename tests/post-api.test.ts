import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Hono } from "hono";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const dir = mkdtempSync(join(tmpdir(), "portfolio-api-test-"));
const databasePath = join(dir, "test.sqlite");
let app: Hono;
let headers: Record<string, string>;
let loadPublishedPost: typeof import("../app/content/posts.js").loadPublishedPost;

beforeAll(async () => {
  execFileSync(process.execPath, ["node_modules/drizzle-kit/bin.cjs", "push"], {
    env: { ...process.env, DATABASE_PATH: databasePath },
    stdio: "pipe",
  });
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("DATABASE_PATH", databasePath);
  vi.stubEnv("PUBLIC_ORIGIN", "http://localhost:3000");
  vi.stubEnv("AUTHENTIK_ISSUER", "https://auth.example/");
  const [
    { registerAdminRoutes },
    { registerPostRoutes },
    { createSession },
    posts,
  ] = await Promise.all([
    import("../app/routes/admin.js"),
    import("../app/routes/posts.js"),
    import("../app/auth/sessions.js"),
    import("../app/content/posts.js"),
  ]);
  loadPublishedPost = posts.loadPublishedPost;
  app = new Hono();
  registerAdminRoutes(app);
  registerPostRoutes(app);
  const token = createSession("https://auth.example/", "test-owner").token;
  headers = {
    "Content-Type": "application/json",
    Origin: "http://localhost:3000",
    Cookie: `session=${token}`,
  };
});

afterAll(() => {
  vi.unstubAllEnvs();
  rmSync(dir, { recursive: true, force: true });
});

async function request(
  method: string,
  path: string,
  body?: unknown,
  requestHeaders = headers,
) {
  return app.request(`http://localhost:3000${path}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("protected post API", () => {
  it("rejects unauthenticated and cross-origin mutations", async () => {
    const anonymous = {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
    };
    expect(
      (await request("POST", "/api/admin/posts", { title: "Test" }, anonymous))
        .status,
    ).toBe(401);
    expect(
      (
        await request(
          "POST",
          "/api/admin/posts",
          { title: "Test" },
          { ...headers, Origin: "https://other.example" },
        )
      ).status,
    ).toBe(403);
  });

  it("rejects stale saves and preserves published content when publishing fails", async () => {
    const created = await request("POST", "/api/admin/posts", {
      title: "Test post",
    });
    expect(created.status).toBe(201);
    const { id } = await created.json();
    const draft = {
      expectedRevision: 0,
      metadata: { title: "Test post", summary: "", authors: [], tags: [] },
      content: {
        format: "tiptap",
        version: 1,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Published body" }],
            },
          ],
        },
      },
    };
    expect(
      (await request("PUT", `/api/admin/posts/${id}/draft`, draft)).status,
    ).toBe(200);
    const stale = {
      ...draft,
      metadata: { ...draft.metadata, title: "Stale overwrite" },
    };
    expect(
      (await request("PUT", `/api/admin/posts/${id}/draft`, stale)).status,
    ).toBe(409);
    const loaded = await (
      await request("GET", `/api/admin/posts/${id}/draft`)
    ).json();
    expect(loaded.post.metadata.title).toBe("Test post");
    expect(loaded.revision).toBe(1);
    expect(
      (
        await request("POST", `/api/admin/posts/${id}/publish`, {
          expectedRevision: 1,
        })
      ).status,
    ).toBe(200);
    const incomplete = {
      ...draft,
      expectedRevision: 1,
      metadata: { ...draft.metadata, title: "" },
      content: {
        ...draft.content,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Unpublished change" }],
            },
          ],
        },
      },
    };
    expect(
      (await request("PUT", `/api/admin/posts/${id}/draft`, incomplete)).status,
    ).toBe(200);
    expect(
      (
        await request("POST", `/api/admin/posts/${id}/publish`, {
          expectedRevision: 2,
        })
      ).status,
    ).toBe(422);
    const published = loadPublishedPost(id);
    expect(published?.metadata.title).toBe("Test post");
    expect(JSON.stringify(published?.content)).toContain("Published body");
    expect(JSON.stringify(published?.content)).not.toContain(
      "Unpublished change",
    );
  });
});
