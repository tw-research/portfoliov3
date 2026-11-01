import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { getPublishedPostBySlug, getPublishedPosts } from "./db/posts.js";
import { renderHomePage, renderPostPage } from "./rendering/Pages.js";
import { renderPostContent } from "./rendering/postContent.js";
import { renderSitemap } from "./rendering/sitemap.js";
import { getHomeURL, getPostURLFromSlug } from "./urlGetter.js";

//TODO: swap over to a real router so I don't have to do this
const server = createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;

  if (request.method === "GET" && pathname === "/assets/post.css") {
    const css = readFileSync("shared/styles/post.css", "utf8");
    response.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
    response.end(css);
    return;
  }

  const postRoute = new RegExp(/^\/posts\/([a-z0-9-]+)\/?$/).exec(pathname);

  if (request.method === "GET" && pathname === "/") {
    const html = renderHomePage(getPublishedPosts(), getHomeURL());

    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(html);
    return;
  }

  if (request.method === "GET" && postRoute) {
    const result = getPublishedPostBySlug(postRoute[1]);

    if (result) {
      const html = renderPostPage(
        {
          metadata: result.published,
          children: renderPostContent(result.published.postContent),
        },
        getPostURLFromSlug(result.slug),
      );

      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(html);
      return;
    }
  }

  if (request.method === "GET" && pathname === "/sitemap.xml") {
    const slugs = getPublishedPosts().map((post) => post.slug);

    response.writeHead(200, {
      "Content-Type": "application/xml; charset=utf-8",
    });
    response.end(renderSitemap(slugs));
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(
    "Hey, why are you looking over here? There's obviously no content\n\nAnyway, 404. You should just go back.",
  );
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
