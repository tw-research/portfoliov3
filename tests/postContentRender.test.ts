import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderPostContent } from "../app/rendering/postContent.js";

const fixture = JSON.parse(
  readFileSync(new URL("./fixtures/post-v1.json", import.meta.url), "utf8"),
);

describe("renderPostContent", () => {
  it("renders the saved document as HTML", () => {
    const html = renderToStaticMarkup(renderPostContent(fixture));

    expect(html).toContain("<h1>");
    expect(html).toContain("<p>");
    expect(html).toContain(
      "This is the first part of the post body, styled as a heading.",
    );
  });

  it("rejects an unsupported document version", () => {
    expect(() => renderPostContent({ ...fixture, version: 2 })).toThrow();
  });
});
