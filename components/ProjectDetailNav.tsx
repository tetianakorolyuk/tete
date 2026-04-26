'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ProjectDetailNavProps {
  currentIndex: number;
  totalProjects: number;
}

export default function ProjectDetailNav({ currentIndex, totalProjects }: ProjectDetailNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show nav background after scrolling past 60% of viewport height
      setScrolled(window.scrollY > window.innerHeight * 0.6);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`project-detail-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="project-detail-nav-inner">
        <Link href="/" className="nav-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Index</span>
        </Link>
        <span className="nav-project-num">
          {String(currentIndex + 1).padStart(2, '0')} / {String(totalProjects).padStart(2, '0')}
        </span>
      </div>
    </nav>
  );
}
