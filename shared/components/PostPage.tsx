import type { ReactNode } from "react";
import type { PostMetadata } from "../schemas/post.js";

type PageMetadata = Pick<
  PostMetadata,
  "title" | "summary" | "authors" | "tags"
>;

type PostPageProps = {
  metadata: PageMetadata;
  children: ReactNode;
};

export function PostPage({ metadata, children }: PostPageProps) {
  return (
    <main className="post-page">
      <nav className="post-nav" aria-label="Portfolio">
        <a className="portfolio-name" href="/">
          Thomas Wessel
        </a>
        <a className="back-link" href="/">
          ← All projects
        </a>
      </nav>
      <header
        className={`post-header${metadata.authors.length > 0 ? " has-authors" : ""}`}
      >
        <div>
          <h1>{metadata.title}</h1>
          <p className="post-summary">{metadata.summary}</p>

          {metadata.tags.length > 0 && (
            <ul className="post-tags" aria-label="Tags">
              {metadata.tags.map((tag, index) => (
                <li key={index}>{tag}</li>
              ))}
            </ul>
          )}
        </div>

        {metadata.authors.length > 0 && (
          <aside className="post-credits">
            <h2>Credits</h2>
            <ul>
              {metadata.authors.map((author, index) => (
                <li key={index}>
                  {author.name}
                  {author.role && <small>{author.role}</small>}
                </li>
              ))}
            </ul>
          </aside>
        )}
      </header>
      <article className="post-content-tt">{children}</article>
      <footer className="post-footer">
        <a href="/">← Back to all projects</a>
        <span>Thomas Wessel</span>
      </footer>
    </main>
  );
}
