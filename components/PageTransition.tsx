'use client';

import { useEffect, useState } from 'react';

export default function PageTransition() {
  const [phase, setPhase] = useState<'cover' | 'exit' | 'done'>('cover');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('exit'), 80);
    const t2 = setTimeout(() => setPhase('done'), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div className={`page-transition ${phase === 'exit' ? 'is-exiting' : ''}`}>
      <div className="page-transition-panel page-transition-top" />
      <div className="page-transition-panel page-transition-bottom" />
    </div>
  );
}
