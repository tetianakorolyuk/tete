'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <a href="/" className="brand">TETÉ.</a>
        <nav className="nav">
          <a href="#projects">Projects</a>
          <a href="#journal">Journal</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="navRight">
          <a className="iconLink" href="mailto:tetiana.korolyuk@gmail.com" aria-label="Email">
            <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5"/>
              <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Contact
          </a>
          <a href="/edit" className="smallcaps" style={{ color: scrolled ? 'var(--brown-s)' : 'var(--white-m)' }}>
            Edit
          </a>
          <button
            className={`hamburger ${scrolled ? 'scrolled' : ''} ${mobileOpen ? 'active' : ''}`}
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div className={`mobilePanel ${mobileOpen ? 'open' : ''}`}>
        <a href="#projects" onClick={() => setMobileOpen(false)}>Projects</a>
        <a href="#journal" onClick={() => setMobileOpen(false)}>Journal</a>
        <a href="#contact" onClick={() => setMobileOpen(false)}>Contact</a>
        <a href="mailto:tetiana.korolyuk@gmail.com">Email</a>
        <a href="/edit">Edit Site</a>
      </div>
    </>
  );
}
