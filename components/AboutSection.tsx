'use client';

import FadeIn from './FadeIn';

export default function AboutSection() {
  return (
    <section className="about" id="about">
      <div className="about-grid">
        <FadeIn>
          <div>
            <p className="about-label">About Studio</p>
            <h2 className="about-title">
              Design that transforms spaces and inspires living
            </h2>
            <p className="about-text">
              TETÉ is an interior design studio specializing in creating
              exceptional residential and commercial spaces. With over 15 years of experience,
              we bring a refined aesthetic and meticulous attention to detail to every project.
            </p>
            <p className="about-text">
              Our approach combines modern sophistication with timeless elegance,
              creating interiors that are both beautiful and functional. We believe
              that great design should enhance how you live and work.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="about-stats">
            <div>
              <div className="stat-number">15+</div>
              <div className="stat-label">Years Experience</div>
            </div>
            <div>
              <div className="stat-number">200+</div>
              <div className="stat-label">Projects Completed</div>
            </div>
            <div>
              <div className="stat-number">100%</div>
              <div className="stat-label">Client Satisfaction</div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
