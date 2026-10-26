import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Falta el binding D1 DB. Configura tu base de datos en wrangler.jsonc."
    );
  }

  return drizzle(env.DB, { schema });
}
