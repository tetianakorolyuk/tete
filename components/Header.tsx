'use client';

import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="header">
      <div className="wrap">
        <nav className="nav">
          <a className="brand" href="/">
            <span className="logo">tete</span>
            <span className="tag">interior design</span>
          </a>

          <div className="navRight">
            <div className="navLinks">
              <a href="#projects">Projects</a>
              <a href="#journal">Journal</a>
              <a href="#contact">Contact</a>
            </div>

            <a className="iconLink" href="mailto:tetiana.korolyuk@gmail.com" aria-label="Email">
              <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="1.6"/>
                <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6"/>
              </svg>
              Email
            </a>

            <a href="/edit" className="themeToggle" title="Edit site" aria-label="Edit site">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M12 20h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>

            <ThemeToggle />

            <button
              className="hamburger"
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {mobileOpen ? (
                  <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square"/>
                ) : (
                  <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square"/>
                )}
              </svg>
            </button>
          </div>

          {mobileOpen && (
            <div className="mobilePanel">
              <a href="#projects" onClick={() => setMobileOpen(false)}>Projects</a>
              <a href="#journal" onClick={() => setMobileOpen(false)}>Journal</a>
              <a href="#contact" onClick={() => setMobileOpen(false)}>Contact</a>
              <a href="mailto:tetiana.korolyuk@gmail.com">Email</a>
              <a href="/edit">Edit Site</a>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
