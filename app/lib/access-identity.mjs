import { createRemoteJWKSet, jwtVerify } from "jose";
const keySets = new Map();
export function accessConfiguration(config) {
  const domain = (config.ACCESS_TEAM_DOMAIN ?? "").trim().replace(/^https:\/\//, "").replace(/\/$/, "");
  const audience = (config.ACCESS_AUD ?? "").trim();
  const emails = new Set((config.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
  if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain) || !audience || !emails.size) return null;
  return { issuer: `https://${domain}`, audience, emails };
}
// An email header alone never grants access: verify the signature and claims.
export async function verifyAdminIdentity(token, config, testKeySet = undefined) {
  const settings = accessConfiguration(config);
  if (!token || !settings) return null;
  try {
    let keys = testKeySet ?? keySets.get(settings.issuer);
    if (!keys) {
      keys = createRemoteJWKSet(new URL(`${settings.issuer}/cdn-cgi/access/certs`));
      keySets.set(settings.issuer, keys);
    }
    const { payload } = await jwtVerify(token, keys, {
      issuer: settings.issuer, audience: settings.audience, algorithms: ["RS256"], requiredClaims: ["exp", "email"],
    });
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    return settings.emails.has(email) ? email : null;
  } catch { return null; }
}
