import { env } from "cloudflare:workers";
import type { ContentStatus, Poem, Project } from "../lib/content";
import { placeholderProjects } from "../lib/content";

type Row = Record<string, unknown>;

function database(): D1Database {
  if (!env.DB) throw new Error("The DB binding is unavailable.");
  return env.DB;
}

export async function ensureSchema() {
  const db = database();
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS poems (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      excerpt TEXT,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      is_featured INTEGER NOT NULL DEFAULT 0,
      written_at TEXT,
      published_at TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS poems_public_idx ON poems (status, published_at DESC)"),
    db.prepare("CREATE INDEX IF NOT EXISTS poems_owner_idx ON poems (owner_id, updated_at DESC)"),
    db.prepare(`CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      is_featured INTEGER NOT NULL DEFAULT 0,
      tech_stack TEXT NOT NULL DEFAULT '[]',
      cover_image_url TEXT,
      repository_url TEXT,
      demo_url TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS projects_public_idx ON projects (status, display_order ASC)"),
    db.prepare("CREATE INDEX IF NOT EXISTS projects_owner_idx ON projects (owner_id, updated_at DESC)"),
    db.prepare(`CREATE TABLE IF NOT EXISTS site_settings (
      owner_id TEXT PRIMARY KEY,
      biography TEXT,
      email TEXT,
      github_url TEXT,
      linkedin_url TEXT,
      resume_url TEXT,
      updated_at TEXT NOT NULL
    )`),
  ]);
  const projectColumns = await db.prepare("PRAGMA table_info(projects)").all<{ name: string }>();
  if (!projectColumns.results.some((column) => column.name === "cover_image_url")) {
    await db.prepare("ALTER TABLE projects ADD COLUMN cover_image_url TEXT").run();
  }
}

function array(value: unknown): string[] {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function poem(row: Row): Poem {
  return {
    id: String(row.id), ownerId: String(row.owner_id), title: String(row.title), slug: String(row.slug),
    content: String(row.content), excerpt: row.excerpt ? String(row.excerpt) : null,
    status: String(row.status) as ContentStatus, isFeatured: Boolean(row.is_featured),
    writtenAt: row.written_at ? String(row.written_at) : null,
    publishedAt: row.published_at ? String(row.published_at) : null,
    tags: array(row.tags), createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

function project(row: Row): Project {
  return {
    id: String(row.id), ownerId: String(row.owner_id), title: String(row.title), slug: String(row.slug),
    summary: String(row.summary), content: String(row.content), status: String(row.status) as ContentStatus,
    isFeatured: Boolean(row.is_featured), techStack: array(row.tech_stack),
    coverImageUrl: row.cover_image_url ? String(row.cover_image_url) : null,
    repositoryUrl: row.repository_url ? String(row.repository_url) : null,
    demoUrl: row.demo_url ? String(row.demo_url) : null,
    displayOrder: Number(row.display_order), createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

export async function getPublicPoems(): Promise<Poem[]> {
  try {
    await ensureSchema();
    const result = await database().prepare("SELECT * FROM poems WHERE status = 'published' ORDER BY published_at DESC, created_at DESC").all<Row>();
    return result.results.map(poem);
  } catch {
    return [];
  }
}

export async function getPublicPoem(slug: string): Promise<Poem | null> {
  try {
    await ensureSchema();
    const row = await database().prepare("SELECT * FROM poems WHERE slug = ? AND status = 'published' LIMIT 1").bind(slug).first<Row>();
    return row ? poem(row) : null;
  } catch {
    return null;
  }
}

export async function getPublicProjects(): Promise<Project[]> {
  try {
    await ensureSchema();
    const result = await database().prepare("SELECT * FROM projects WHERE status = 'published' ORDER BY display_order ASC, created_at DESC").all<Row>();
    return result.results.length ? result.results.map(project) : (process.env.NODE_ENV !== "production" ? placeholderProjects : []);
  } catch {
    return process.env.NODE_ENV !== "production" ? placeholderProjects : [];
  }
}

export async function getPublicProject(slug: string): Promise<Project | null> {
  try {
    await ensureSchema();
    const row = await database().prepare("SELECT * FROM projects WHERE slug = ? AND status = 'published' LIMIT 1").bind(slug).first<Row>();
    if (row) return project(row);
  } catch {
    // Local prototypes use clearly labelled sample content.
  }
  return process.env.NODE_ENV !== "production" ? placeholderProjects.find((item) => item.slug === slug) ?? null : null;
}

export async function listOwnerContent(ownerId: string) {
  await ensureSchema();
  const [poemsResult, projectsResult] = await Promise.all([
    database().prepare("SELECT * FROM poems WHERE owner_id = ? ORDER BY updated_at DESC").bind(ownerId).all<Row>(),
    database().prepare("SELECT * FROM projects WHERE owner_id = ? ORDER BY display_order ASC, updated_at DESC").bind(ownerId).all<Row>(),
  ]);
  return { poems: poemsResult.results.map(poem), projects: projectsResult.results.map(project) };
}

export async function savePoem(ownerId: string, input: Partial<Poem> & Pick<Poem, "title" | "slug" | "content">): Promise<Poem> {
  await ensureSchema();
  const now = new Date().toISOString();
  const id = input.id || crypto.randomUUID();
  const status: ContentStatus = input.status === "published" ? "published" : "draft";
  const publishedAt = status === "published" ? (input.publishedAt || now) : null;
  await database().prepare(`INSERT INTO poems (id, owner_id, title, slug, content, excerpt, status, is_featured, written_at, published_at, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET title=excluded.title, slug=excluded.slug, content=excluded.content, excerpt=excluded.excerpt, status=excluded.status, is_featured=excluded.is_featured, written_at=excluded.written_at, published_at=excluded.published_at, tags=excluded.tags, updated_at=excluded.updated_at
    WHERE poems.owner_id = excluded.owner_id`)
    .bind(id, ownerId, input.title, input.slug, input.content, input.excerpt || null, status, input.isFeatured ? 1 : 0, input.writtenAt || null, publishedAt, JSON.stringify(input.tags || []), input.createdAt || now, now).run();
  const row = await database().prepare("SELECT * FROM poems WHERE id = ? AND owner_id = ?").bind(id, ownerId).first<Row>();
  if (!row) throw new Error("The poem could not be saved.");
  return poem(row);
}

export async function saveProject(ownerId: string, input: Partial<Project> & Pick<Project, "title" | "slug" | "summary" | "content">): Promise<Project> {
  await ensureSchema();
  const now = new Date().toISOString();
  const id = input.id || crypto.randomUUID();
  const status: ContentStatus = input.status === "published" ? "published" : "draft";
  await database().prepare(`INSERT INTO projects (id, owner_id, title, slug, summary, content, status, is_featured, tech_stack, cover_image_url, repository_url, demo_url, display_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET title=excluded.title, slug=excluded.slug, summary=excluded.summary, content=excluded.content, status=excluded.status, is_featured=excluded.is_featured, tech_stack=excluded.tech_stack, cover_image_url=excluded.cover_image_url, repository_url=excluded.repository_url, demo_url=excluded.demo_url, display_order=excluded.display_order, updated_at=excluded.updated_at
    WHERE projects.owner_id = excluded.owner_id`)
    .bind(id, ownerId, input.title, input.slug, input.summary, input.content, status, input.isFeatured ? 1 : 0, JSON.stringify(input.techStack || []), input.coverImageUrl || null, input.repositoryUrl || null, input.demoUrl || null, input.displayOrder || 0, input.createdAt || now, now).run();
  const row = await database().prepare("SELECT * FROM projects WHERE id = ? AND owner_id = ?").bind(id, ownerId).first<Row>();
  if (!row) throw new Error("The project could not be saved.");
  return project(row);
}

export async function deleteOwnerContent(ownerId: string, kind: "poem" | "project", id: string) {
  await ensureSchema();
  const table = kind === "poem" ? "poems" : "projects";
  await database().prepare(`DELETE FROM ${table} WHERE id = ? AND owner_id = ?`).bind(id, ownerId).run();
}
