'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <a href="/" className="header-brand">TETÉ.</a>
        <nav className="header-nav">
          <a href="#projects">Projects</a>
          <a href="#about">About</a>
          <a href="#journal">Journal</a>
          <a href="#contact">Contact</a>
        </nav>
        <a href="#contact" className="header-cta">Start a Project</a>
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {mobileOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg-dark)',
          zIndex: 999,
          padding: '100px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>
          <a href="#projects" onClick={() => setMobileOpen(false)} style={{ fontSize: '24px', color: '#fff' }}>Projects</a>
          <a href="#about" onClick={() => setMobileOpen(false)} style={{ fontSize: '24px', color: '#fff' }}>About</a>
          <a href="#journal" onClick={() => setMobileOpen(false)} style={{ fontSize: '24px', color: '#fff' }}>Journal</a>
          <a href="#contact" onClick={() => setMobileOpen(false)} style={{ fontSize: '24px', color: '#fff' }}>Contact</a>
        </div>
      )}
    </>
  );
}
