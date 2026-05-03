'use client';

import { useState } from 'react';
import { API_URL } from '@/app/lib/api';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          siteFor: 'DASHBOARD'
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ padding: '28px' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
        Send a Message
      </h2>
      
      {success && (
        <div style={{ padding: '16px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
          ✅ Your message has been sent successfully. We'll get back to you soon!
        </div>
      )}

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input" 
              placeholder="Your name" 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input" 
              placeholder="you@example.com" 
              required 
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Related Event</label>
          <select 
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Select an event (optional)</option>
            <option value="Kota Half Marathon">Kota Half Marathon</option>
            <option value="Jodhpur Marathon">Jodhpur Marathon</option>
            <option value="Udaipur Run">Udaipur Run</option>
            <option value="Other">Other Inquiry</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Message</label>
          <textarea 
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="form-input" 
            rows={4} 
            placeholder="How can we help?" 
            required 
            style={{ resize: 'vertical' }} 
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            disabled={submitting}
            className="btn btn-primary" 
            style={{ minWidth: 180, opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>
    </div>
  );
}
