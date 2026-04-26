'use client';

import { useState, useEffect, useRef } from 'react';
import { Project } from '@/lib/types';

interface HeroProps {
  projects: Project[];
}

export default function Hero({ projects }: HeroProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  const intervalMs = 4800;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<number | null>(null);

  const slides = projects.flatMap((p) =>
    (p.images || []).map((src) => ({ src }))
  );

  const totalSlides = slides.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || totalSlides === 0) return;

    // Reset progress
    setProgress(0);

    // Progress bar animation
    const startTime = Date.now();
    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / intervalMs) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        progressRef.current = requestAnimationFrame(animateProgress);
      }
    };
    progressRef.current = requestAnimationFrame(animateProgress);

    // Slide timer
    timerRef.current = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % totalSlides);
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
    };
  }, [mounted, totalSlides, currentIdx]);

  if (!mounted || !totalSlides) return null;

  return (
    <section className="hero" aria-label="Featured images">
      <div className="slides">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`slide ${i === currentIdx ? 'active' : ''} ${i < currentIdx ? 'seen' : ''}`}
          >
            <img
              className="slide-img"
              src={slide.src}
              alt=""
              loading={i < 2 ? "eager" : "lazy"}
              fetchPriority={i < 2 ? "high" : "auto"}
            />
          </div>
        ))}
      </div>

      <div className="slide-counter">
        <div className="slide-counter-num">{String(currentIdx + 1).padStart(2, '0')}</div>
        <div className="slide-counter-track">
          <div
            className="slide-counter-fill"
            style={{ height: `${progress}%` }}
          />
        </div>
        <div className="slide-counter-num">{String(totalSlides).padStart(2, '0')}</div>
      </div>

      <div className="hero-content">
        <div className="hero-inner">
          <div className="hero-top fade-up">
            <div className="hero-eyebrow">INTERIOR DESIGN · TORONTO</div>
          </div>
          <div className="hero-title-wrap">
            <h1 className="hero-title">
              <span className="hero-title-line">
                <span className="hero-title-inner text-reveal-inner">TÉTÉ</span>
              </span>
            </h1>
          </div>
          <div className="hero-bottom">
            <p className="hero-desc fade-up" style={{ transitionDelay: '0.3s' }}>
              A portfolio shaped around strong visual storytelling, minimal copy, and a cinematic presentation that puts the work first.
            </p>
            <div className="hero-cta-group fade-up" style={{ transitionDelay: '0.4s' }}>
              <div className="scroll-hint">
                <div className="scroll-hint-line" />
                Scroll
              </div>
            </div>
            <div className="hero-right fade-up" style={{ transitionDelay: '0.5s' }}>
              <div className="hero-contact-chip">
                <div className="dot" />
                Available for projects
              </div>
              <div className="hero-socials">
                <a href="https://instagram.com" target="_blank" rel="noopener" className="animated-underline">Ig</a>
                <a href="https://thetete.substack.com" target="_blank" rel="noopener" className="animated-underline">Sb</a>
                <a href="https://behance.net" target="_blank" rel="noopener" className="animated-underline">Be</a>
                <a href="https://pinterest.com" target="_blank" rel="noopener" className="animated-underline">Pi</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
