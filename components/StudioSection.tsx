'use client';

import { useState, useEffect } from 'react';

export default function StudioSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { number: '12', label: 'Completed Projects' },
    { number: '4', label: 'Featured Works' },
    { number: '24/7', label: 'Online Presentation' },
    { number: 'Tête-à-tête', label: 'Studio Philosophy' },
  ];

  const principles = [
    {
      num: '01',
      title: 'Architecture as atmosphere',
      description: 'Every space should feel like a considered emotional experience — not just a functional arrangement of walls and furniture.',
    },
    {
      num: '02',
      title: 'Material tells the story',
      description: 'Texture, weight, and warmth are the language of intimacy. The right material choice is felt before it is seen.',
    },
    {
      num: '03',
      title: 'Restraint as a luxury',
      description: 'True refinement is knowing what to leave out. Silence in a room — visual and physical — is always the rarest thing.',
    },
  ];

  return (
    <section className="studio" id="studio">
      {/* Hero Split Section */}
      <div className="studio-hero">
        <div className="studio-hero-content">
          <p className="studio-eyebrow">About the Studio</p>
          <h2 className="studio-headline">
            Spaces that feel <em>intimate</em>, editorial, precise.
          </h2>
          <p className="studio-description">
            This direction keeps the website highly visual and intentionally restrained. The goal is to let the work feel premium and immersive, while still giving clients an easy path to conversation.
          </p>

          <div className="studio-stats">
            {stats.map((stat, i) => (
              <div key={i} className="studio-stat">
                <div className="studio-stat-num">{stat.number}</div>
                <div className="studio-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="studio-hero-image">
          <img
            src="/images/studio-hero.jpg"
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
        {principles.map((principle, i) => (
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
