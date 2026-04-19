'use client';

import { useState, useEffect, useRef } from 'react';
import { Project } from '@/lib/types';

interface HeroProps {
  projects: Project[];
}

export default function Hero({ projects }: HeroProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showingA, setShowingA] = useState(true);
  const [progress, setProgress] = useState(0);

  const intervalMs = 5200;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  const slides = projects.flatMap((p) =>
    (p.images || []).map((src, i) => ({
      src,
      text: `${p.title} — ${p.subtitle || ''}`.replace(' — ', p.subtitle ? ' — ' : ''),
      alt: `${p.title} photo ${i + 1}`,
    }))
  );

  const totalSlides = slides.length;

  useEffect(() => {
    if (totalSlides === 0) return;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(1, elapsed / intervalMs);
      setProgress(pct * 100);

      if (pct >= 1) {
        setCurrentIdx((prev) => (prev + 1) % totalSlides);
        setShowingA((prev) => !prev);
        startTimeRef.current = Date.now();
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIdx(((index % totalSlides) + totalSlides) % totalSlides);
    setShowingA((prev) => !prev);
    startTimeRef.current = Date.now();
  };

  const prevSlide = () => {
    goToSlide(currentIdx - 1);
  };

  const nextSlide = () => {
    goToSlide(currentIdx + 1);
  };

  const currentSlide = slides[currentIdx];

  if (!totalSlides) return null;

  return (
    <section className="hero" aria-label="Featured images">
      <div className="stage" aria-hidden="true">
        <img
          id="imgA"
          className={`layer ${showingA ? 'isActive' : ''}`}
          src={slides[currentIdx]?.src || ''}
          alt=""
        />
        <img
          id="imgB"
          className={`layer ${!showingA ? 'isActive' : ''}`}
          src={slides[(currentIdx + 1) % totalSlides]?.src || ''}
          alt=""
        />
      </div>

      <div className="heroInner">
        <div className="wrap">
          <p className="kicker">
            <span className="rule"></span>Selected works
          </p>
          <h1>tete</h1>
          <p className="lead">Minimal interior design. Projects below.</p>

          <div className="heroBar">
            <div className="hint">
              <span className="dot" aria-hidden="true"></span>Scroll
            </div>
            <p className="caption" id="heroCaption">
              Image {currentIdx + 1} of {totalSlides}
            </p>
          </div>
        </div>
      </div>

      <div className="heroUI">
        <button className="navBtn" onClick={prevSlide} type="button">
          Prev
        </button>
        <div className="dots" id="dots" aria-label="Carousel navigation">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`dotBtn ${i === currentIdx ? 'isActive' : ''}`}
              type="button"
              onClick={() => goToSlide(i)}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
        <button className="navBtn" onClick={nextSlide} type="button">
          Next
        </button>
      </div>

      <div className="progress progressBottom" aria-hidden="true">
        <div className="progressFill" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}
