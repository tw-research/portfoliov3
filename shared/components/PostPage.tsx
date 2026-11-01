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
      <header className="post-header">
        <h1>{metadata.title}</h1>
        <p className="post-summary">{metadata.summary}</p>

        <ul className="post-authors">
          {metadata.authors.map((author, index) => (
            <li key={index}>{author.name}</li>
          ))}
        </ul>

        <ul className="post-tags">
          {metadata.tags.map((tag, index) => (
            <li key={index}>{tag}</li>
          ))}
        </ul>
      </header>
      <article className="post-content-tt">{children}</article>
    </main>
  );
}
