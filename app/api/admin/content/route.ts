import { deleteOwnerContent, listOwnerContent, savePoem, saveProject } from "../../../../db/repository";
import { getAdmin } from "../../../../lib/admin-auth";
import { slugify } from "../../../../lib/content";

export const dynamic = "force-dynamic";

function error(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function owner() {
  const admin = await getAdmin();
  if (!admin.ok) return { response: error(admin.reason === "not-owner" ? "This account is not authorized." : "Authentication is required.", admin.reason === "not-owner" ? 403 : 401) };
  // The admin allowlist already verifies this address server-side. Using the
  // normalized email as the content key keeps imported work editable after a
  // deployment, where the platform-issued user ID is different from local dev.
  return { ownerId: admin.user.email.toLowerCase() };
}

function text(value: unknown, max = 10000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function list(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, 40)).filter(Boolean).slice(0, 12)
    : [];
}

function optionalUrl(value: unknown): string | null {
  const candidate = text(value, 500);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const auth = await owner();
  if (auth.response) return auth.response;
  try {
    return Response.json(await listOwnerContent(auth.ownerId!));
  } catch {
    return error("The writing studio could not reach its local content database.", 503);
  }
}

export async function POST(request: Request) {
  const auth = await owner();
  if (auth.response) return auth.response;
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return error("Invalid request.", 400); }

  const kind = body.kind;
  const title = text(body.title, 140);
  const slug = slugify(text(body.slug, 100) || title);
  const content = text(body.content, 100000);
  if ((kind !== "poem" && kind !== "project") || !title || !slug || !content) return error("A title, slug, and body are required.", 400);

  try {
    if (kind === "poem") {
      const item = await savePoem(auth.ownerId!, {
        id: text(body.id, 80) || undefined,
        title, slug, content,
        excerpt: text(body.excerpt, 300) || null,
        status: body.status === "published" ? "published" : "draft",
        isFeatured: body.isFeatured === true,
        writtenAt: text(body.writtenAt, 30) || null,
        publishedAt: text(body.publishedAt, 40) || null,
        tags: list(body.tags),
      });
      return Response.json({ item });
    }

    const summary = text(body.summary, 320);
    if (!summary) return error("A project summary is required.", 400);
    const item = await saveProject(auth.ownerId!, {
      id: text(body.id, 80) || undefined,
      title, slug, summary, content,
      status: body.status === "published" ? "published" : "draft",
      isFeatured: body.isFeatured === true,
      techStack: list(body.techStack),
      coverImageUrl: optionalUrl(body.coverImageUrl),
      repositoryUrl: optionalUrl(body.repositoryUrl),
      demoUrl: optionalUrl(body.demoUrl),
      displayOrder: Math.max(0, Math.min(999, Number(body.displayOrder) || 0)),
    });
    return Response.json({ item });
  } catch (caught) {
    const message = caught instanceof Error && /unique/i.test(caught.message) ? "That slug is already in use." : "The content could not be saved.";
    return error(message, message.includes("slug") ? 409 : 500);
  }
}

export async function DELETE(request: Request) {
  const auth = await owner();
  if (auth.response) return auth.response;
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return error("Invalid request.", 400); }
  const id = text(body.id, 80);
  const kind = body.kind === "project" ? "project" : body.kind === "poem" ? "poem" : null;
  if (!kind || !id) return error("A content type and id are required.", 400);
  await deleteOwnerContent(auth.ownerId!, kind, id);
  return Response.json({ ok: true });
}
