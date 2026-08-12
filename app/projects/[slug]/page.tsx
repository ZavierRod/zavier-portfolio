import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "../../../components/site-footer";
import { SiteHeader } from "../../../components/site-header";
import { getPublicProject } from "../../../db/repository";
import { Markdown } from "../../../lib/markdown";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = await getPublicProject((await params).slug);
  return project ? { title: project.title, description: project.summary, alternates: { canonical: `/projects/${project.slug}` } } : { title: "Project not found" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = await getPublicProject((await params).slug);
  if (!project) notFound();
  return <div className="site-shell"><SiteHeader /><main className="case-study"><section className={`case-hero accent-${project.accent ?? "blue"}`}><a className="back-link" href="/projects">← All projects</a><div className="case-title"><p className="eyebrow">Case study {project.isPlaceholder ? "· Sample content" : ""}</p><h1>{project.title}</h1><p>{project.summary}</p><div className="tag-row">{project.techStack.map((tech) => <span key={tech}>{tech}</span>)}</div></div>{project.coverImageUrl ? <div className="case-cover" role="img" aria-label={`${project.title} project cover`} style={{ backgroundImage: `url(${project.coverImageUrl})` }} /> : <div className="case-art" aria-hidden="true"><span>{project.title.slice(0, 2)}</span><div /></div>}</section><section className="case-body"><aside><span>Role</span><strong>{project.isPlaceholder ? "Details to verify" : "Covered in the story"}</strong><span>Status</span><strong>{project.isPlaceholder ? "Pre-launch concept" : "Published"}</strong>{project.repositoryUrl ? <a href={project.repositoryUrl}>View repository ↗</a> : null}{project.demoUrl ? <a href={project.demoUrl}>View live site ↗</a> : null}</aside><article>{project.isPlaceholder ? <div className="content-warning"><strong>Sample case study</strong><p>This story is intentionally incomplete until Zavier verifies his role, engineering decisions, visuals, and outcomes.</p></div> : null}<Markdown content={project.content} /></article></section><section className="next-project"><p className="eyebrow">Continue exploring</p><a href="/projects">See the full project collection <span>→</span></a></section></main><SiteFooter /></div>;
}
