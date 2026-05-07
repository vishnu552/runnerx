'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/api';

const SUBJECT_OPTIONS = [
  { value: 'registration', label: 'Registration' },
  { value: 'payment', label: 'Payment Issue' },
  { value: 'event', label: 'Event Information' },
  { value: 'sponsorship', label: 'Sponsorship Inquiry' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'other', label: 'Other' },
];

const SUBJECT_LABEL = Object.fromEntries(SUBJECT_OPTIONS.map(o => [o.value, o.label]));

const initialForm = { name: '', email: '', subject: '', message: '' };

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Please enter your name';
  else if (form.name.trim().length < 2) errors.name = 'Name is too short';

  if (!form.email.trim()) errors.email = 'Please enter your email';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Please enter a valid email';

  if (!form.subject) errors.subject = 'Please select a topic';

  if (!form.message.trim()) errors.message = 'Please enter a message';
  else if (form.message.trim().length < 10) errors.message = 'Message should be at least 10 characters';

  return errors;
}

export default function ContactForm({ title }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const isSubmitting = status.state === 'submitting';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
    if (status.state === 'success' || status.state === 'error') {
      setStatus({ state: 'idle', message: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.warn('[ContactForm] validation failed', validationErrors);
      return;
    }

    setStatus({ state: 'submitting', message: '' });

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: SUBJECT_LABEL[form.subject] || form.subject,
          message: form.message.trim(),
          siteFor: 'KTA',
        }),
      });

      let data = null;
      try { data = await res.json(); } catch { /* non-JSON body */ }

      if (!res.ok || !data?.success) {
        const errMsg = data?.message || `Request failed (${res.status})`;
        console.error('[ContactForm] API error:', { status: res.status, body: data });
        setStatus({ state: 'error', message: errMsg });
        return;
      }

      console.log('[ContactForm] inquiry submitted', data.inquiry?.id);
      setStatus({
        state: 'success',
        message: "Thanks! Your message has been sent. We'll get back to you soon.",
      });
      setForm(initialForm);
    } catch (err) {
      console.error('[ContactForm] network error:', err);
      setStatus({
        state: 'error',
        message: 'Unable to reach the server. Please check your connection and try again.',
      });
    }
  };

  return (
    <>
      <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '24px' }}>
        {title || 'Send us a Message'}
      </h2>

      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            className="form-input"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange}
            disabled={isSubmitting}
            aria-invalid={!!errors.name}
            required
          />
          {errors.name && <small style={{ color: '#dc2626', marginTop: 4, display: 'block' }}>{errors.name}</small>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            disabled={isSubmitting}
            aria-invalid={!!errors.email}
            required
          />
          {errors.email && <small style={{ color: '#dc2626', marginTop: 4, display: 'block' }}>{errors.email}</small>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="contact-subject">Subject</label>
          <select
            id="contact-subject"
            name="subject"
            className="form-input"
            value={form.subject}
            onChange={handleChange}
            disabled={isSubmitting}
            aria-invalid={!!errors.subject}
            required
          >
            <option value="">Select a topic</option>
            {SUBJECT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.subject && <small style={{ color: '#dc2626', marginTop: 4, display: 'block' }}>{errors.subject}</small>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            name="message"
            className="form-textarea"
            placeholder="How can we help you?"
            value={form.message}
            onChange={handleChange}
            disabled={isSubmitting}
            aria-invalid={!!errors.message}
            required
          />
          {errors.message && <small style={{ color: '#dc2626', marginTop: 4, display: 'block' }}>{errors.message}</small>}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ marginTop: '8px', minWidth: 180, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid currentColor', borderTopColor: 'transparent',
                  display: 'inline-block', animation: 'contactFormSpin 0.8s linear infinite',
                }}
              />
              Sending...
            </span>
          ) : 'Send Message'}
        </button>

        {status.state === 'success' && (
          <div
            role="status"
            style={{
              marginTop: 16, padding: '12px 14px', borderRadius: 8,
              background: 'rgba(11,110,79,0.08)', color: '#0b6e4f',
              border: '1px solid rgba(11,110,79,0.25)', fontSize: '0.9rem',
            }}
          >
            {status.message}
          </div>
        )}
        {status.state === 'error' && (
          <div
            role="alert"
            style={{
              marginTop: 16, padding: '12px 14px', borderRadius: 8,
              background: 'rgba(220,38,38,0.06)', color: '#b91c1c',
              border: '1px solid rgba(220,38,38,0.25)', fontSize: '0.9rem',
            }}
          >
            {status.message}
          </div>
        )}
      </form>

      <style jsx>{`
        @keyframes contactFormSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
