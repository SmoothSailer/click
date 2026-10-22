import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "trucks_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set a random string of at least 16 characters in .env.local",
    );
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/**
 * Creates a signed, expiring session token.
 * Format: `<expiresAtMs>.<hmac-sha256>`
 */
export function createSessionToken(
  ttlSeconds: number = SESSION_TTL_SECONDS,
): string {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

/** Verifies signature and expiry. Never throws. */
export function verifySessionToken(
  token: string | null | undefined,
): boolean {
  if (!token) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return false;
  }

  const provided = Buffer.from(signature);
  const reference = Buffer.from(expected);
  if (provided.length !== reference.length) return false;
  if (!timingSafeEqual(provided, reference)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

/**
 * Constant-time password comparison. Hashing first keeps both buffers the
 * same length, so the comparison does not leak the password length.
 */
export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const providedHash = createHash("sha256").update(password).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
}
