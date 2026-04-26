'use client';

import { useState, useEffect, useCallback } from 'react';
import ContactForm from './ContactForm';

export default function GetInTouch() {
  const [showForm, setShowForm] = useState(false);

  const openForm = useCallback(() => {
    setShowForm(true);
    document.documentElement.classList.add('no-scroll');
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    document.documentElement.classList.remove('no-scroll');
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showForm) closeForm();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showForm, closeForm]);

  useEffect(() => {
    const handleOpen = () => openForm();
    window.addEventListener('open-contact-modal', handleOpen);
    return () => window.removeEventListener('open-contact-modal', handleOpen);
  }, [openForm]);

  return (
    <>
      <section className="get-in-touch" id="get-in-touch">
        <div className="get-in-touch-inner">
          <div className="touch-content">
            <div className="touch-left">
              <p className="touch-label">Start a conversation</p>
              <h2 className="touch-title">
                Let's create something <em>extraordinary</em> together
              </h2>
              <p className="touch-desc">
                Ready to transform your space? We'd love to hear about your project.
                Share your vision with us and we'll get back to you within 24 hours.
              </p>

              <div className="touch-info">
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <a href="mailto:project@thetetestudio.com">project@thetetestudio.com</a>
                </div>
                <div className="info-item">
                  <span className="info-label">Location</span>
                  <span>Toronto, Ontario</span>
                </div>
              </div>
            </div>

            <div className="touch-right">
              <button className="touch-cta" onClick={openForm}>
                Make a Request
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Overlay */}
      {showForm && (
        <div
          className="contact-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="contact-modal">
            <button className="contact-modal-close" onClick={closeForm} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="contact-modal-header">
              <p className="contact-modal-eyebrow">New Project Request</p>
              <h3 className="contact-modal-title">Tell us about your space</h3>
              <p className="contact-modal-subtitle">
                Fill in the details below and we'll be in touch within 24 hours.
              </p>
            </div>

            <ContactForm />
          </div>
        </div>
      )}
    </>
  );
}
