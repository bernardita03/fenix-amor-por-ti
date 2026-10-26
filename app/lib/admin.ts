import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { accessConfiguration, verifyAdminIdentity } from "./access-identity.mjs";
export function adminIsConfigured() { return Boolean(accessConfiguration(env)); }
export async function currentAdminEmail() {
  const requestHeaders = await headers();
  return verifyAdminIdentity(requestHeaders.get("cf-access-jwt-assertion"), env);
}
export async function requireAdminApi() {
  const email = await currentAdminEmail();
  if (!email) return { error: Response.json({ error: "Acceso administrativo no autorizado." }, { status: 403, headers: { "Cache-Control": "private, no-store" } }) };
  return { email };
}
