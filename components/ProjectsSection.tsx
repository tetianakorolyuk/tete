'use client';

import { Project } from '@/lib/types';
import FadeIn from './FadeIn';
import Link from 'next/link';

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const getSize = (layout?: string) => {
    // Per-project explicit layout
    if (layout === 'single' || layout === 'full' || layout === 'wide') return 'full';
    if (layout === 'dual' || layout === 'square' || layout === 'tall') return 'half';
    // Default: auto pattern
    return 'auto';
  };

  const getLayoutClass = (layout?: string) => {
    if (layout === 'single') return 'single';
    if (layout === 'dual') return 'dual';
    if (layout === 'full') return 'full';
    if (layout === 'wide') return 'wide';
    if (layout === 'square') return 'square';
    if (layout === 'tall') return 'tall';
    return 'default';
  };

  return (
    <section className="projects" id="projects">
      <div className="projects-inner">
        <FadeIn>
          <div className="projects-header">
            <h3>Selected Projects</h3>
          </div>
        </FadeIn>
      </div>

      <div className="projects-grid">
        {projects.map((project, index) => {
          const img = project.images?.[0];
          if (!img) return null;

          const size = getSize(project.layout);
          const layoutClass = getLayoutClass(project.layout);
          // When layout is not set, use auto pattern
          const finalSize = size === 'auto'
            ? (index % 3 === 0 ? 'full' : 'half')
            : size;

          return (
            <FadeIn key={project.slug} delay={60 * (index % 3)} className={`project-card-link ${finalSize}`}>
              <Link
                href={`/projects/${project.slug}`}
                className="project-card-link"
              >
                <article className={`project-card ${finalSize} ${layoutClass}`}>
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
