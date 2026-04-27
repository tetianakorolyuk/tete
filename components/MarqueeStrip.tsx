'use client';

export default function MarqueeStrip() {
  const items = [
    'Interior Design',
    'Residential Spaces',
    'Private Clients',
    'Cinematic Atmosphere',
    'Editorial Precision',
  ];

  return (
    <div className="marquee-strip" aria-hidden="true">
      <div className="marquee-track">
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={i} className="marquee-item">{item}</span>
        ))}
      </div>
    </div>
  );
}
