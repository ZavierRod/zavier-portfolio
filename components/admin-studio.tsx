"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PoemDates } from "./poem-dates";
import type { Poem, Project } from "../lib/content";
import { formatDate, slugify } from "../lib/content";
import { Markdown } from "../lib/markdown";

type Kind = "poem" | "project";
type StudioData = { poems: Poem[]; projects: Project[] };

const emptyPoem = (): Partial<Poem> => ({ title: "", slug: "", content: "", excerpt: "", status: "draft", isFeatured: false, tags: [] });
const emptyProject = (): Partial<Project> => ({ title: "", slug: "", summary: "", content: "", status: "draft", isFeatured: false, techStack: [], displayOrder: 0 });

export function AdminStudio({ displayName }: { displayName: string }) {
  const [kind, setKind] = useState<Kind>("poem");
  const [data, setData] = useState<StudioData>({ poems: [], projects: [] });
  const [draft, setDraft] = useState<Partial<Poem & Project>>(emptyPoem());
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/content", { cache: "no-store" });
      const payload = await response.json() as StudioData & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not load content.");
      setData(payload);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not load content.");
    } finally { setBusy(false); }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/content", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as StudioData & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Could not load content.");
        if (!cancelled) setData(payload);
      })
      .catch((error: unknown) => { if (!cancelled) setNotice(error instanceof Error ? error.message : "Could not load content."); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, []);

  const items = kind === "poem" ? data.poems : data.projects;
  const statusCopy = useMemo(() => `${items.filter((item) => item.status === "published").length} published · ${items.filter((item) => item.status === "draft").length} drafts`, [items]);

  function startNew(nextKind = kind) {
    setKind(nextKind);
    setDraft(nextKind === "poem" ? emptyPoem() : emptyProject());
    setMode("write");
    setNotice("");
  }

  function edit(item: Poem | Project) {
    setKind("summary" in item ? "project" : "poem");
    setDraft(item as Partial<Poem & Project>);
    setMode("write");
    setNotice("");
  }

  function update(field: string, value: unknown) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function save(status: "draft" | "published") {
    setBusy(true); setNotice("");
    const payload = { ...draft, kind, status, slug: draft.slug || slugify(draft.title || ""), tags: draft.tags || [], techStack: draft.techStack || [] };
    try {
      const response = await fetch("/api/admin/content", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { item?: Poem | Project; error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save.");
      setDraft(result.item as Partial<Poem & Project>);
      setNotice(status === "published" ? "Published successfully." : "Draft saved.");
      await load();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save."); setBusy(false); }
  }

  async function remove() {
    if (!draft.id || !window.confirm(`Permanently delete “${draft.title}”? This cannot be undone.`)) return;
    setBusy(true);
    const response = await fetch("/api/admin/content", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: draft.id, kind }) });
    if (response.ok) { startNew(); await load(); setNotice("Deleted."); } else { setNotice("Could not delete this item."); setBusy(false); }
  }

  return (
    <div className="studio-shell">
      <aside className="studio-sidebar">
        <div className="studio-brand"><span className="brand-mark">ZR</span><div><strong>Owner studio</strong><small>{displayName}</small></div></div>
        <div className="studio-tabs" role="tablist" aria-label="Content type">
          <button className={kind === "poem" ? "active" : ""} onClick={() => startNew("poem")}>Poetry</button>
          <button className={kind === "project" ? "active" : ""} onClick={() => startNew("project")}>Projects</button>
        </div>
        <div className="studio-list-head"><span>{statusCopy}</span><button onClick={() => startNew()}>+ New</button></div>
        <div className="studio-list">
          {busy && items.length === 0 ? <p className="studio-empty">Loading your work…</p> : null}
          {!busy && items.length === 0 ? <p className="studio-empty">Nothing here yet. Start with a title and a first line.</p> : null}
          {items.map((item) => (
            <button key={item.id} className={draft.id === item.id ? "selected" : ""} onClick={() => edit(item)}>
              <span>{item.title}</span><small><i className={item.status} />{item.status} · {formatDate(item.updatedAt)}</small>
            </button>
          ))}
        </div>
        <Link className="back-site" href="/">← Back to the site</Link>
      </aside>

      <main className="studio-editor">
        <header className="editor-toolbar">
          <div className="segmented"><button className={mode === "write" ? "active" : ""} onClick={() => setMode("write")}>Write</button><button className={mode === "preview" ? "active" : ""} onClick={() => setMode("preview")}>Preview</button></div>
          <div className="editor-actions">
            {notice ? <span role="status">{notice}</span> : null}
            {draft.id ? <button className="danger-button" onClick={remove} disabled={busy}>Delete</button> : null}
            <button className="secondary-button" onClick={() => save("draft")} disabled={busy}>Save draft</button>
            <button className="primary-button" onClick={() => save("published")} disabled={busy}>{draft.status === "published" ? "Update" : "Publish"}</button>
          </div>
        </header>

        {mode === "write" ? (
          <div className="editor-form">
            <p className="eyebrow">{draft.id ? "Editing" : "New"} {kind}</p>
            <input className="title-input" aria-label="Title" placeholder={kind === "poem" ? "An untitled feeling" : "Project name"} value={draft.title || ""} onChange={(event) => { update("title", event.target.value); if (!draft.id) update("slug", slugify(event.target.value)); }} />
            <div className="field-grid">
              <label>URL slug<input value={draft.slug || ""} onChange={(event) => update("slug", slugify(event.target.value))} /></label>
              {kind === "poem" ? <label>Written date<input type="date" value={draft.writtenAt?.slice(0, 10) || ""} onChange={(event) => update("writtenAt", event.target.value)} /></label> : <label>Display order<input type="number" value={draft.displayOrder || 0} onChange={(event) => update("displayOrder", Number(event.target.value))} /></label>}
            </div>
            {kind === "poem" ? <label>Short excerpt<textarea className="compact-area" value={draft.excerpt || ""} onChange={(event) => update("excerpt", event.target.value)} placeholder="Optional introduction for the collection page" /></label> : <label>Project summary<textarea className="compact-area" value={draft.summary || ""} onChange={(event) => update("summary", event.target.value)} placeholder="A concise, specific overview" /></label>}
            <label>{kind === "poem" ? "Poem" : "Case study"}<textarea className="body-area" value={draft.content || ""} onChange={(event) => update("content", event.target.value)} placeholder={kind === "poem" ? "Write freely. Blank lines become stanza breaks." : "## The problem\n\nDescribe the motivation…"} /></label>
            <div className="field-grid">
              <label>{kind === "poem" ? "Themes" : "Technology"}<input value={(kind === "poem" ? draft.tags : draft.techStack)?.join(", ") || ""} onChange={(event) => update(kind === "poem" ? "tags" : "techStack", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} placeholder="Comma separated" /></label>
              <label className="check-label"><input type="checkbox" checked={draft.isFeatured || false} onChange={(event) => update("isFeatured", event.target.checked)} /> Feature on the homepage</label>
            </div>
            {kind === "poem" ? <div className="field-grid"><label>Publication date<input type="datetime-local" value={draft.publishedAt?.slice(0, 16) || ""} onChange={(event) => update("publishedAt", event.target.value)} /></label><span /></div> : null}
            {kind === "project" ? <><label>Cover image URL<input type="url" value={draft.coverImageUrl || ""} onChange={(event) => update("coverImageUrl", event.target.value)} placeholder="https://…" /></label><div className="field-grid"><label>Repository URL<input type="url" value={draft.repositoryUrl || ""} onChange={(event) => update("repositoryUrl", event.target.value)} /></label><label>Live URL<input type="url" value={draft.demoUrl || ""} onChange={(event) => update("demoUrl", event.target.value)} /></label></div></> : null}
          </div>
        ) : (
          <article className={`editor-preview ${kind === "poem" ? "poetry-preview" : ""}`}>
            <p className="eyebrow">Private preview</p>
            <h1>{draft.title || "Untitled"}</h1>
            {kind === "poem" ? <PoemDates writtenAt={draft.writtenAt} publishedAt={draft.publishedAt} /> : null}
            {kind === "project" && draft.summary ? <p className="preview-lede">{draft.summary}</p> : null}
            <Markdown content={draft.content || (kind === "poem" ? "Your poem will appear here." : "Your case study will appear here.")} poetry={kind === "poem"} />
          </article>
        )}
      </main>
    </div>
  );
}
