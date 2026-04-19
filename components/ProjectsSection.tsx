'use client';

import { useState } from 'react';
import { Project } from '@/lib/types';
import FadeIn from './FadeIn';

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const toggleExpand = (slug: string) => {
    setOpenSlug((prev) => {
      const willOpen = prev !== slug;
      setTimeout(() => {
        if (willOpen) {
          document.getElementById(`expand-${slug}`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
      return prev === slug ? null : slug;
    });
  };

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
            const expandId = `expand-${project.slug}`;
            const isOpen = openSlug === project.slug;

            return (
              <FadeIn key={project.slug} delay={80 * index} clip>
                <article className={`project-row project-h ${isOpen ? 'is-open' : ''}`}>
                  <div className="project-row-img-wrap">
                    <img
                      src={img1}
                      alt={`${project.title} image 1`}
                      className="img-1"
                      data-lightbox={index}
                      data-i={0}
                    />
                    <img
                      src={img2}
                      alt={`${project.title} image 2`}
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
                        <button className="arrow-link" onClick={() => toggleExpand(project.slug)}>
                          <span className="al-line" />{isOpen ? 'Close' : 'View project'}
                        </button>
                      </div>
                    </div>
                  </div>
                  {isOpen && (
                    <div id={expandId} className="projectExpand">
                      <div className="projectExpandInner">
                        <div className="gallery">
                          {(project.images || []).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`${project.title} ${i + 1}`}
                              data-lightbox={index}
                              data-i={i}
                              style={{ cursor: 'pointer' }}
                            />
                          ))}
                        </div>
                        <div className="facts">
                          <div className="factRow">
                            <strong>Location</strong>
                            <span>{project.location || 'Toronto, ON'}</span>
                          </div>
                          <div className="factRow">
                            <strong>Year</strong>
                            <span>{project.year || '2025'}</span>
                          </div>
                          <div className="factRow">
                            <strong>Type</strong>
                            <span>{project.category || 'Residential'}</span>
                          </div>
                          {project.description && (
                            <div className="factRow">
                              <strong>Description</strong>
                              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{project.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
