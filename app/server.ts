import { readFileSync } from "node:fs";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { config } from "./config.js";
import { prepareLogin, discoverProvider, hashLoginState } from "./auth/oidc.js";
import {
  clearLoginStateCookie,
  getLoginStateCookie,
  setLoginStateCookie,
} from "./auth/loginStateCookie.js";
import {
  clearSessionCookie,
  getSessionCookie,
  setSessionCookie,
} from "./auth/sessionCookie.js";
import { createSession, revokeSession } from "./auth/sessions.js";
import { requireAdminSession } from "./auth/middleware/requireAdminSession.js";
import { consumeLoginAttempt } from "./db/oidcLoginAttempts.js";
import * as oidc from "openid-client";
import { getPublishedPostBySlug, getPublishedPosts } from "./db/posts.js";
import { renderHomePage, renderPostPage } from "./rendering/Pages.js";
import { renderPostContent } from "./rendering/postContent.js";
import { renderSitemap } from "./rendering/sitemap.js";
import { getHomeURL, getPostURLFromSlug } from "./utils/urlGetter.js";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono({ strict: false });

app.get("/auth/login", async (c) => {
  c.header("Cache-Control", "no-store");
  try {
    const { state, authorizationUrl } = await prepareLogin();
    setLoginStateCookie(c, state);
    return c.redirect(authorizationUrl.toString());
  } catch {
    return c.text("Login is temporarily unavailable.", 503);
  }
});

app.get("/auth/callback", async (c) => {
  c.header("Cache-Control", "no-store");
  c.header("Referrer-Policy", "no-referrer");

  const incoming = new URL(c.req.url);
  const states = incoming.searchParams.getAll("state");
  const codes = incoming.searchParams.getAll("code");
  const cookieState = getLoginStateCookie(c);
  clearLoginStateCookie(c);

  if (
    states.length !== 1 ||
    codes.length !== 1 ||
    !states[0] ||
    !codes[0] ||
    !cookieState ||
    states[0] !== cookieState ||
    !config.AUTHENTIK_ISSUER
  ) {
    console.error("Login callback rejected before token exchange", {
      hasSingleState: states.length === 1 && Boolean(states[0]),
      hasSingleCode: codes.length === 1 && Boolean(codes[0]),
      providerReturnedError: incoming.searchParams.has("error"),
      hasStateCookie: Boolean(cookieState),
      stateMatches: Boolean(
        cookieState && states.length === 1 && states[0] === cookieState,
      ),
      issuerConfigured: Boolean(config.AUTHENTIK_ISSUER),
    });
    return c.text("Login failed.", 401);
  }

  const attempt = consumeLoginAttempt(hashLoginState(states[0]), new Date());
  if (!attempt) {
    console.error(
      "Login callback rejected: attempt missing, expired, or already used",
    );
    return c.text("Login failed.", 401);
  }

  try {
    const provider = await discoverProvider();
    // Construct the callback from trusted configuration, never the Host header.
    const callback = new URL("/auth/callback", config.PUBLIC_ORIGIN);
    callback.search = incoming.search;
    const tokens = await oidc.authorizationCodeGrant(provider, callback, {
      expectedState: cookieState,
      expectedNonce: attempt.nonce,
      pkceCodeVerifier: attempt.codeVerifier,
    });
    const claims = tokens.claims();
    if (claims?.iss !== config.AUTHENTIK_ISSUER || !claims.sub) {
      return c.text("Login failed.", 401);
    }

    const existingToken = getSessionCookie(c);
    const session = createSession(claims.iss, claims.sub);
    if (existingToken) revokeSession(existingToken);
    setSessionCookie(c, session.token, session.expiresAt);
    return c.redirect("/admin");
  } catch {
    console.error(
      "Login callback failed during provider verification or session creation",
    );
    return c.text("Login failed.", 401);
  }
});

// Require a same-origin request before revoking a session.
app.post("/auth/logout", (c) => {
  c.header("Cache-Control", "no-store");
  const origin = c.req.header("Origin");
  const referer = c.req.header("Referer");
  let requestOrigin = origin;
  if (!requestOrigin && referer) {
    try {
      requestOrigin = new URL(referer).origin;
    } catch {
      requestOrigin = undefined;
    }
  }
  if (requestOrigin !== config.PUBLIC_ORIGIN) return c.text("Forbidden", 403);
  const token = getSessionCookie(c);
  if (token) revokeSession(token);
  clearSessionCookie(c);
  return c.redirect("/", 303);
});

app.use("/admin", requireAdminSession);
app.use("/admin/*", requireAdminSession);
app.use("/api/admin", requireAdminSession);
app.use("/api/admin/*", requireAdminSession);
app.get("/admin", (c) =>
  c.text("Admin access verified. The editor will appear here."),
);

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

app.notFound((c) => {
  return c.text(
    "Hey, why are you looking over here? There's obviously no content\n\nAnyway, 404. You should just go back.",
    404,
  );
});

app.get("/assets/fonts/*", serveStatic({ root: "./public" }));

serve(
  {
    fetch: app.fetch,
    port: config.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
