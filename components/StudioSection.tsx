'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { StudioContent } from '@/lib/types';

const defaultContent: StudioContent = {
  headline: 'Spaces that feel <em>intimate</em>, editorial, precise.',
  description:
    'This direction keeps the website highly visual and intentionally restrained. The goal is to let the work feel premium and immersive, while still giving clients an easy path to conversation.',
  stats: [
    { number: '12', label: 'Completed Projects' },
    { number: '4', label: 'Featured Works' },
    { number: '24/7', label: 'Online Presentation' },
    { number: 'Tête-à-tête', label: 'Studio Philosophy' },
  ],
  principles: [
    {
      num: '01',
      title: 'Architecture as atmosphere',
      description:
        'Every space should feel like a considered emotional experience — not just a functional arrangement of walls and furniture.',
    },
    {
      num: '02',
      title: 'Material tells the story',
      description:
        'Texture, weight, and warmth are the language of intimacy. The right material choice is felt before it is seen.',
    },
    {
      num: '03',
      title: 'Restraint as a luxury',
      description:
        'True refinement is knowing what to leave out. Silence in a room — visual and physical — is always the rarest thing.',
    },
  ],
};

function useCountUp(target: string, duration = 1200) {
  const [display, setDisplay] = useState('0');
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const numericMatch = target.match(/^(\d+)/);
    if (!numericMatch) {
      setDisplay(target);
      return;
    }

    const end = parseInt(numericMatch[1], 10);
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * end);
      setDisplay(String(current));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [target, duration]);

  return { display, animate };
}

function StatCounter({ stat }: { stat: { number: string; label: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  const { display, animate } = useCountUp(stat.number);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <div ref={ref} className="studio-stat">
      <div className="studio-stat-num">{display}</div>
      <div className="studio-stat-label">{stat.label}</div>
    </div>
  );
}

function FadeUpOnScroll({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms, transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function StudioSection() {
  const [studioImage, setStudioImage] = useState('/images/studio-hero.jpg');
  const [content, setContent] = useState<StudioContent>(defaultContent);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then(({ settings, studioContent }) => {
        if (settings?.studioImage) {
          setStudioImage(settings.studioImage);
        }
        if (studioContent) {
          setContent(studioContent);
        }
      })
      .catch((err) => console.warn('Failed to load studio settings:', err));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!imageRef.current) return;
      const rect = imageRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.top < windowHeight && rect.bottom > 0) {
        const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
        const translateY = progress * 20 - 10;
        const scale = 1 + progress * 0.04;
        const img = imageRef.current.querySelector('img');
        if (img) {
          img.style.transform = `translateY(${translateY}px) scale(${scale})`;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="studio" id="studio">
      {/* Editorial Header */}
      <div className="studio-inner">
        <FadeUpOnScroll>
          <div className="studio-header">
            <h2 className="studio-header-title">About the Studio</h2>
          </div>
        </FadeUpOnScroll>
      </div>

      {/* Compact Split */}
      <div className="studio-hero">
        <div className="studio-hero-content">
          <FadeUpOnScroll>
            <h2
              className="studio-headline"
              dangerouslySetInnerHTML={{ __html: content.headline }}
            />
          </FadeUpOnScroll>
          <FadeUpOnScroll delay={100}>
            <p className="studio-description">{content.description}</p>
          </FadeUpOnScroll>

          <FadeUpOnScroll delay={180}>
            <div className="studio-stats">
              {content.stats.map((stat, i) => (
                <StatCounter key={i} stat={stat} />
              ))}
            </div>
          </FadeUpOnScroll>
        </div>

        <div className="studio-hero-image" ref={imageRef}>
          <img
            src={studioImage}
            alt="Tetyana Koroliuk - Interior Design"
            loading="eager"
          />
          <div className="studio-hero-overlay">
            <div className="studio-hero-overlay-inner">
              <h3 className="studio-hero-name">The Studio</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Principles */}
      <div className="studio-principles">
        {content.principles.map((principle, i) => (
          <FadeUpOnScroll key={i} delay={i * 120}>
            <div className="studio-principle">
              <span className="principle-num">{principle.num}</span>
              <div className="principle-content">
                <h3 className="principle-title">{principle.title}</h3>
                <p className="principle-description">{principle.description}</p>
              </div>
            </div>
          </FadeUpOnScroll>
        ))}
      </div>
    </section>
  );
}
