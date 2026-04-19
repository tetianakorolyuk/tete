'use client';

import { useState } from 'react';
import ContactForm from './ContactForm';

export default function GetInTouch() {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="get-in-touch" id="contact">
      <div className="get-in-touch-inner">
        <div className="touch-header">
          <p className="touch-label">Get in Touch</p>
          <h2 className="touch-title">Let's create something extraordinary</h2>
          <p className="touch-desc">
            Ready to transform your space? Tell us about your project and we'll get back to you within 24 hours.
          </p>
        </div>

        {!showForm ? (
          <div style={{ textAlign: 'center' }}>
            <button className="submit-btn" onClick={() => setShowForm(true)} style={{ maxWidth: 300 }}>
              Make a Request
            </button>
          </div>
        ) : (
          <div className="contact-form-wrapper">
            <button
              onClick={() => setShowForm(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close form"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
