import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const poems = sqliteTable("poems", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  writtenAt: text("written_at"),
  publishedAt: text("published_at"),
  tags: text("tags").notNull().default("[]"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("poems_public_idx").on(table.status, table.publishedAt),
  index("poems_owner_idx").on(table.ownerId, table.updatedAt),
]);

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  techStack: text("tech_stack").notNull().default("[]"),
  coverImageUrl: text("cover_image_url"),
  repositoryUrl: text("repository_url"),
  demoUrl: text("demo_url"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("projects_public_idx").on(table.status, table.displayOrder),
  index("projects_owner_idx").on(table.ownerId, table.updatedAt),
]);

export const siteSettings = sqliteTable("site_settings", {
  ownerId: text("owner_id").primaryKey(),
  biography: text("biography"),
  email: text("email"),
  githubUrl: text("github_url"),
  linkedInUrl: text("linkedin_url"),
  resumeUrl: text("resume_url"),
  updatedAt: text("updated_at").notNull(),
});
