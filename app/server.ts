import { readFileSync } from "node:fs";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getPublishedPostBySlug, getPublishedPosts } from "./db/posts.js";
import { renderHomePage, renderPostPage } from "./rendering/Pages.js";
import { renderPostContent } from "./rendering/postContent.js";
import { renderSitemap } from "./rendering/sitemap.js";
import { getHomeURL, getPostURLFromSlug } from "./urlGetter.js";

const app = new Hono({ strict: false });

app.get("/", (c) => {
  return c.html(renderHomePage(getPublishedPosts(), getHomeURL()));
});

app.get("/posts/:slug", (c) => {
  const slug = c.req.param("slug");

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return c.notFound();
  }

  const result = getPublishedPostBySlug(slug);

  if (!result) {
    return c.notFound();
  }

  return c.html(
    renderPostPage(
      {
        metadata: result.published,
        children: renderPostContent(result.published.postContent),
      },
      getPostURLFromSlug(result.slug),
    ),
  );
});

app.get("/sitemap.xml", (c) => {
  const slugs = getPublishedPosts().map((post) => post.slug);

  return c.body(renderSitemap(slugs), 200, {
    "Content-Type": "application/xml; charset=utf-8",
  });
});

app.get("/assets/post.css", (c) => {
  const css = readFileSync("shared/styles/post.css", "utf8");

  return c.body(css, 200, {
    "Content-Type": "text/css; charset=utf-8",
  });
});

app.notFound((c) => {
  return c.text(
    "Hey, why are you looking over here? There's obviously no content\n\nAnyway, 404. You should just go back.",
    404,
  );
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
