'use client';

import { useEffect, useState } from 'react';

export default function PageTransition() {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Initial page load animation complete
    const timer = setTimeout(() => setIsAnimating(false), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`page-transition ${isAnimating ? 'is-animating' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--brown)',
        zIndex: 100001,
        transformOrigin: 'bottom',
        transition: 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)',
      }}
    />
  );
}
