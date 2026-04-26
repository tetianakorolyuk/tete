'use client';

import { useEffect, useState } from 'react';

export default function PageTransition() {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`page-transition ${isAnimating ? 'is-animating' : ''}`}>
      <div className="page-transition-panel page-transition-top" />
      <div className="page-transition-panel page-transition-bottom" />
    </div>
  );
}
