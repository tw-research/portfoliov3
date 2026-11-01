//Gets the URL for anything. Kinda hoping I'm reading google's SEO stuff right.
//This will require us to set PUBLIC_ORIGIN as an env var
const configuredOrigin = process.env.PUBLIC_ORIGIN;

if (!configuredOrigin && process.env.NODE_ENV === "production") {
  throw new Error(
    "The env var `PUBLIC_ORIGIN` should be set unless we're in dev :(",
  );
}

const publicURL = new URL(configuredOrigin ?? "http://localhost:3000");

if (
  !["http:", "https:"].includes(publicURL.protocol) ||
  publicURL.username ||
  publicURL.password ||
  publicURL.pathname !== "/" ||
  publicURL.search ||
  publicURL.hash
) {
  throw new Error("PUBLIC_ORIGIN must be an HTTP or HTTPS origin");
}

export const publicOrigin = publicURL.origin;

export function getHomeURL(): string {
  return `${publicOrigin}/`;
}

export function getPostURLFromSlug(slug: string): string {
  return `${publicOrigin}/posts/${encodeURIComponent(slug)}`;
}
