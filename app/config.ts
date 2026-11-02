import { z } from "zod";
import { databasePath } from "./db/databasePath.js";

//Validates the app's url
const OriginSchema = z
  .string()
  .refine((value) => {
    if (!URL.canParse(value)) return false;

    const url = new URL(value);

    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash
    );
  }, "Must be an HTTP or HTTPS origin without a path")
  .transform((value) => new URL(value).origin);

//Actually holds the config. Put stuff here to add to global config const
const ConfigSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]),

    PUBLIC_ORIGIN: OriginSchema.optional(),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),

    AUTHENTIK_CLIENT_ID: z.string().optional(),
    AUTHENTIK_ISSUER: z.string().optional(),
    AUTHENTIK_CLIENT_SECRET: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const production = values.NODE_ENV === "production";

    // Production needs an explicitly configured HTTPS origin.
    if (production && !values.PUBLIC_ORIGIN) {
      ctx.addIssue({
        code: "custom",
        path: ["PUBLIC_ORIGIN"],
        message: "PUBLIC_ORIGIN must be set in production",
      });
    } else if (production && !values.PUBLIC_ORIGIN?.startsWith("https://")) {
      ctx.addIssue({
        code: "custom",
        path: ["PUBLIC_ORIGIN"],
        message: "PUBLIC_ORIGIN must use HTTPS in production",
      });
    }

    // Report each missing setting without exposing its value.
    if (production) {
      const requiredSettings = [
        "AUTHENTIK_ISSUER",
        "AUTHENTIK_CLIENT_ID",
        "AUTHENTIK_CLIENT_SECRET",
      ] as const;

      for (const name of requiredSettings) {
        if (!values[name]?.trim()) {
          ctx.addIssue({
            code: "custom",
            path: [name],
            message: `${name} is not set! Please fix it and restart the server`,
          });
        }
      }
    }
  })
  .transform((values) => ({
    ...values,
    DATABASE_PATH: databasePath,
    PUBLIC_ORIGIN: values.PUBLIC_ORIGIN ?? "http://localhost:3000",
  }));

export const config = ConfigSchema.parse(process.env);
