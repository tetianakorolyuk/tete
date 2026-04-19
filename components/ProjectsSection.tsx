'use client';

import { Project } from '@/lib/types';
import FadeIn from './FadeIn';

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section className="projects" id="projects">
      <div className="projects-header">
        <div>
          <p className="projects-label">Selected Works</p>
          <h2 style={{ fontSize: '32px', fontWeight: 400, margin: 0 }}>Our Projects</h2>
        </div>
        <div className="projects-count">{projects.length} Projects</div>
      </div>

      <div className="projects-grid">
        {projects.map((project, i) => (
          <FadeIn key={project.slug} delay={i * 100}>
            <article className="project-card">
              <img
                src={project.images?.[0] || ''}
                alt={project.title}
                className="project-image"
              />
              <div className="project-info">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-category">{project.category || 'Residential'} · {project.year || '2025'}</p>
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
