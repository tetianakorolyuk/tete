'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);

    const observerOptions = {
      root: null,
      rootMargin: '-5% 0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          entry.target.classList.add('in');
          // Don't unobserve - allow re-animation on scroll up
        }
      });
    }, observerOptions);

    // Observe all animated elements
    const selectors = [
      '.reveal',
      '.reveal-clip',
      '.fade-up',
      '.scale-in',
      '.slide-in-left',
      '.slide-in-right',
      '.blur-reveal',
      '.image-reveal',
    ];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => observer.observe(el));
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
