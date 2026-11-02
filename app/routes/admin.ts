import { Hono } from "hono";
import { requireAdminSession } from "../auth/middleware/requireAdminSession.js";

export function registerAdminRoutes(app: Hono): void {
  app.use("/admin", requireAdminSession);
  app.use("/admin/*", requireAdminSession);
  app.use("/api/admin", requireAdminSession);
  app.use("/api/admin/*", requireAdminSession);
  app.get("/admin", (c) =>
    c.text("Admin access verified. The editor will appear here."),
  );
}
