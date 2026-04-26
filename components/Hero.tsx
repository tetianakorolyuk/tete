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

    setProgress(0);

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

      <div className="hero-scroll">
        <span className="hero-scroll-text">Scroll</span>
        <span className="hero-scroll-line" />
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
    </section>
  );
}
