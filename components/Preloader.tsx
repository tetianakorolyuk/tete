'use client';

import { useEffect, useState } from 'react';

export default function Preloader() {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit' | 'done'>('enter');

  useEffect(() => {
    // Phase 1: brand enters (0-1200ms)
    const t1 = setTimeout(() => setPhase('hold'), 1200);
    // Phase 2: hold briefly then exit (1200-1800ms)
    const t2 = setTimeout(() => setPhase('exit'), 1800);
    // Phase 3: remove from DOM
    const t3 = setTimeout(() => setPhase('done'), 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div className={`preloader ${phase}`} aria-hidden="true">
      {/* Split panels */}
      <div className="preloader-panel preloader-panel-left" />
      <div className="preloader-panel preloader-panel-right" />

      {/* Centered brand */}
      <div className="preloader-brand">
        <span className="preloader-brand-small">the</span>
        <span className="preloader-brand-large">TETE</span>
      </div>

      {/* Subtle line */}
      <div className="preloader-line">
        <div className="preloader-line-inner" />
      </div>
    </div>
  );
}
