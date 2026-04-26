'use client';

import { Project } from '@/lib/types';
import FadeIn from './FadeIn';
import Link from 'next/link';

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const getSize = (index: number, layout?: string) => {
    if (layout === 'full' || layout === 'wide') return 'full';
    if (layout === 'square' || layout === 'tall') return 'half';
    // Default pattern: full, half, half...
    if (index % 3 === 0) return 'full';
    return 'half';
  };

  return (
    <section className="projects" id="projects">
      <div className="projects-inner">
        <FadeIn>
          <div className="projects-header">
            <div className="projects-header-left">
              <span className="projects-header-num">02</span>
              <div className="projects-header-title-group">
                <span className="projects-header-eyebrow">Portfolio</span>
                <h3>Selected Projects</h3>
              </div>
            </div>
            <div className="projects-header-right">
              <span className="projects-header-count">{String(projects.length).padStart(2, '0')}</span>
              <span className="projects-header-count-label">Works</span>
            </div>
          </div>
        </FadeIn>
      </div>

      <div className="projects-grid">
        {projects.map((project, index) => {
          const img = project.images?.[0];
          if (!img) return null;

          const size = getSize(index, project.layout);
          const layoutClass = project.layout || 'default';

          return (
            <FadeIn key={project.slug} delay={60 * (index % 3)}>
              <Link
                href={`/projects/${project.slug}`}
                className={`project-card-link ${size}`}
              >
                <article className={`project-card ${size} ${layoutClass}`}>
                  <div className="project-card-img-wrap">
                    <img
                      src={img}
                      alt={project.title}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                    />
                  </div>
                  <div className="project-card-overlay">
                    <div className="project-card-info">
                      <span className="project-card-name">{project.title}</span>
                      <span className="project-card-meta">
                        {project.location || ''}
                        {project.location && project.year ? ' — ' : ''}
                        {project.year || ''}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
