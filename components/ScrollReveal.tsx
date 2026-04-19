'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.reveal, .reveal-clip').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
