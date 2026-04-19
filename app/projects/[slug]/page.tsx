import { getProjects } from '@/lib/content';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

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
      <div className="project-detail-inner">
        {/* Navigation */}
        <div className="project-nav">
          <Link href="/" className="nav-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to all projects
          </Link>
          <div className="nav-project">
            {prevProject && (
              <Link href={`/projects/${prevProject.slug}`} className="nav-prev">
                ← Previous
              </Link>
            )}
            {nextProject && (
              <Link href={`/projects/${nextProject.slug}`} className="nav-next">
                Next →
              </Link>
            )}
          </div>
        </div>

        {/* Hero Images */}
        <div className="project-hero">
          {project.images?.[0] && (
            <div className="hero-image main">
              <img src={project.images[0]} alt={project.title} />
            </div>
          )}
          {project.images?.[1] && (
            <div className="hero-image secondary">
              <img src={project.images[1]} alt={project.title} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="project-content-detail">
          <div className="project-header-detail">
            <div className="project-num">{String(currentIndex + 1).padStart(2, '0')}</div>
            <div className="project-subtitle">{project.subtitle || 'Project'}</div>
            <h1 className="project-title-detail">{project.title}</h1>
            <div className="project-meta-detail">
              <span>{project.location || 'Toronto'}</span>
              <span className="divider">·</span>
              <span>{project.year || '2025'}</span>
            </div>
          </div>

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

          {/* Additional Images */}
          {project.images && project.images.length > 2 && (
            <div className="project-gallery">
              {project.images.slice(2).map((img, i) => (
                <div key={i} className="gallery-image">
                  <img src={img} alt={`${project.title} - image ${i + 3}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="project-footer-nav">
          {prevProject && (
            <Link href={`/projects/${prevProject.slug}`} className="footer-nav-item prev">
              <span className="nav-label">Previous Project</span>
              <span className="nav-title">{prevProject.title}</span>
            </Link>
          )}
          <div className="footer-nav-center">
            <Link href="/" className="nav-all">
              View all projects
            </Link>
          </div>
          {nextProject && (
            <Link href={`/projects/${nextProject.slug}`} className="footer-nav-item next">
              <span className="nav-label">Next Project</span>
              <span className="nav-title">{nextProject.title}</span>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
