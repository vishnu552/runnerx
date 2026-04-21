'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

export default function SupportCausePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    causeName: '',
    ngoName: '',
    amount: '',
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    panCardName: '',
    panCardNumber: '',
    wantsTaxExemption: false,
  });

  // Available causes and NGOs
  const causes = [
    { name: 'Education for Underprivileged', ngos: ['Teach For India'] },
    { name: 'Healthcare Access', ngos: ['Mercy Corps India'] },
    { name: 'Environmental Conservation', ngos: ['Wildlife Conservation Trust'] },
    { name: 'Women Empowerment', ngos: ['Pratham Foundation'] },
    { name: 'Child Welfare', ngos: ['SOS Children Villages'] },
  ];

  const amountOptions = [100, 250, 500, 1000, 2500, 5000];

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
          setFormData(prev => ({
            ...prev,
            donorName: data.profile.name || '',
            donorEmail: data.profile.email || '',
            donorPhone: data.profile.phone || '',
          }));
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const [step, setStep] = useState(1); // 1: Form, 2: Payment, 3: Success
  const [rzpOptions, setRzpOptions] = useState(null);
  const [rzpLoading, setRzpLoading] = useState(false);
  const [donationData, setDonationData] = useState(null);

  // Initialize Razorpay when reaching step 2
  useEffect(() => {
    if (step === 2 && rzpOptions && window.Razorpay) {
      setRzpLoading(true);
      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
      
      const timer = setTimeout(() => {
        setRzpLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, rzpOptions]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const selectedCause = causes.find(c => c.name === formData.causeName);

  async function verifyPayment(paymentResponse, currentDonationData) {
    try {
      const res = await fetch('/api/donations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentResponse,
          donationData: {
            ...currentDonationData,
            ngoName: currentDonationData.ngoName || 'RunnerX General Fund',
            amount: Number(currentDonationData.amount),
          },
        }),
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.error('Verification failed:', err);
      return false;
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!formData.causeName || !formData.amount || !formData.donorName || !formData.donorEmail) {
      setError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ngoName: formData.ngoName || 'RunnerX General Fund',
          amount: Number(formData.amount),
        }),
      });
      const orderData = await res.json();
      if (orderData.success) {
        // Setup Razorpay Options
        if (orderData.razorpayOrder && orderData.razorpayOrder.id) {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_Sex1pvJGVswJsD',
            amount: orderData.razorpayOrder.amount,
            currency: orderData.razorpayOrder.currency,
            name: 'RunnerX Kota Marathon',
            description: `Donation for ${formData.causeName}`,
            order_id: orderData.razorpayOrder.id,
            parent: '#razorpay-donation-container',
            handler: async function (response) {
              setSubmitting(true);
              try {
                const verified = await verifyPayment(response, formData);
                if (verified) {
                  setStep(3);
                  setSuccess(true);
                } else {
                  setError('Payment verification failed. Please contact support.');
                  setStep(1);
                }
              } catch (err) {
                console.error('Payment handler error:', err);
                setError('Payment processing error.');
              } finally {
                setSubmitting(false);
              }
            },
            prefill: {
              name: formData.donorName,
              email: formData.donorEmail,
              contact: formData.donorPhone ? (formData.donorPhone.length === 10 ? '+91' + formData.donorPhone : formData.donorPhone) : '',
            },
            theme: { color: '#7c3aed' },
            modal: {
              ondismiss: function () {
                setSubmitting(false);
                setStep(1);
              }
            }
          };
          setRzpOptions(options);
          setStep(2);
        } else {
          // No order ID found
          setError('Failed to create payment order. Please try again.');
        }
      } else {
        setError(orderData.message || 'Donation failed');
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

  if (step === 3 && success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: '2rem',
          }}>❤️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
            Thank You For Your Donation!
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 24px', fontSize: '0.95rem' }}>
            Your contribution of <strong>₹{Number(formData.amount).toLocaleString('en-IN')}</strong> to <strong>{formData.causeName}</strong> makes a real difference. The world needs more runners like you.
          </p>
          <button
            onClick={() => { setStep(1); setSuccess(false); setFormData(prev => ({ ...prev, causeName: '', ngoName: '', amount: '', panCardName: '', panCardNumber: '', wantsTaxExemption: false })); }}
            className="btn btn-primary"
          >
            Make Another Donation
          </button>
        </div>
      </div>
    );
  }

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text)', fontSize: '0.95rem' };
  const labelStyle = { display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero */}
      <div className="card" style={{
        padding: '40px 32px', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(255,220,80,0.1), rgba(0,160,255,0.05))',
        borderTop: '4px solid var(--accent)',
      }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', marginBottom: '8px', textTransform: 'uppercase', fontStyle: 'italic' }}>
          Support a Cause
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}>
          Contribute to a cause and make your run more meaningful. Every step counts, and your generosity can change lives.
        </p>
      </div>

      {step === 1 && (
        <>
          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#ef4444', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Cause selection */}
            <div className="card" style={{ padding: '28px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', fontStyle: 'italic' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Choose Your Cause
              </h2>
              <div>
                <label style={labelStyle}>Support a Cause *</label>
                <select name="causeName" value={formData.causeName} onChange={handleChange} style={inputStyle} required>
                  <option value="">Select a cause</option>
                  {causes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Donation amount */}
            <div className="card" style={{ padding: '28px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)', marginBottom: '20px', textTransform: 'uppercase', fontStyle: 'italic' }}>
                Donation Amount
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                {amountOptions.map(amt => (
                  <button
                    key={amt} type="button"
                    onClick={() => setFormData(prev => ({ ...prev, amount: String(amt) }))}
                    style={{
                      padding: '10px 20px', borderRadius: '8px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                      background: formData.amount === String(amt) ? 'var(--accent)' : 'var(--surface-alt)',
                      color: formData.amount === String(amt) ? '#1a1a2e' : 'var(--text)',
                      border: formData.amount === String(amt) ? 'none' : '1px solid var(--border)',
                      transition: 'all 0.15s',
                      transform: formData.amount === String(amt) ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              <div>
                <label style={labelStyle}>Or enter custom amount *</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="₹ Enter amount" style={inputStyle} min="1" required />
              </div>
            </div>

            {/* Donor details */}
            <div className="card" style={{ padding: '28px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)', marginBottom: '20px', textTransform: 'uppercase', fontStyle: 'italic' }}>Donor Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input type="text" name="donorName" value={formData.donorName} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input type="email" name="donorEmail" value={formData.donorEmail} onChange={handleChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" name="donorPhone" value={formData.donorPhone} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* PAN & Tax */}
            <div className="card" style={{ padding: '28px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)', marginBottom: '20px', textTransform: 'uppercase', fontStyle: 'italic' }}>Tax Exemption (Section 80G)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>PAN Card Name</label>
                  <input type="text" name="panCardName" value={formData.panCardName} onChange={handleChange} style={inputStyle} placeholder="Name as on PAN" />
                </div>
                <div>
                  <label style={labelStyle}>PAN Card Number</label>
                  <input type="text" name="panCardNumber" value={formData.panCardNumber} onChange={handleChange} style={{ ...inputStyle, textTransform: 'uppercase' }} placeholder="ABCDE1234F" maxLength={10} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)' }}>
                <input type="checkbox" name="wantsTaxExemption" checked={formData.wantsTaxExemption} onChange={handleChange} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                Do you want a tax exemption certificate for this donation?
              </label>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit" disabled={submitting}
                className="btn btn-primary"
                style={{ 
                  minWidth: 200, 
                  opacity: submitting ? 0.6 : 1,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                  color: '#1a1a2e',
                  border: 'none',
                  padding: '16px 32px',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  textTransform: 'uppercase',
                  fontStyle: 'italic',
                  boxShadow: '0 10px 20px rgba(255,220,80,0.3)',
                  transform: 'skew(-5deg)',
                }}
              >
                {submitting ? 'Creating Order...' : `Contribute ₹${Number(formData.amount).toLocaleString('en-IN') || '0'} →`}
              </button>
            </div>
          </form>
        </>
      )}

      {step === 2 && (
        <div style={{ minHeight: '60vh' }}>
          <div className="card" style={{ padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
            <button 
              onClick={() => setStep(1)} 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto 20px', textTransform: 'uppercase' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6" /></svg>
              Adjust Amount
            </button>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px', color: 'var(--text)', textTransform: 'uppercase', fontStyle: 'italic' }}>Complete Payment</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>Donation of <strong style={{color: 'var(--primary)'}}>₹{Number(formData.amount).toLocaleString('en-IN')}</strong> for <strong>{formData.causeName}</strong></p>
          </div>
          
          <div 
            id="razorpay-donation-container" 
            style={{ 
              minHeight: '600px', 
              width: '100%',
              maxWidth: '440px',
              margin: '0 auto',
              background: rzpLoading ? 'var(--surface-alt)' : 'transparent', 
              borderRadius: '16px', 
              border: rzpLoading ? '2px dashed var(--border)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: rzpLoading ? 'none' : '0 20px 50px rgba(0,0,0,0.1)'
            }} 
          >
            {rzpLoading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ width: 44, height: 44, border: '4px solid rgba(0,160,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px' }}></div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accessing Secure Gateway...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
