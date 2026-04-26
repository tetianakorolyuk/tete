'use client';

import { useState, useEffect } from 'react';
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

export default function StudioSection() {
  const [visible, setVisible] = useState(false);
  const [studioImage, setStudioImage] = useState('/images/studio-hero.jpg');
  const [content, setContent] = useState<StudioContent>(defaultContent);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <section className="studio" id="studio">
      {/* Hero Split Section */}
      <div className="studio-hero">
        <div className="studio-hero-content">
          <p className="studio-eyebrow">About the Studio</p>
          <h2
            className="studio-headline"
            dangerouslySetInnerHTML={{ __html: content.headline }}
          />
          <p className="studio-description">{content.description}</p>

          <div className="studio-stats">
            {content.stats.map((stat, i) => (
              <div key={i} className="studio-stat">
                <div className="studio-stat-num">{stat.number}</div>
                <div className="studio-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="studio-hero-image">
          <img
            src={studioImage}
            alt="Tatiana Koroliuk - Interior Design Toronto"
            loading="eager"
          />
          <div className="studio-hero-overlay">
            <p className="studio-hero-meta">Est. 2020 · Toronto</p>
            <h3 className="studio-hero-name">Tatiana Koroliuk</h3>
          </div>
        </div>
      </div>

      {/* Principles Grid */}
      <div className="studio-principles">
        {content.principles.map((principle, i) => (
          <div
            key={i}
            className="studio-principle"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(24px)',
              transition: `opacity 0.8s ease ${0.3 + i * 0.15}s, transform 0.8s ease ${0.3 + i * 0.15}s`,
            }}
          >
            <span className="principle-num">{principle.num}</span>
            <h3 className="principle-title">{principle.title}</h3>
            <p className="principle-description">{principle.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
