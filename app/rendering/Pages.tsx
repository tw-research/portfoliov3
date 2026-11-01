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
        <link rel="stylesheet" href="/assets/global.css" />
        <link rel="stylesheet" href="/assets/post.css" />
        <link rel="canonical" href={canonicalURL} />
      </head>
      <body className="post-body">
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
        <title>Thomas Wessel</title>
        <link rel="stylesheet" href="/assets/global.css" />
        <link rel="stylesheet" href="/assets/home.css" />
        <link rel="canonical" href={canonicalURL} />
      </head>
      <body className="home-body">
        <a className="skip-link" href="#projects">
          Skip to projects
        </a>
        <main className="home-page">
          <header className="home-intro">
            <h1>Thomas Wessel</h1>
            <p>
              I make seemingly unrelated stuff that usually ends up being pretty
              neat
            </p>
            <nav className="home-links" aria-label="Résumé and profiles">
              <a href="https://docs.google.com/document/d/158I-peZDIZNFvw30WkYq4zKa8BadVcCwm4fJmsCpsjw/export?format=pdf">
                Résumé
              </a>
              <a href="https://github.com/collectioncard">GitHub</a>
            </nav>
          </header>
          <section
            className="home-projects"
            id="projects"
            aria-labelledby="projects-heading"
          >
            <h2 id="projects-heading">
              Take a look at some of the projects that I&apos;ve worked on
            </h2>
            {posts.length === 0 ? (
              <p>No projects have been published yet.</p>
            ) : (
              <ul className="project-list">
                {posts.map((post) => (
                  <li key={post.id} className="project-card">
                    <h3>
                      <a href={`/posts/${encodeURIComponent(post.slug)}`}>
                        {post.title}
                      </a>
                    </h3>
                    <p>{post.summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </body>
    </html>
  );

  return `<!doctype html>${renderToStaticMarkup(page)}`;
}
