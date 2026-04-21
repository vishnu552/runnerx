'use client';

export const dynamic = 'force-dynamic';


import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useState } from 'react';
import { updateProfile } from '@/lib/actions';
import { authenticatedFetch, API_URL } from '@/lib/api';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary"
      style={{ marginTop: '8px', minWidth: '200px' }}
      disabled={pending}
    >
      {pending ? 'Saving...' : 'Save Profile'}
    </button>
  );
}

const initialState = {
  error: null,
  success: false,
  message: null,
};

export default function ProfilePage() {
  const [state, formAction] = useActionState(updateProfile, initialState);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await authenticatedFetch('/api/auth/profile');
        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [state]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.8rem',
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          My Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Update your personal information for race registrations and event participation.
        </p>
      </div>

      {state?.success && (
        <div style={{
          padding: '14px 20px',
          background: 'rgba(11, 110, 79, 0.08)',
          color: 'var(--primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(11, 110, 79, 0.2)',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '1.2rem' }}>✓</span>
          {state.message || 'Profile updated successfully!'}
        </div>
      )}

      {state?.error && (
        <div style={{
          padding: '14px 20px',
          background: '#fee2e2',
          color: '#b91c1c',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem',
        }}>
          {state.error}
        </div>
      )}

      <form className="contact-form" action={formAction}>
        {/* Personal Information */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--primary)',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '1.3rem' }}>👤</span>
            Personal Information
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">Full Name *</label>
              <input
                className="form-input"
                type="text"
                id="profile-name"
                name="name"
                defaultValue={profile?.name || ''}
                required
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">Email Address</label>
              <input
                className="form-input"
                type="email"
                id="profile-email"
                value={profile?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-gender">Gender</label>
              <select
                className="form-input"
                id="profile-gender"
                name="gender"
                defaultValue={profile?.gender || ''}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-dob">Date of Birth</label>
              <input
                className="form-input"
                type="date"
                id="profile-dob"
                name="dateOfBirth"
                defaultValue={profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : ''}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-phone">Phone Number</label>
              <input
                className="form-input"
                type="tel"
                id="profile-phone"
                name="phone"
                defaultValue={profile?.phone || ''}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-blood">Blood Group</label>
              <select
                className="form-input"
                id="profile-blood"
                name="bloodGroup"
                defaultValue={profile?.bloodGroup || ''}
              >
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--primary)',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '1.3rem' }}>📍</span>
            Location
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-city">City</label>
              <input
                className="form-input"
                type="text"
                id="profile-city"
                name="city"
                defaultValue={profile?.city || ''}
                placeholder="e.g. Kota"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-state">State</label>
              <input
                className="form-input"
                type="text"
                id="profile-state"
                name="state"
                defaultValue={profile?.state || ''}
                placeholder="e.g. Rajasthan"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-county">County</label>
              <input
                className="form-input"
                type="text"
                id="profile-county"
                name="county"
                defaultValue={profile?.county || ''}
                placeholder="e.g. Kota district"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-pincode">Pin Code</label>
              <input
                className="form-input"
                type="text"
                id="profile-pincode"
                name="pinCode"
                defaultValue={profile?.pinCode || ''}
                placeholder="e.g. 324001"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-address">Full Address</label>
              <textarea
                className="form-input"
                id="profile-address"
                name="address"
                defaultValue={profile?.address || ''}
                placeholder="House/Flat, Street, Area, Landmark"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* Race Preferences */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--primary)',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '1.3rem' }}>🏃</span>
            Race Preferences
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-tshirt">T-Shirt Size</label>
              <select
                className="form-input"
                id="profile-tshirt"
                name="tshirtSize"
                defaultValue={profile?.tshirtSize || ''}
              >
                <option value="">Select size</option>
                <option value="XS">XS</option>
                <option value="S">S (Small)</option>
                <option value="M">M (Medium)</option>
                <option value="L">L (Large)</option>
                <option value="XL">XL (Extra Large)</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--primary)',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '1.3rem' }}>🚨</span>
            Emergency Contact
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-emergency-name">Contact Name</label>
              <input
                className="form-input"
                type="text"
                id="profile-emergency-name"
                name="emergencyContactName"
                defaultValue={profile?.emergencyContactName || ''}
                placeholder="Full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-emergency-phone">Contact Phone</label>
              <input
                className="form-input"
                type="tel"
                id="profile-emergency-phone"
                name="emergencyContactPhone"
                defaultValue={profile?.emergencyContactPhone || ''}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <SubmitButton />
        </div>
      </form>

      {/* Update Password */}
      <PasswordUpdateSection />
    </div>
  );
}

function PasswordUpdateSection() {
  const [passFormData, setPassFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handlePassChange = (e) => {
    setPassFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleVisibility = (field) => {
    setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passFormData.newPassword !== passFormData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setUpdating(true);
    setError(null);
    setMessage(null);

    try {
      const res = await authenticatedFetch('/api/auth/update-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passFormData.currentPassword,
          newPassword: passFormData.newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setPassFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.message || 'Failed to update password');
      }
    } catch (err) {
      setError('Internal server error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="card" style={{ padding: '32px' }}>
      <h2 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.2rem',
        fontWeight: 700,
        color: 'var(--primary)',
        marginBottom: '24px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{ fontSize: '1.3rem' }}>🔒</span>
        Update Password
      </h2>

      {message && (
        <div style={{ padding: '12px 16px', background: 'rgba(34, 197, 94, 0.1)', color: '#2e7d32', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          ✓ {message}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
          ✕ {error}
        </div>
      )}

      <form onSubmit={handleUpdatePassword} className="contact-form">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="current-password">Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPass.current ? 'text' : 'password'}
                id="current-password"
                name="currentPassword"
                required
                value={passFormData.currentPassword}
                onChange={handlePassChange}
                placeholder="••••••••"
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => toggleVisibility('current')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                {showPass.current ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-password">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPass.new ? 'text' : 'password'}
                id="new-password"
                name="newPassword"
                required
                minLength={6}
                value={passFormData.newPassword}
                onChange={handlePassChange}
                placeholder="At least 6 characters"
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => toggleVisibility('new')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                {showPass.new ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-new-password">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPass.confirm ? 'text' : 'password'}
                id="confirm-new-password"
                name="confirmPassword"
                required
                value={passFormData.confirmPassword}
                onChange={handlePassChange}
                placeholder="Repeat your new password"
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => toggleVisibility('confirm')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                {showPass.confirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ minWidth: '200px' }}
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
  );
}
