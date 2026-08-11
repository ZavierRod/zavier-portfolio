import { env } from "cloudflare:workers";
import { getChatGPTUser, type ChatGPTUser } from "../app/chatgpt-auth";

type AdminResult =
  | { ok: true; user: ChatGPTUser }
  | { ok: false; reason: "signed-out" | "not-owner" | "not-configured" };

function config(name: string): string | undefined {
  const workerValue = (env as unknown as Record<string, unknown>)[name];
  if (typeof workerValue === "string" && workerValue.trim()) return workerValue.trim();
  return typeof process !== "undefined" ? process.env[name]?.trim() : undefined;
}

export async function getAdmin(): Promise<AdminResult> {
  let user = await getChatGPTUser();
  const devEmail = config("ADMIN_DEV_EMAIL") || (process.env.NODE_ENV !== "production" ? "zavier@local.test" : undefined);
  if (!user && process.env.NODE_ENV !== "production" && devEmail) {
    user = { userId: `local:${devEmail}`, email: devEmail, displayName: "Zavier", fullName: "Zavier Rodrigues" };
  }
  if (!user) return { ok: false, reason: "signed-out" };

  const ownerEmail = config("ADMIN_EMAIL") || (process.env.NODE_ENV !== "production" ? devEmail : undefined);
  if (!ownerEmail) return { ok: false, reason: "not-configured" };
  if (user.email.toLowerCase() !== ownerEmail.toLowerCase()) return { ok: false, reason: "not-owner" };
  return { ok: true, user };
}
