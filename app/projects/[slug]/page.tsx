import { getProjects } from '@/lib/content';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProjectDetailNav from '@/components/ProjectDetailNav';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const currentIndex = projects.findIndex((p) => p.slug === slug);
  const prevProject = projects[currentIndex - 1];
  const nextProject = projects[currentIndex + 1];

  return (
    <main className="project-detail">
      {/* Fixed minimal nav with scroll fade */}
      <ProjectDetailNav currentIndex={currentIndex} totalProjects={projects.length} />

      {/* Cinematic full-bleed hero */}
      <div className="project-hero-full">
        {project.images?.[0] && (
          <img
            src={project.images[0]}
            alt={project.title}
            className="project-hero-img"
          />
        )}
        <div className="project-hero-overlay" />
        <div className="project-hero-content">
          <div className="project-hero-eyebrow">
            {project.subtitle || 'Project'} — {project.location || 'Toronto'}
          </div>
          <h1 className="project-hero-title">{project.title}</h1>
          <div className="project-hero-meta">
            <span>{project.year || '2025'}</span>
            <span className="meta-dot" />
            <span>{project.location || 'Toronto'}</span>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="project-detail-body">
        <div className="project-detail-body-inner">
          {/* Description */}
          <div className="project-description-detail">
            <p>{project.description}</p>
          </div>

          {/* Facts */}
          {project.facts && project.facts.length > 0 && (
            <div className="project-facts-detail">
              {project.facts.map((fact, i) => (
                <div key={i} className="fact-row">
                  <span className="fact-label">{fact.label}</span>
                  <span className="fact-value">{fact.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gallery */}
        {project.images && project.images.length > 1 && (
          <div className="project-gallery">
            {project.images.slice(1).map((img, i) => (
              <div key={i} className="gallery-image">
                <img src={img} alt={`${project.title} — ${i + 2}`} loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="project-footer-nav">
        {prevProject && (
          <Link href={`/projects/${prevProject.slug}`} className="footer-nav-item prev">
            <span className="nav-label">Previous</span>
            <span className="nav-title">{prevProject.title}</span>
          </Link>
        )}
        <Link href="/#projects" className="nav-all">
          All Projects
        </Link>
        {nextProject && (
          <Link href={`/projects/${nextProject.slug}`} className="footer-nav-item next">
            <span className="nav-label">Next</span>
            <span className="nav-title">{nextProject.title}</span>
          </Link>
        )}
      </div>
    </main>
  );
}
