'use client';

import { useState, useEffect, useRef } from 'react';
import { Project } from '@/lib/types';

interface HeroProps {
  projects: Project[];
}

export default function Hero({ projects }: HeroProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  const slides = projects.flatMap((p) =>
    (p.images || []).slice(0, 2).map((src) => ({ src }))
  );

  const totalSlides = slides.length || 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (totalSlides <= 1) return;

    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(timer);
  }, [totalSlides]);

  if (!mounted) return null;

  const currentSlide = slides[currentIdx]?.src || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=80';

  return (
    <section className="hero">
      <div className="hero-bg">
        <img src={currentSlide} alt="Hero background" />
      </div>
      <div className="hero-content">
        <p className="hero-label">Interior Design Studio</p>
        <h1 className="hero-title">TETÉ</h1>
        <p className="hero-subtitle">
          Creating exceptional interior spaces that blend elegance, comfort, and timeless design across Toronto and beyond.
        </p>
        <a href="#projects" className="hero-cta">
          View Projects
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
