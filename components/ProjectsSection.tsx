'use client';

import { Project } from '@/lib/types';
import FadeIn from './FadeIn';
import Link from 'next/link';

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
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

      <div className="projects-list-full">
        {projects.map((project, index) => {
          const img1 = project.images?.[0];
          const img2 = project.images?.[1] || img1;

          if (!img1) return null;

          return (
            <FadeIn key={project.slug} delay={40 * index}>
              <Link href={`/projects/${project.slug}`} className="project-row-link">
                <article className="project-row project-h">
                  <div className="project-row-img-wrap">
                    <img
                      src={img1}
                      alt={project.title}
                      className="img-1"
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                    />
                    {img2 && img2 !== img1 && (
                      <img
                        src={img2}
                        alt={project.title}
                        className="img-2"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="hover-label">View<br/>Project</div>
                  <div className="project-content">
                    <div className="project-num">{String(index + 1).padStart(2, '0')} — {project.subtitle || 'Project'}</div>
                    <div className="project-bottom">
                      <h2 className="project-title">{project.title}</h2>
                      <div className="project-meta">
                        <div className="smallcaps light">{project.location || ''} {project.location && project.year ? '·' : ''} {project.year || '2025'}</div>
                        <p>{project.description || ''}</p>
                        <span className="arrow-link">
                          <span className="al-line" />View project
                        </span>
                      </div>
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
