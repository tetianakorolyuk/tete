'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeout, setFadeout] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Minimum loading time for smooth experience
    const timer = setTimeout(() => {
      setFadeout(true);
      setTimeout(() => setVisible(false), 600);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg)] transition-opacity duration-600 ${fadeout ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center">
        <div className="loader-wrapper">
          <div className="loader-logo">tete</div>
          <div className="loader-line" />
        </div>
        <p className="mt-4 text-sm uppercase tracking-wider text-[var(--muted)] animate-pulse">
          Loading
        </p>
      </div>
    </div>
  );
}
