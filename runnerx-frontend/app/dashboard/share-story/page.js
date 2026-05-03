'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { API_URL, authenticatedFetch } from '@/app/lib/api';

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
    imageUrls: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // Get profile
        const profileRes = await authenticatedFetch('/api/auth/profile');
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
        const storiesRes = await authenticatedFetch('/api/auth/stories');
        const storiesData = await storiesRes.json();
        if (storiesData.success) {
          setStories(storiesData.stories || []);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const res = await authenticatedFetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file, // Send raw file
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, imageUrls: data.url }));
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (story) => {
    setFormData({
      name: story.name,
      email: story.email,
      phone: story.phone || '',
      socialMediaUrl: story.socialMediaUrl || '',
      title: story.title || '',
      content: story.content,
      imageUrls: story.imageUrls || null,
    });
    setEditingId(story.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    
    try {
      const res = await authenticatedFetch(`/api/auth/stories?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setStories(prev => prev.filter(s => s.id !== id));
      } else {
        alert(data.message || 'Failed to delete story');
      }
    } catch (err) {
      alert('Error deleting story');
    }
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
      const method = editingId ? 'PUT' : 'POST';
      const payload = editingId ? { ...formData, id: editingId } : formData;

      const res = await authenticatedFetch('/api/auth/stories', {
        method,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setShowForm(false);
        setEditingId(null);
        setFormData(prev => ({ ...prev, title: '', content: '', socialMediaUrl: '', imageUrls: null }));
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
      {/* Artistic hero - Only show if no stories yet */}
      {stories.length === 0 && (
        <div className="card" style={{
          padding: '48px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(14,165,233,0.04), rgba(168,85,247,0.04), rgba(236,72,153,0.04))',
          borderTop: '4px solid #0ea5e9',
        }}>
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
            We read every story, and the best ones get featured on our social media.
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
            style={{ position: 'relative', zIndex: 1 }}
          >
            {showForm ? 'Cancel' : '✏️ Share Your Story'}
          </button>
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#ef4444', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Story form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '28px', border: editingId ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
            {editingId ? 'Edit Your Story' : 'Tell Us Your Story'}
          </h2>
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
            <label style={labelStyle}>Featured Image (optional)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '8px', border: '2px dashed var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                background: 'var(--surface-alt)'
              }}>
                {formData.imageUrls ? (
                  <img src={formData.imageUrls.startsWith('http') ? formData.imageUrls : `${API_URL}${formData.imageUrls}`} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>🖼️</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  id="story-image" 
                  style={{ display: 'none' }} 
                />
                <label 
                  htmlFor="story-image" 
                  style={{
                    display: 'inline-block', padding: '10px 18px', borderRadius: '8px',
                    background: 'var(--surface-alt)', border: '1px solid var(--border)',
                    fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {uploading ? 'Uploading...' : formData.imageUrls ? 'Change Image' : 'Upload Image'}
                </label>
                {formData.imageUrls && (
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, imageUrls: null }))}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', marginLeft: '12px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Remove
                  </button>
                )}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  A great photo makes your story more engaging. Max 5MB.
                </p>
              </div>
            </div>
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
                {submitting ? 'Submitting...' : editingId ? 'Update Story' : 'Submit Story'}
              </button>
          </div>
        </form>
      )}

      {/* Previous stories */}
      {stories.length > 0 && (
        <div style={{ marginTop: showForm ? '32px' : '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', textTransform: 'uppercase', fontStyle: 'italic', margin: 0 }}>
              Your Stories
            </h2>
            <button
              onClick={() => {
                if (showForm) {
                  setEditingId(null);
                  setFormData(prev => ({ ...prev, title: '', content: '', socialMediaUrl: '', imageUrls: null }));
                }
                setShowForm(!showForm);
              }}
              className={showForm ? "btn btn-outline" : "btn btn-primary"}
              style={{ fontSize: '0.9rem', padding: '10px 20px' }}
            >
              {showForm ? 'Cancel' : '✏️ Share New Story'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stories.map((story) => (
              <details key={story.id} className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <summary style={{
                  padding: '16px 20px', cursor: 'pointer', listStyle: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                      {story.title || 'Untitled Story'}
                    </h3>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px',
                      textTransform: 'uppercase', letterSpacing: '0.02em',
                      background: story.status === 'PUBLISHED' ? 'rgba(34,197,94,0.1)' : story.status === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                      color: story.status === 'PUBLISHED' ? '#22c55e' : story.status === 'REJECTED' ? '#ef4444' : '#eab308',
                      border: `1px solid ${story.status === 'PUBLISHED' ? 'rgba(34,197,94,0.2)' : story.status === 'REJECTED' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)'}`
                    }}>
                      {story.status}
                    </span>
                  </div>

                  {/* Action buttons - Now outside the tab content */}
                  <div style={{ display: 'flex', gap: '8px', position: 'relative', zIndex: 10 }}>
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); // Prevent accordion from expanding
                        handleEdit(story); 
                      }}
                      title="Edit Story"
                      style={{ 
                        width: '32px', height: '32px', borderRadius: '8px', 
                        background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)',
                        color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s', fontSize: '1rem'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(14,165,233,0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(14,165,233,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); // Prevent accordion from expanding
                        handleDelete(story.id); 
                      }}
                      title="Delete Story"
                      style={{ 
                        width: '32px', height: '32px', borderRadius: '8px', 
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </summary>
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                  {story.imageUrls && (
                    <div style={{ marginTop: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img 
                        src={story.imageUrls.startsWith('http') ? story.imageUrls : `${API_URL}${story.imageUrls}`} 
                        alt="Story" 
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} 
                      />
                    </div>
                  )}
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
