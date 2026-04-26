'use client';

import { useEffect, useState } from 'react';
import { Project } from '@/lib/types';

interface LightboxProps {
  projects: Project[];
}

export default function Lightbox({ projects }: LightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const img = (e.target as HTMLElement).closest('[data-lightbox]') as HTMLElement;
      if (img) {
        e.preventDefault();
        const pi = Number(img.getAttribute('data-lightbox') || '0');
        const ii = Number(img.getAttribute('data-i') || '0');
        openLightbox(pi, ii);
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [isOpen]);

  const openLightbox = (pi: number, ii: number) => {
    setActiveProjectIndex(pi);
    setActiveImageIndex(ii);
    setIsOpen(true);
    document.documentElement.classList.add('no-scroll');
  };

  const closeLightbox = () => {
    setIsOpen(false);
    document.documentElement.classList.remove('no-scroll');
  };

  const step = (dir: number) => {
    const imgs = projects[activeProjectIndex]?.images || [];
    if (!imgs.length) return;
    const next = (activeImageIndex + dir + imgs.length) % imgs.length;
    setActiveImageIndex(next);
  };

  const currentImages = projects[activeProjectIndex]?.images || [];
  const currentImage = currentImages[activeImageIndex];
  const currentProject = projects[activeProjectIndex];

  return (
    <div
      className={`lightbox ${isOpen ? 'isOpen' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLightbox();
      }}
      aria-hidden={!isOpen}
      role="dialog"
      aria-label="Image viewer"
    >
      {/* Close button — top right */}
      <button className="lb-close" onClick={closeLightbox} type="button" aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Prev arrow — left */}
      {currentImages.length > 1 && (
        <button className="lb-arrow lb-arrow-prev" onClick={() => step(-1)} type="button" aria-label="Previous image">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Next arrow — right */}
      {currentImages.length > 1 && (
        <button className="lb-arrow lb-arrow-next" onClick={() => step(1)} type="button" aria-label="Next image">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Main content */}
      <div className="lightboxInner">
        {currentImage && (
          <img
            className="lbImg"
            src={currentImage}
            alt={`${currentProject?.title || ''} — ${activeImageIndex + 1}`}
            key={`${activeProjectIndex}-${activeImageIndex}`}
          />
        )}

        {/* Caption below image */}
        <div className="lbCaption">
          <span className="lbCaption-title">{currentProject?.title}</span>
          <span className="lbCaption-counter">
            {String(activeImageIndex + 1).padStart(2, '0')} / {String(currentImages.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
}
