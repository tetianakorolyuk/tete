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
      <div className="lightboxInner">
        <div className="lbTop">
          <div className="lbCaption" id="lbCaption">
            {currentProject?.title} — {activeImageIndex + 1} / {currentImages.length}
          </div>
          <div className="lbBtns">
            <button className="lbBtn" onClick={() => step(-1)} type="button">
              Prev
            </button>
            <button className="lbBtn" onClick={() => step(1)} type="button">
              Next
            </button>
            <button className="lbBtn" onClick={closeLightbox} type="button">
              Close
            </button>
          </div>
        </div>
        {currentImage && <img className="lbImg" src={currentImage} alt="" />}
      </div>
    </div>
  );
}
