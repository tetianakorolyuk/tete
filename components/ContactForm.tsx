'use client';

import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  propertyType: string;
  area: string;
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    propertyType: '',
    area: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          city: '',
          propertyType: '',
          area: '',
          message: '',
        });
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Failed to send. Please try again.');
    }

    setSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (submitted) {
    return (
      <div className="contact-form-success">
        <div className="success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3>Thank you!</h3>
        <p>Your request has been sent. We'll get back to you within 24 hours.</p>
        <button onClick={() => setSubmitted(false)} className="new-request-btn">
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Your Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="john@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Toronto"
          />
        </div>

        <div className="form-group">
          <label htmlFor="propertyType">Property Type *</label>
          <select
            id="propertyType"
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            required
          >
            <option value="">Select type</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="commerce">Commerce</option>
            <option value="architecture">Architecture</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="area">Project Area</label>
          <select
            id="area"
            name="area"
            value={formData.area}
            onChange={handleChange}
          >
            <option value="">Select size</option>
            <option value="up-to-50">Up to 50 m²</option>
            <option value="50-100">50 - 100 m²</option>
            <option value="100-200">100 - 200 m²</option>
            <option value="200-500">200 - 500 m²</option>
            <option value="500-1000">500 - 1000 m²</option>
            <option value="1000+">1000+ m²</option>
          </select>
        </div>
      </div>

      <div className="form-group full-width">
        <label htmlFor="message">Tell us about your project *</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          placeholder="Describe your project, timeline, budget, and any specific requirements..."
        />
      </div>

      {error && <div className="form-error">{error}</div>}

      <button type="submit" className="submit-btn" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send Request'}
      </button>
    </form>
  );
}
