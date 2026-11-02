import {
  CreatePostResponseSchema,
  DraftResponseSchema,
  RevisionResponseSchema,
} from "../../../shared/schemas/api.js";
import type { SaveDraft } from "../../../shared/schemas/api.js";

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`Request failed (${status})`);
    this.status = status;
  }
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(path, { ...init, credentials: "same-origin" });
  if (!response.ok) throw new ApiError(response.status);
  return response.json();
}

export async function createPost(title: string) {
  return CreatePostResponseSchema.parse(
    await request("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }),
  );
}
export async function getDraft(id: string) {
  return DraftResponseSchema.parse(
    await request(`/api/admin/posts/${encodeURIComponent(id)}/draft`),
  );
}
export async function saveDraft(id: string, draft: SaveDraft) {
  return RevisionResponseSchema.parse(
    await request(`/api/admin/posts/${encodeURIComponent(id)}/draft`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    }),
  );
}
export async function publishDraft(id: string, expectedRevision: number) {
  return RevisionResponseSchema.parse(
    await request(`/api/admin/posts/${encodeURIComponent(id)}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expectedRevision }),
    }),
  );
}
