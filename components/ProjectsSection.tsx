'use client';

import { Project } from '@/lib/types';
import FadeIn from './FadeIn';

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section className="projects" id="projects">
      <div className="projects-inner">
        <FadeIn>
          <div className="projects-header">
            <h3>Selected Projects</h3>
            <div className="smallcaps">{String(projects.length).padStart(2, '0')} Works</div>
          </div>
        </FadeIn>

        <div className="projects-list">
          {projects.map((project, index) => {
            const img1 = project.images?.[0] || '';
            const img2 = project.images?.[1] || img1;

            return (
              <FadeIn key={project.slug} delay={80 * index} clip>
                <article className="project-row project-h">
                  <div className="project-row-img-wrap">
                    <img
                      src={img1}
                      alt={project.title}
                      className="img-1"
                      data-lightbox={index}
                      data-i={0}
                    />
                    <img
                      src={img2}
                      alt={project.title}
                      className="img-2"
                      data-lightbox={index}
                      data-i={1}
                    />
                  </div>
                  <div className="hover-label">View<br/>Project</div>
                  <div className="project-content">
                    <div className="project-num">{String(index + 1).padStart(2, '0')} — {project.subtitle || 'Project'}</div>
                    <div className="project-bottom">
                      <h2 className="project-title">{project.title}</h2>
                      <div className="project-meta">
                        <div className="smallcaps light">{project.location || 'Toronto'} · {project.year || '2025'}</div>
                        <p>{project.description || ''}</p>
                        <a
                          className="arrow-link"
                          href="#"
                          data-lightbox={index}
                          data-i={0}
                        >
                          <span className="al-line" />View project
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
