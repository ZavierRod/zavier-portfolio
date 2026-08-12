import type { Project } from "../lib/content";

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  return (
    <article className={`project-card accent-${project.accent ?? (["blue", "yellow", "coral"][index % 3])}`}>
      <a href={`/projects/${project.slug}`} aria-label={`View ${project.title} case study`}>
        <div className="project-visual" aria-hidden="true">
          <span className="project-number">0{index + 1}</span>
          <div className="project-orbit"><span /></div>
        </div>
        <div className="project-copy">
          <div className="card-kicker">
            <span>{project.techStack.slice(0, 2).join(" · ")}</span>
            {project.isPlaceholder ? <span className="sample-badge">Sample content</span> : null}
          </div>
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
          <span className="text-link">Explore the case study <span aria-hidden="true">→</span></span>
        </div>
      </a>
    </article>
  );
}
