import type { Metadata } from "next";
import { PoemDates } from "../../components/poem-dates";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { getPublicPoems } from "../../db/repository";

export const metadata: Metadata = { title: "Poetry", description: "Poems by Zavier Rodrigues—a quieter room for attention, memory, and being human.", alternates: { canonical: "/poetry" } };

export default async function PoetryPage() {
  const poems = await getPublicPoems();
  return <div className="site-shell poetry-shell"><SiteHeader /><main className="poetry-page section-pad"><header className="poetry-page-intro"><p className="eyebrow">Poetry</p><h1>A place to notice.</h1><p>Words about memory, becoming, and the small moments that ask us to stay.</p></header>{poems.length ? <div className="poem-list">{poems.map((poem, index) => <a key={poem.id} href={`/poetry/${poem.slug}`}><span className="poem-index">{String(index + 1).padStart(2, "0")}</span><div><h2>{poem.title}</h2><p>{poem.excerpt || poem.content.split("\n")[0]}</p><div>{poem.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><PoemDates writtenAt={poem.writtenAt} publishedAt={poem.publishedAt} compact /><b aria-hidden="true">→</b></a>)}</div> : <section className="poetry-empty"><span aria-hidden="true">✦</span><h2>The room is ready.</h2><p>No poems have been published yet. When Zavier releases the first one, it will appear here—quietly, with space to breathe.</p></section>}</main><SiteFooter /></div>;
}
