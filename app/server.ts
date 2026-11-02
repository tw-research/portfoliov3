import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { config } from "./config.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { registerPublicRoutes } from "./routes/public.js";

const app = new Hono({ strict: false });

registerAuthRoutes(app);
registerAdminRoutes(app);
registerPublicRoutes(app);

app.notFound((c) => {
  return c.text(
    "Hey, why are you looking over here? There's obviously no content\n\nAnyway, 404. You should just go back.",
    404,
  );
});

serve(
  {
    fetch: app.fetch,
    port: config.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
