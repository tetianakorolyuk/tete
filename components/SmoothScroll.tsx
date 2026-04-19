'use client';

import { useEffect, useRef } from 'react';

export default function SmoothScroll() {
  const rafRef = useRef<number | null>(null);
  const currentY = useRef(0);
  const targetY = useRef(0);

  useEffect(() => {
    const ease = 0.08;

    const animate = () => {
      const diff = targetY.current - currentY.current;
      
      if (Math.abs(diff) < 0.1) {
        currentY.current = targetY.current;
      } else {
        currentY.current += diff * ease;
        window.scrollTo(0, currentY.current);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    const handleScroll = () => {
      targetY.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null;
}
