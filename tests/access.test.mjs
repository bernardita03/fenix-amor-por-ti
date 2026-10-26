import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from "jose";
import { verifyAdminIdentity } from "../app/lib/access-identity.mjs";
const config = { ACCESS_TEAM_DOMAIN: "fenix-test.cloudflareaccess.com", ACCESS_AUD: "fenix-test-audience", ADMIN_EMAILS: "admin@example.com" };
const { publicKey, privateKey } = await generateKeyPair("RS256");
const jwk = await exportJWK(publicKey);
const keys = createLocalJWKSet({ keys: [{ ...jwk, kid: "test", alg: "RS256" }] });
async function token(overrides = {}, key = privateKey) {
  return new SignJWT({ email: "admin@example.com", ...overrides }).setProtectedHeader({ alg: "RS256", kid: "test" })
    .setIssuer(overrides.iss ?? "https://fenix-test.cloudflareaccess.com").setAudience(overrides.aud ?? config.ACCESS_AUD)
    .setExpirationTime(overrides.exp ?? "5m").sign(key);
}
test("accepts only a signed token for an allowed email", async () => {
  assert.equal(await verifyAdminIdentity(await token(), config, keys), "admin@example.com");
});
test("denies missing configuration and missing or forged tokens", async () => {
  assert.equal(await verifyAdminIdentity(null, config, keys), null);
  assert.equal(await verifyAdminIdentity(await token(), {}, keys), null);
  assert.equal(await verifyAdminIdentity("forged", config, keys), null);
  const other = await generateKeyPair("RS256");
  assert.equal(await verifyAdminIdentity(await token({}, other.privateKey), config, keys), null);
});
test("denies wrong issuer, audience, expired session and unauthorized email", async () => {
  for (const overrides of [{ iss: "https://other.cloudflareaccess.com" }, { aud: "other" }, { exp: 1 }, { email: "stranger@example.com" }]) {
    assert.equal(await verifyAdminIdentity(await token(overrides), config, keys), null);
  }
});
