import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("homepage contains the finished portfolio experience", async () => {
  const source = await readFile(new URL("app/page.tsx", root), "utf8");
  assert.match(source, /Zavier/);
  assert.match(source, /thoughtful software/i);
  assert.match(source, /Selected work/);
  assert.doesNotMatch(source, /codex-preview|react-loading-skeleton|SkeletonPreview/i);
});

test("poetry collection has a graceful empty state without invented poems", async () => {
  const [page, content] = await Promise.all([
    readFile(new URL("app/poetry/page.tsx", root), "utf8"),
    readFile(new URL("lib/content.ts", root), "utf8"),
  ]);
  assert.match(page, /The room is ready/);
  assert.match(page, /No poems have been published yet/);
  assert.doesNotMatch(content, /placeholderPoems|samplePoems/);
});

test("public repository queries explicitly filter to published content", async () => {
  const source = await readFile(new URL("db/repository.ts", root), "utf8");
  assert.match(source, /FROM poems WHERE status = 'published'/);
  assert.match(source, /FROM projects WHERE status = 'published'/);
  assert.match(source, /WHERE slug = \? AND status = 'published'/);
  assert.match(source, /NODE_ENV !== "production" \? placeholderProjects/);
  assert.doesNotMatch(source, /SELECT \* FROM poems ORDER BY/);
  assert.doesNotMatch(source, /SELECT \* FROM projects ORDER BY/);
});

test("admin data access is owner-scoped and protected before reads or writes", async () => {
  const [repository, route, auth] = await Promise.all([
    readFile(new URL("db/repository.ts", root), "utf8"),
    readFile(new URL("app/api/admin/content/route.ts", root), "utf8"),
    readFile(new URL("lib/admin-auth.ts", root), "utf8"),
  ]);
  assert.match(repository, /WHERE owner_id = \?/);
  assert.match(repository, /WHERE poems\.owner_id = excluded\.owner_id/);
  assert.match(repository, /WHERE projects\.owner_id = excluded\.owner_id/);
  assert.match(route, /const auth = await owner\(\)/);
  assert.match(auth, /ADMIN_PASSWORD_HASH/);
  assert.match(auth, /ADMIN_SESSION_SECRET/);
  assert.match(auth, /HttpOnly; Secure; SameSite=Strict/);
  assert.match(auth, /PBKDF2/);
  assert.match(auth, /LOGIN_ATTEMPT_LIMIT/);
  assert.match(auth, /NODE_ENV !== "production"/);
});

test("Markdown renderer never injects raw HTML", async () => {
  const source = await readFile(new URL("lib/markdown.tsx", root), "utf8");
  assert.doesNotMatch(source, /dangerouslySetInnerHTML/);
});

test("poems present written and published dates separately", async () => {
  const [dates, reader, collection] = await Promise.all([
    readFile(new URL("components/poem-dates.tsx", root), "utf8"),
    readFile(new URL("app/poetry/[slug]/page.tsx", root), "utf8"),
    readFile(new URL("app/poetry/page.tsx", root), "utf8"),
  ]);
  assert.match(dates, /Written \{written\}/);
  assert.match(dates, /Published \{published\}/);
  assert.match(reader, /writtenAt=\{poem\.writtenAt\}/);
  assert.match(reader, /publishedAt=\{poem\.publishedAt\}/);
  assert.match(collection, /writtenAt=\{poem\.writtenAt\}/);
  assert.match(collection, /publishedAt=\{poem\.publishedAt\}/);
});
