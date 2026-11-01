import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PostPage } from "../../shared/components/PostPage.js";
import type { getPublishedPosts } from "../db/posts.js";

type PostPageProps = ComponentProps<typeof PostPage>;

/**
 * Renders a specific post given the props
 * @param props
 * @param canonicalURL
 */
export function renderPostPage(
  props: PostPageProps,
  canonicalURL: string,
): string {
  const page = (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{props.metadata.title}</title>
        <link rel="stylesheet" href="/assets/post.css" />
        <link rel="canonical" href={canonicalURL} />
      </head>
      <body>
        <PostPage {...props} />
      </body>
    </html>
  );

  return `<!doctype html>${renderToStaticMarkup(page)}`;
}

export function renderHomePage(
  posts: ReturnType<typeof getPublishedPosts>,
  canonicalURL: string,
) {
  const page = (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Portfolio</title>
        <link rel="stylesheet" href="/assets/post.css" />
        <link rel="canonical" href={canonicalURL} />
      </head>
      <body>
        <main className="post-page">
          <h1>Portfolio</h1>
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                <h2>
                  <a href={`/posts/${encodeURIComponent(post.slug)}`}>
                    {post.title}
                  </a>
                </h2>
                <p>{post.summary}</p>
              </li>
            ))}
          </ul>
        </main>
      </body>
    </html>
  );

  return `<!doctype html>${renderToStaticMarkup(page)}`;
}
