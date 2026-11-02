//Helper functions to allow us to easily get the URL for the app and posts.
//Mostly used for generating links in the UI and for SEO purposes.

import { config } from "../config.js";

export function getHomeURL(): string {
  return `${config.PUBLIC_ORIGIN}/`;
}

export function getPostURLFromSlug(slug: string): string {
  return `${config.PUBLIC_ORIGIN}/posts/${encodeURIComponent(slug)}`;
}
