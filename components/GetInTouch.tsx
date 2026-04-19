'use client';

import { useState } from 'react';
import ContactForm from './ContactForm';

export default function GetInTouch() {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="get-in-touch" id="get-in-touch">
      <div className="get-in-touch-inner">
        <div className="touch-content">
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
              <a href="mailto:tetiana.korolyuk@gmail.com">tetiana.korolyuk@gmail.com</a>
            </div>
            <div className="info-item">
              <span className="info-label">Phone</span>
              <a href="tel:+15555555555">+1 (555) 555-5555</a>
            </div>
            <div className="info-item">
              <span className="info-label">Location</span>
              <span>Toronto, Ontario</span>
            </div>
          </div>

          {!showForm && (
            <button className="touch-cta" onClick={() => setShowForm(true)}>
              Make a Request
            </button>
          )}
        </div>

        {showForm && (
          <div className="touch-form-wrapper">
            <button className="close-form" onClick={() => setShowForm(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <ContactForm />
          </div>
        )}
      </div>
    </section>
  );
}
