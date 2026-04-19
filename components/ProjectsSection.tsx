'use client';

import { useState } from 'react';
import { Project } from '@/lib/types';

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const toggleExpand = (slug: string) => {
    setOpenSlug((prev) => (prev === slug ? null : slug));
  };

  return (
    <section className="section" id="projects">
      <div className="wrap">
        <p className="subkicker">
          <span className="rule"></span>Projects
        </p>
        <div className="sectionTitleLine">
          <h2>Selected Works</h2>
          <div className="meta metaRow">Click a project to expand or open</div>
        </div>

        {projects.map((project, index) => {
          const img1 = project.images?.[0] || '';
          const img2 = project.images?.[1] || img1;
          const expandId = `expand-${project.slug}`;

          return (
            <article key={project.slug} className="projectBlock" data-slug={project.slug}>
              <div className="sectionTitleLine">
                <h2>{project.title}</h2>
                <div className="meta">{project.subtitle || ''}</div>
              </div>

              <div className="projectMedia" tabIndex={0}>
                <div className="grid2">
                  <img
                    className="projectImg"
                    data-lightbox={index}
                    data-i="0"
                    src={img1}
                    alt={`${project.title} image 1`}
                  />
                  <img
                    className="projectImg"
                    data-lightbox={index}
                    data-i="1"
                    src={img2}
                    alt={`${project.title} image 2`}
                  />
                </div>

                <div className="projectOverlay">
                  <div className="projectOverlayCard">
                    <div>
                      <p className="projectOverlayTitle">
                        <span className="pin" aria-hidden="true"></span>
                        {project.title} — {project.subtitle || ''}
                      </p>
                      <p className="projectOverlayText">{project.description || ''}</p>
                    </div>
                    <div className="overlayActions">
                      <button
                        className="overlayBtn"
                        type="button"
                        onClick={() => toggleExpand(project.slug)}
                        aria-expanded={openSlug === project.slug}
                        aria-controls={expandId}
                      >
                        More
                        <span className="ico" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path
                              d="M9 6.5 15 12l-6 5.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="square"
                            />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`projectExpand ${openSlug === project.slug ? 'isOpen' : ''}`}
                id={expandId}
              >
                <div className="projectExpandInner">
                  <p className="projectDesc">{project.description || ''}</p>
                  <div className="facts">
                    {project.facts && project.facts.length > 0 ? (
                      project.facts.map((fact, i) => (
                        <div key={i} className="factRow">
                          <b>{fact.label}</b>
                          <span>{fact.value}</span>
                        </div>
                      ))
                    ) : (
                      <div className="factRow">
                        <b>Info</b>
                        <span>—</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
