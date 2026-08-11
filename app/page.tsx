import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "../components/project-card";
import { PoemDates } from "../components/poem-dates";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { getPublicPoems, getPublicProjects } from "../db/repository";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const [projects, poems] = await Promise.all([getPublicProjects(), getPublicPoems()]);
  const featuredProjects = projects.filter((item) => item.isFeatured).slice(0, 2);
  const featuredPoem = poems.find((item) => item.isFeatured) ?? poems[0];

  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <section className="hero section-pad">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> Software engineer · Writer · Tutor</p>
            <h1>I build thoughtful software <span>and write about being human.</span></h1>
            <p className="hero-lede">I’m Zavier—a Computer Science and Economics student at UC Berkeley, drawn to ambitious products, clear systems, and ideas that make life feel a little more connected.</p>
            <div className="button-row">
              <Link className="primary-button" href="/projects">View my work <span aria-hidden="true">→</span></Link>
              <Link className="secondary-button" href="/poetry">Read my poetry <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </section>

        {featuredProjects.length ? <section className="work-section section-pad">
          <div className="section-heading">
            <div><p className="eyebrow">Selected work</p><h2>Building with curiosity<br />and intention.</h2></div>
            <Link className="text-link" href="/projects">See all projects <span aria-hidden="true">→</span></Link>
          </div>
          <div className="featured-grid">
            {featuredProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
          </div>
        </section> : null}

        <section className="principles section-pad">
          <p className="eyebrow">How I work</p>
          <div className="principle-grid">
            <article><span>01</span><h3>Start with the human.</h3><p>Understand the person, the pressure, and the real need before choosing the technology.</p></article>
            <article><span>02</span><h3>Make complexity legible.</h3><p>Shape systems and interfaces that feel calm, even when the machinery underneath is not.</p></article>
            <article><span>03</span><h3>Care about the finish.</h3><p>Reliability, accessibility, and the small details are part of the idea—not polish added later.</p></article>
          </div>
        </section>

        <section className="poetry-feature section-pad">
          <div className="poetry-intro"><p className="eyebrow">A quieter room</p><h2>Poetry lives here, too.</h2><p>Alongside the systems and screens, I write to notice what code can’t quite hold.</p><Link className="text-link" href="/poetry">Enter the poetry room <span aria-hidden="true">→</span></Link></div>
          {featuredPoem ? (
            <Link className="poem-card" href={`/poetry/${featuredPoem.slug}`}>
              <span className="poem-mark">“</span><p>{featuredPoem.excerpt || featuredPoem.content.split("\n").slice(0, 4).join(" / ")}</p><footer><strong>{featuredPoem.title}</strong><PoemDates writtenAt={featuredPoem.writtenAt} publishedAt={featuredPoem.publishedAt} compact /></footer>
            </Link>
          ) : (
            <div className="poem-card empty-poem"><span className="poem-mark">“</span><p>The first poem is still finding its way to the page.</p><footer><strong>A space held open</strong><span>Poetry coming soon</span></footer></div>
          )}
        </section>

        <section className="about-strip section-pad">
          <div className="portrait-placeholder" aria-label="Portrait placeholder"><span>ZR</span></div>
          <div><p className="eyebrow">A little about me</p><h2>Engineering gives ideas structure. Writing gives them breath.</h2><p>I study Computer Science and Economics at UC Berkeley. I’m interested in products where technology, behavior, and culture meet—and in helping other people find confidence in difficult ideas.</p><Link className="secondary-button" href="/about">More about me <span aria-hidden="true">→</span></Link></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
