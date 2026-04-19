'use client';

import { useState, useEffect, useRef } from 'react';
import { Project } from '@/lib/types';

interface HeroProps {
  projects: Project[];
}

export default function Hero({ projects }: HeroProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  const intervalMs = 4800;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const slides = projects.flatMap((p) =>
    (p.images || []).map((src) => ({ src }))
  );

  const totalSlides = slides.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (totalSlides === 0) return;

    timerRef.current = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % totalSlides);
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSlides]);

  if (!mounted || !totalSlides) return null;

  return (
    <section className="hero" aria-label="Featured images">
      <div className="slides">
        {slides.map((slide, i) => (
          <div key={i} className={`slide ${i === currentIdx ? 'active' : ''}`}>
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
            style={{ height: `${((currentIdx + 1) / totalSlides) * 100}%` }}
          />
        </div>
        <div className="slide-counter-num">{String(totalSlides).padStart(2, '0')}</div>
      </div>

      <div className="hero-content">
        <div className="hero-top">
          <div className="hero-eyebrow">Interior Design · Toronto</div>
        </div>
        <div>
          <h1 className="hero-title">
            <span className="hero-title-line">
              <span className="hero-title-inner">The Teté</span>
            </span>
            <span className="hero-title-line">
              <span className="hero-title-inner" style={{ animationDelay: '0.18s', fontStyle: 'italic', color: 'rgba(240,234,226,.72)' }}>
                Portfolio
              </span>
            </span>
          </h1>
        </div>
        <div className="hero-bottom">
          <p className="hero-desc">
            A portfolio shaped around strong visual storytelling, minimal copy, and a cinematic presentation that puts the work first.
          </p>
          <div className="hero-cta-group">
            <div className="scroll-hint">
              <div className="scroll-hint-line" />
              Scroll
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-contact-chip">
              <div className="dot" />
              Available for projects
            </div>
            <div className="hero-socials">
              <a href="#">Ig</a>
              <a href="#">Sb</a>
              <a href="#">Be</a>
              <a href="#">Pi</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
