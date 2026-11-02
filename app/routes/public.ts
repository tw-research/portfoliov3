import { readFileSync } from "node:fs";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { getPublishedPostBySlug, getPublishedPosts } from "../db/posts.js";
import { renderHomePage, renderPostPage } from "../rendering/Pages.js";
import { renderPostContent } from "../rendering/postContent.js";
import { renderSitemap } from "../rendering/sitemap.js";
import { getHomeURL, getPostURLFromSlug } from "../utils/urlGetter.js";

export function registerPublicRoutes(app: Hono): void {
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

  app.get("/assets/global.css", (c) => {
    const css = readFileSync("shared/styles/global.css", "utf8");

    return c.body(css, 200, {
      "Content-Type": "text/css; charset=utf-8",
    });
  });

  app.get("/assets/home.css", (c) => {
    const css = readFileSync("shared/styles/home.css", "utf8");

    return c.body(css, 200, {
      "Content-Type": "text/css; charset=utf-8",
    });
  });

  app.get("/assets/fonts/*", serveStatic({ root: "./public" }));
}
