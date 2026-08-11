import type { Metadata } from "next";
import { ProjectCard } from "../../components/project-card";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { getPublicProjects } from "../../db/repository";

export const metadata: Metadata = { title: "Selected work", description: "Software projects and product case studies by Zavier Rodrigues.", alternates: { canonical: "/projects" } };

export default async function ProjectsPage() {
  const projects = await getPublicProjects();
  return <div className="site-shell"><SiteHeader /><main className="collection-page section-pad"><header className="page-intro"><p className="eyebrow">Selected work</p><h1>Ideas made tangible.</h1><p>A small collection of products, experiments, and systems—each shaped by a real question and built with care.</p></header>{projects.length ? <><div className="project-collection">{projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}</div>{projects.some((project) => project.isPlaceholder) ? <aside className="placeholder-note"><strong>A note on this collection</strong><p>Project details currently shown as “Sample content” come from the initial build brief and still need Zavier’s verification, imagery, links, and final outcomes before launch.</p></aside> : null}</> : <section className="poetry-empty"><span aria-hidden="true">✦</span><h2>The case studies are being prepared.</h2><p>Verified project stories will appear here as soon as they’re ready to share.</p></section>}</main><SiteFooter /></div>;
}
