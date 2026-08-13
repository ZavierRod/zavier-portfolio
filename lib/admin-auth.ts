import { env } from "cloudflare:workers";
import { headers } from "next/headers";

const COOKIE_NAME = "__Host-zr-admin";
const SESSION_SECONDS = 60 * 60 * 24 * 7;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPT_LIMIT = 10;

type AdminUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string;
};

type AdminResult =
  | { ok: true; user: AdminUser }
  | { ok: false; reason: "signed-out" | "not-configured" };

function config(name: string): string | undefined {
  const workerValue = (env as unknown as Record<string, unknown>)[name];
  if (typeof workerValue === "string" && workerValue.trim()) return workerValue.trim();
  return typeof process !== "undefined" ? process.env[name]?.trim() : undefined;
}

function ownerId(): string | undefined {
  return config("ADMIN_OWNER_ID") || config("ADMIN_EMAIL") || (process.env.NODE_ENV !== "production" ? "zavier@local.test" : undefined);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

async function hmac(value: string): Promise<Uint8Array> {
  const secret = config("ADMIN_SESSION_SECRET");
  if (!secret) return new Uint8Array();
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function cookieValue(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === COOKIE_NAME) return value.join("=");
  }
  return null;
}

async function validSession(cookieHeader: string | null): Promise<boolean> {
  const value = cookieValue(cookieHeader);
  if (!value) return false;
  const [expiresValue, signatureValue, extra] = value.split(".");
  if (!expiresValue || !signatureValue || extra) return false;
  const expires = Number(expiresValue);
  if (!Number.isSafeInteger(expires) || expires <= Date.now()) return false;
  try {
    const expected = await hmac(`zr-admin:${expiresValue}`);
    return expected.length > 0 && constantTimeEqual(expected, base64UrlToBytes(signatureValue));
  } catch {
    return false;
  }
}

export async function getAdmin(): Promise<AdminResult> {
  const id = ownerId();
  const passwordHash = config("ADMIN_PASSWORD_HASH");
  const sessionSecret = config("ADMIN_SESSION_SECRET");

  if (process.env.NODE_ENV !== "production" && (!passwordHash || !sessionSecret)) {
    const devId = id || "zavier@local.test";
    return { ok: true, user: { userId: devId, email: devId, displayName: "Zavier", fullName: "Zavier Rodrigues" } };
  }

  if (!id || !passwordHash || !sessionSecret) return { ok: false, reason: "not-configured" };
  const requestHeaders = await headers();
  if (!(await validSession(requestHeaders.get("cookie")))) return { ok: false, reason: "signed-out" };
  return { ok: true, user: { userId: id, email: id, displayName: "Zavier", fullName: "Zavier Rodrigues" } };
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const encoded = config("ADMIN_PASSWORD_HASH");
  if (!encoded || password.length < 12 || password.length > 256) return false;
  const [algorithm, iterationsValue, saltValue, hashValue, extra] = encoded.split("$");
  const iterations = Number(iterationsValue);
  if (algorithm !== "pbkdf2-sha256" || !Number.isSafeInteger(iterations) || iterations < 100_000 || !saltValue || !hashValue || extra) return false;
  try {
    const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const salt = base64UrlToBytes(saltValue);
    const derived = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt.buffer as ArrayBuffer, iterations }, material, 256));
    return constantTimeEqual(derived, base64UrlToBytes(hashValue));
  } catch {
    return false;
  }
}

export async function createAdminSessionCookie(): Promise<string> {
  const expires = Date.now() + SESSION_SECONDS * 1000;
  const signature = bytesToBase64Url(await hmac(`zr-admin:${expires}`));
  return `${COOKIE_NAME}=${expires}.${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export function clearAdminSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

function loginDatabase(): D1Database | null {
  return (env as unknown as { DB?: D1Database }).DB || null;
}

async function loginAttemptKey(request: Request): Promise<string> {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return bytesToBase64Url(await hmac(`login-attempt:${ip}`));
}

async function ensureLoginAttemptsTable(db: D1Database) {
  await db.prepare("CREATE TABLE IF NOT EXISTS admin_login_attempts (attempt_key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, window_started TEXT NOT NULL)").run();
}

export async function loginAllowed(request: Request): Promise<boolean> {
  const db = loginDatabase();
  if (!db) return true;
  await ensureLoginAttemptsTable(db);
  const key = await loginAttemptKey(request);
  const row = await db.prepare("SELECT attempts, window_started FROM admin_login_attempts WHERE attempt_key = ? LIMIT 1").bind(key).first<{ attempts: number; window_started: string }>();
  if (!row) return true;
  const windowStarted = new Date(row.window_started).getTime();
  if (!Number.isFinite(windowStarted) || Date.now() - windowStarted >= LOGIN_WINDOW_MS) {
    await db.prepare("DELETE FROM admin_login_attempts WHERE attempt_key = ?").bind(key).run();
    return true;
  }
  return row.attempts < LOGIN_ATTEMPT_LIMIT;
}

export async function recordFailedLogin(request: Request): Promise<void> {
  const db = loginDatabase();
  if (!db) return;
  await ensureLoginAttemptsTable(db);
  const key = await loginAttemptKey(request);
  const now = new Date().toISOString();
  const cutoff = new Date(Date.now() - LOGIN_WINDOW_MS).toISOString();
  await db.prepare(`INSERT INTO admin_login_attempts (attempt_key, attempts, window_started) VALUES (?, 1, ?)
    ON CONFLICT(attempt_key) DO UPDATE SET
      attempts = CASE WHEN admin_login_attempts.window_started < ? THEN 1 ELSE admin_login_attempts.attempts + 1 END,
      window_started = CASE WHEN admin_login_attempts.window_started < ? THEN excluded.window_started ELSE admin_login_attempts.window_started END`)
    .bind(key, now, cutoff, cutoff).run();
}

export async function clearFailedLogins(request: Request): Promise<void> {
  const db = loginDatabase();
  if (!db) return;
  await ensureLoginAttemptsTable(db);
  await db.prepare("DELETE FROM admin_login_attempts WHERE attempt_key = ?").bind(await loginAttemptKey(request)).run();
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
