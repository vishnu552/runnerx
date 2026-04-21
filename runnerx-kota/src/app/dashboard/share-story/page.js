'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

export default function ShareStoryPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    socialMediaUrl: '',
    title: '',
    content: '',
  });

  useEffect(() => {
    async function init() {
      try {
        // Get profile
        const profileRes = await fetch('/api/profile');
        const profileData = await profileRes.json();
        if (profileData.success && profileData.profile) {
          setProfile(profileData.profile);
          setFormData(prev => ({
            ...prev,
            name: profileData.profile.name || '',
            email: profileData.profile.email || '',
            phone: profileData.profile.phone || '',
          }));
        }

        // Get stories
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('runnerx-user-token='))
          ?.split('=')[1];

        if (token) {
          const storiesRes = await fetch(`${API_URL}/api/auth/stories`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const storiesData = await storiesRes.json();
          if (storiesData.success) {
            setStories(storiesData.stories || []);
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.content) {
      setError('Please fill your name, email, and story.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('runnerx-user-token='))
        ?.split('=')[1];

      const res = await fetch(`${API_URL}/api/auth/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setShowForm(false);
        setFormData(prev => ({ ...prev, title: '', content: '', socialMediaUrl: '' }));
        // Trigger re-fetch
        setTimeout(() => setSuccess(false), 100);
      } else {
        setError(data.message || 'Failed to submit story');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text)', fontSize: '0.95rem' };
  const labelStyle = { display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Artistic hero */}
      <div className="card" style={{
        padding: '48px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(14,165,233,0.04), rgba(168,85,247,0.04), rgba(236,72,153,0.04))',
        borderTop: '4px solid #0ea5e9',
      }}>
        {/* Decorative pen strokes */}
        <div style={{
          position: 'absolute', top: 20, right: 30, opacity: 0.06, fontSize: '8rem',
          fontFamily: 'serif', fontStyle: 'italic', lineHeight: 1,
          transform: 'rotate(-12deg)', pointerEvents: 'none', userSelect: 'none',
        }}>
          ✍
        </div>
        <div style={{
          position: 'absolute', bottom: 15, left: 25, opacity: 0.05, fontSize: '6rem',
          fontFamily: 'serif', pointerEvents: 'none', userSelect: 'none',
        }}>
          📖
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
          Share Your Story
        </h1>
        <p style={{
          color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 24px',
          fontSize: '1rem', lineHeight: 1.7, position: 'relative', zIndex: 1,
        }}>
          Every runner has a story. Share yours — the motivation, the struggle, the triumph.
          We read every story, and the best ones get featured on our social media and UGC campaigns.
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
          style={{ position: 'relative', zIndex: 1 }}
        >
          {showForm ? 'Cancel' : '✏️ Share Your Story'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#ef4444', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Story form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>Tell Us Your Story</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Social Media URL (optional)</label>
              <input type="url" name="socialMediaUrl" value={formData.socialMediaUrl} onChange={handleChange} style={inputStyle} placeholder="https://instagram.com/..." />
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Story Title (optional)</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} style={inputStyle} placeholder="Give your story a title..." />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Your Story *</label>
            <textarea
              name="content" value={formData.content} onChange={handleChange}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 180 }}
              placeholder="Write as much as you want — your running journey, motivation, marathon experience, first run, anything..."
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ minWidth: 200, opacity: submitting ? 0.6 : 1 }}>
              {submitting ? 'Submitting...' : 'Submit Story'}
            </button>
          </div>
        </form>
      )}

      {/* Previous stories */}
      {stories.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>Your Stories</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stories.map((story) => (
              <details key={story.id} className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <summary style={{
                  padding: '16px 20px', cursor: 'pointer', listStyle: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                      {story.title || 'Untitled Story'}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Submitted {new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px',
                    background: story.status === 'PUBLISHED' ? 'rgba(34,197,94,0.1)' : story.status === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                    color: story.status === 'PUBLISHED' ? '#22c55e' : story.status === 'REJECTED' ? '#ef4444' : '#eab308',
                  }}>
                    {story.status}
                  </span>
                </summary>
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, paddingTop: '16px', whiteSpace: 'pre-wrap' }}>
                    {story.content}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {stories.length === 0 && !showForm && (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            You haven't shared any stories yet. Click "Share Your Story" above to get started!
          </p>
        </div>
      )}
    </div>
  );
}
