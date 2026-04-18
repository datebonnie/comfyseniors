import crypto from "crypto";

/**
 * Stateless unsubscribe tokens signed with HMAC-SHA256.
 *
 * Why HMAC:
 * - No DB lookup needed to verify — one-click endpoint is O(1)
 * - Tokens cannot be forged without the secret
 * - Tokens don't expire (unsubscribe requests have no valid reason to expire)
 * - Deterministic: same email always produces the same token, so the link
 *   in a sent email still works even if we rebuild the sender system
 *
 * Secret comes from env: UNSUBSCRIBE_SECRET (32+ random chars).
 */

function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "UNSUBSCRIBE_SECRET must be set to a 16+ char random string."
    );
  }
  return secret;
}

/**
 * Base64url encode (URL-safe, no padding).
 */
function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Generate a stable unsubscribe token for an email.
 * Same email → same token, always. That's fine — the token isn't a secret,
 * it's a signature proving the request came from a link WE generated.
 */
export function signUnsubscribeToken(email: string): string {
  const normalized = email.trim().toLowerCase();
  const hmac = crypto.createHmac("sha256", getSecret());
  hmac.update(normalized);
  // Truncate to 16 bytes (128 bits) — plenty of collision resistance
  return b64url(hmac.digest().subarray(0, 16));
}

/**
 * Verify a token matches the claimed email. Constant-time comparison.
 */
export function verifyUnsubscribeToken(email: string, token: string): boolean {
  try {
    const expected = signUnsubscribeToken(email);
    if (expected.length !== token.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

/**
 * Build the full unsubscribe URL for an email.
 */
export function unsubscribeUrl(
  email: string,
  siteOrigin = "https://comfyseniors.com"
): string {
  const token = signUnsubscribeToken(email);
  const e = encodeURIComponent(email);
  return `${siteOrigin}/unsubscribe?e=${e}&t=${token}`;
}
