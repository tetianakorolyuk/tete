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

  const scrollToContact = () => {
    const contactSection = document.querySelector('#get-in-touch');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <a href="/" className="brand">
          <span className="brand-small">the</span>
          <span className="brand-large">TETE</span>
        </a>
        <nav className="nav">
          <a href="#projects">Projects</a>
          <a href="#studio">Studio</a>
          <a href="#journal">Journal</a>
          <a href="#get-in-touch">Contact</a>
        </nav>
        <div className="navRight">
          <button className="nav-cta" onClick={scrollToContact}>Make a Request</button>
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
        <a href="#studio" onClick={() => setMobileOpen(false)}>Studio</a>
        <a href="#journal" onClick={() => setMobileOpen(false)}>Journal</a>
        <a href="#get-in-touch" onClick={() => setMobileOpen(false)}>Contact</a>
      </div>
    </>
  );
}
