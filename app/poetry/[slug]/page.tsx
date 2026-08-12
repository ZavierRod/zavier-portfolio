import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PoemDates } from "../../../components/poem-dates";
import { getPublicPoem, getPublicPoems } from "../../../db/repository";
import { Markdown } from "../../../lib/markdown";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const poem = await getPublicPoem((await params).slug);
  return poem ? { title: poem.title, description: poem.excerpt || `A poem by Zavier Rodrigues.`, alternates: { canonical: `/poetry/${poem.slug}` } } : { title: "Poem not found" };
}

export default async function PoemPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const [poem, poems] = await Promise.all([getPublicPoem(slug), getPublicPoems()]);
  if (!poem) notFound();
  const index = poems.findIndex((item) => item.id === poem.id);
  const previous = index > 0 ? poems[index - 1] : null;
  const next = index >= 0 && index < poems.length - 1 ? poems[index + 1] : null;
  return <main className="poem-reader"><nav><a href="/" className="brand"><span className="brand-mark">ZR</span><span>Zavier Rodrigues</span></a><a href="/poetry">All poems</a></nav><article><header><p className="eyebrow">A poem by Zavier Rodrigues</p><h1>{poem.title}</h1><div><PoemDates writtenAt={poem.writtenAt} publishedAt={poem.publishedAt} />{poem.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></header><Markdown content={poem.content} poetry /><footer><span>— Zavier</span></footer></article><nav className="poem-pagination">{previous ? <a href={`/poetry/${previous.slug}`}><small>Previous</small><strong>← {previous.title}</strong></a> : <span />}{next ? <a href={`/poetry/${next.slug}`}><small>Next</small><strong>{next.title} →</strong></a> : <a href="/poetry"><small>Return</small><strong>All poems →</strong></a>}</nav></main>;
}
