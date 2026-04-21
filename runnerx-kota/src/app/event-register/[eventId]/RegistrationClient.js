'use client';

import React, { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

const emptyForm = {
  fullName: '', email: '', phone: '', gender: '', dob: '',
  pinCode: '', country: '', state: '', city: '', address: '',
  selectedCategoryId: '',
  wantsVirtual: false,
  virtualParentCategoryId: '',
  virtualSubCategoryId: '',
  tshirtSize: '',
};

export default function RegistrationClient({ currentUser, event }) {
  // Flow: step 1 (count) → step 2 (details for participant N) → step 3 (category for participant N) → repeat → step 4 (review all) → step 5 (payment) → step 6 (success)
  const [step, setStep] = useState(1);
  const [participantCount, setParticipantCount] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0); // which participant we're filling (0-based)
  const [participants, setParticipants] = useState([]); // completed participants
  const [isForSelf, setIsForSelf] = useState(false);

  // Current participant form
  const [formData, setFormData] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [rzpLoading, setRzpLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [rzpOptions, setRzpOptions] = useState(null);

  // Derive categories from event
  const categories = event?.categories || [];
  const groundCategories = categories.filter(c => c.raceType !== 'VIRTUAL');
  const virtualCategories = categories.filter(c => c.raceType === 'VIRTUAL');

  // Price calculation for review
  function getParticipantPrice(p) {
    let price = 0;
    
    // 1. Ground Price
    if (p.selectedCategoryId) {
      const cat = categories.find(c => c.id === Number(p.selectedCategoryId));
      if (cat && cat.raceType !== 'VIRTUAL') {
        price += (cat.discountPrice ?? cat.price);
      }
    }
    
    // 2. Virtual Price (if opted in)
    if (p.wantsVirtual && p.virtualSubCategoryId && p.virtualParentCategoryId) {
      const cat = categories.find(c => c.id === Number(p.virtualParentCategoryId));
      if (cat) {
        const settings = Array.isArray(cat.virtualSettings) ? cat.virtualSettings : [];
        const sub = settings.find(s => String(s.categoryId) === String(p.virtualSubCategoryId));
        if (sub) price += (sub.discountPrice ?? sub.price);
      }
    }
    
    return price;
  }
  const subtotal = participants.reduce((sum, p) => sum + getParticipantPrice(p), 0);
  const discount = couponResult?.coupon?.discountAmount || 0;
  const total = Math.max(0, subtotal - discount);

  // Auto-fill for "registering for yourself"
  useEffect(() => {
    if (isForSelf && currentUser && currentIndex === 0) {
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        gender: currentUser.gender || '',
        dob: currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : '',
        pinCode: currentUser.pinCode || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        country: 'India',
      }));
    } else if (!isForSelf && currentIndex === 0) {
      setFormData(prev => ({
        ...prev,
        fullName: '', email: '', phone: '', gender: '', dob: '', pinCode: '', address: '', city: '', state: '', country: '',
      }));
    }
  }, [isForSelf, currentUser, currentIndex]);
  
  // Initialize Razorpay when reaching step 5
  useEffect(() => {
    if (step === 5 && rzpOptions && window.Razorpay) {
      setRzpLoading(true);
      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
      
      // Hide loading text after a short delay to allow iframe to render
      const timer = setTimeout(() => {
        setRzpLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, rzpOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  function validateDetails() {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    else if (formData.phone.trim().length < 10) errs.phone = 'Enter a valid phone number';
    if (!formData.gender) errs.gender = 'Gender is required';
    if (!formData.dob) errs.dob = 'Date of birth is required';
    if (!formData.pinCode.trim()) errs.pinCode = 'Pin code is required';
    if (!formData.country.trim()) errs.country = 'Country is required';
    if (!formData.state.trim()) errs.state = 'State is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.address.trim()) errs.address = 'Address is required';
    if (!formData.tshirtSize) errs.tshirtSize = 'T-shirt size is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateCategory() {
    if (!formData.selectedCategoryId && !formData.wantsVirtual) {
      setErrors({ category: 'Please select at least one participation type (Ground or Virtual)' });
      return false;
    }
    if (formData.wantsVirtual) {
      if (!formData.virtualSubCategoryId) {
        setErrors({ category: 'Please select a virtual race distance' });
        return false;
      }
    }
    setErrors({});
    return true;
  }

  // Save current participant and move to next or review
  function saveCurrentParticipant() {
    if (!validateCategory()) return;
    const updated = [...participants];
    
    const participantData = { ...formData };
    const displayParts = [];
    
    if (participantData.selectedCategoryId) {
        const cat = getCatById(participantData.selectedCategoryId);
        if (cat) displayParts.push(`${getCategoryDisplayName(cat)} (${getCategoryDistance(cat)})`);
    }
    
    if (participantData.wantsVirtual && participantData.virtualSubCategoryId) {
        const parent = getCatById(participantData.virtualParentCategoryId);
        const sub = (parent?.virtualSettings || []).find(s => String(s.categoryId) === String(participantData.virtualSubCategoryId));
        if (sub) displayParts.push(`Virtual ${sub.categoryName} (T-Shirt: ${participantData.tshirtSize})`);
    }

    participantData.displayCategoryName = displayParts.join(' + ');
    participantData.displayDistance = ''; // Combined

    updated[currentIndex] = participantData;
    setParticipants(updated);

    if (currentIndex + 1 < participantCount) {
      // Move to next participant
      setCurrentIndex(currentIndex + 1);
      setFormData({ ...emptyForm });
      setErrors({});
      setStep(2);
    } else {
      // All done, go to review
      setErrors({});
      setStep(4);
    }
  }

  // Go back to edit a specific participant
  function editParticipant(index) {
    setCurrentIndex(index);
    setFormData({ ...participants[index] });
    setErrors({});
    setStep(2);
  }

  // Navigate back
  function goBack() {
    setErrors({});
    if (step === 2) {
      if (currentIndex > 0) {
        // Go back to previous participant's category step
        setCurrentIndex(currentIndex - 1);
        setFormData({ ...participants[currentIndex - 1] });
        setStep(3);
      } else {
        setStep(1);
      }
    } else if (step === 3) {
      setStep(2);
    } else if (step === 4) {
      // Go back to last participant's category step
      const lastIdx = participantCount - 1;
      setCurrentIndex(lastIdx);
      setFormData({ ...participants[lastIdx] });
      setStep(3);
    }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    setCouponResult(null);
    try {
      const res = await fetch(`${API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), siteFor: event.siteFor, amount: subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponResult(data);
      } else {
        setCouponError(data.message || 'Invalid coupon');
      }
    } catch {
      setCouponError('Failed to validate coupon');
    } finally {
      setApplyingCoupon(false);
    }
  }

  async function verifyPayment(paymentResponse, registrationId) {
    try {
      const res = await fetch(`${API_URL}/api/registrations/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentResponse,
          registrationId,
        }),
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.error('Verification failed:', err);
      return false;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');
    try {
      const participantsPayload = [];
      
      participants.forEach((p, i) => {
        const pBase = {
          fullName: p.fullName,
          email: p.email,
          phone: p.phone,
          gender: p.gender,
          dob: p.dob,
          pinCode: p.pinCode,
          country: p.country || 'India',
          state: p.state,
          city: p.city,
          address: p.address,
          isRegistrant: i === 0 && isForSelf,
        };

        // Add Ground Item if selected
        if (p.selectedCategoryId) {
          participantsPayload.push({
            ...pBase,
            eventCategoryId: Number(p.selectedCategoryId),
          });
        }

        // Add Virtual Item if selected
        if (p.wantsVirtual && p.virtualParentCategoryId && p.virtualSubCategoryId) {
          participantsPayload.push({
            ...pBase,
            eventCategoryId: Number(p.virtualParentCategoryId),
            virtualSubCategoryId: Number(p.virtualSubCategoryId),
            tshirtSize: p.tshirtSize,
            // Only one item should be marked as registrant to avoid multiple user linkages
            isRegistrant: i === 0 && isForSelf && !p.selectedCategoryId, 
          });
        }
      });

      const res = await fetch(`${API_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          participants: participantsPayload,
          couponCode: couponResult ? couponCode.trim() : null,
        }),
      });
      const data = await res.json();
      
      if (!data.success) {
        setSubmitError(data.message || 'Registration failed');
        setSubmitting(false);
        return;
      }

      const registration = data.registration;
      setSubmitSuccess(registration);

      // Handle Razorpay Payment
      if (data.razorpayOrder) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_Sex1pvJGVswJsD',
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: 'RunnerX Kota Marathon',
          description: `Registration for ${event.title}`,
          order_id: data.razorpayOrder.id,
          parent: '#razorpay-container',
          handler: async function (response) {
            setSubmitting(true);
            const verified = await verifyPayment(response, registration.id);
            if (verified) {
              setStep(6);
            } else {
              setSubmitError('Payment verification failed. Please contact support.');
              setStep(4);
            }
            setSubmitting(false);
          },
          prefill: {
            name: participants[0]?.fullName || '',
            email: participants[0]?.email || '',
            contact: (participants[0]?.phone?.length === 10 ? '+91' : '') + (participants[0]?.phone || ''),
          },
          readonly: {
            email: true,
            contact: true,
          },
          config: {
            display: {
              hide: [
                { method: 'contact' },
                { method: 'email' }
              ]
            }
          },
          theme: { color: '#00a0ff' },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
              setStep(4);
            }
          }
        };

        setRzpOptions(options);
        setStep(5);
        setSubmitting(false);
      } else {
        // Amount was 0 (fully discounted or free)
        setStep(6);
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  function getCategoryDisplayName(ec) {
    return ec.category?.name || ec.raceType;
  }
  function getCategoryDistance(ec) {
    return ec.category?.distanceLabel || `${ec.distance}km`;
  }
  function getCatById(id) {
    return categories.find(c => c.id === id);
  }

  const formattedEventDate = event ? new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  }) : '';

  const inputStyle = (field) => ({
    width: '100%', padding: '10px 14px', borderRadius: '6px',
    border: errors[field] ? '1px solid #ef4444' : '1px solid var(--border)',
    background: 'var(--background)', color: 'var(--text)', fontSize: '0.95rem',
    outline: errors[field] ? '2px solid rgba(239,68,68,0.2)' : undefined,
  });
  const labelStyle = { display: 'block', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' };
  const errorStyle = { color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' };
  const btnPrimary = { backgroundColor: '#00a0ff', color: 'white', padding: '12px 24px', fontSize: '1.1rem', fontWeight: 600, border: 'none', borderRadius: '8px', cursor: 'pointer' };
  const btnBack = { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '0', marginBottom: '16px', fontWeight: 500 };

  if (!event) {
    return (
      <>
        <section className="page-hero" style={{ padding: '80px 0', textAlign: 'center', background: 'var(--surface-alt)' }}>
          <div className="container">
            <h1 className="page-hero-title">Event Not Found</h1>
            <p className="page-hero-subtitle">This event doesn't exist or is no longer available for registration.</p>
          </div>
        </section>
      </>
    );
  }

  // Progress info
  const totalSteps = 1 + (participantCount * 2) + 1 + 1; // step1 + (details+category)*N + review + payment
  const currentProgress = step === 1 ? 1
    : step === 4 ? totalSteps - 1
    : step === 5 ? totalSteps
    : step === 6 ? totalSteps
    : 1 + (currentIndex * 2) + (step === 2 ? 1 : 2);

  return (
    <>
      <section className="page-hero" style={{ padding: '80px 0', textAlign: 'center', background: 'var(--surface-alt)' }}>
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom: '16px' }}>Event Registration</div>
          <h1 className="page-hero-title">Register for <span style={{ color: 'var(--primary)' }}>{event.title}</span></h1>
          <p className="page-hero-subtitle">{formattedEventDate} • {event.venue}, {event.city}</p>
        </div>
      </section>

      <section className="section" style={{ minHeight: '60vh', padding: '60px 0' }}>
        <div className="container">
          {/* Progress Bar */}
          {step < 6 && (
            <div style={{ maxWidth: 600, margin: '0 auto 40px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8, flexWrap: 'wrap', rowGap: 6 }}>
                <span>{step === 1 ? 'Select Participants' : step === 4 ? 'Review & Pay' : `Participant ${currentIndex + 1} of ${participantCount}`}</span>
                <span>{Math.round((currentProgress / totalSteps) * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${(currentProgress / totalSteps) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #00a0ff, #00a0ff)', borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          <div className="registration-layout">
             
            <div className="registration-main-card">
              
              {/* ═══════════════ STEP 1: PARTICIPANT COUNT ═══════════════ */}
              {step === 1 && (
                <>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', color: 'var(--text)' }}>How many participants?</h2>
                  <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <label style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Number of people to register:
                    </label>
                    <select 
                      value={participantCount} 
                      onChange={(e) => setParticipantCount(Number(e.target.value))}
                      style={{ ...inputStyle(''), minWidth: '80px', width: 'auto' }}
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                    You'll fill in details and select a category for each participant individually.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => { setParticipants([]); setCurrentIndex(0); setFormData({ ...emptyForm }); setStep(2); }} className="btn" style={btnPrimary}>
                      Start Registration →
                    </button>
                  </div>
                </>
              )}

              {/* ═══════════════ STEP 2: PARTICIPANT DETAILS ═══════════════ */}
              {step === 2 && (
                <>
                  <button onClick={goBack} style={btnBack}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    Back
                  </button>

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                      Participant {currentIndex + 1} of {participantCount} — Details
                    </h2>
                    <span style={{ fontSize: '0.85rem', background: 'var(--surface-alt)', padding: '4px 12px', borderRadius: 20, color: 'var(--text-muted)', fontWeight: 600 }}>
                      Step 1/2
                    </span>
                  </div>

                  {/* Completed participants pills */}
                  {participants.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                      {participants.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => editParticipant(i)}
                          style={{
                            padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                            background: i === currentIndex ? '#00a0ff' : 'rgba(34, 197, 94, 0.1)',
                            color: i === currentIndex ? 'white' : '#22c55e',
                            border: i === currentIndex ? 'none' : '1px solid rgba(34, 197, 94, 0.3)',
                            cursor: 'pointer',
                          }}
                        >
                          ✓ {p.fullName.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  )}

                  {currentIndex === 0 && participantCount === 1 && (
                    <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--surface-alt)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)' }}>
                        <input type="checkbox" checked={isForSelf} onChange={(e) => setIsForSelf(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                        Are you registering for yourself?
                      </label>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} style={inputStyle('fullName')} />
                      {errors.fullName && <p style={errorStyle}>{errors.fullName}</p>}
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>Enter details as per gov ID (Aadhaar/PAN/Passport).</p>
                    </div>

                    <div className="registration-two-col">
                      <div>
                        <label style={labelStyle}>Email Address *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle('email')} />
                        {errors.email && <p style={errorStyle}>{errors.email}</p>}
                      </div>
                      <div>
                        <label style={labelStyle}>Mobile No. *</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle('phone')} />
                        {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="registration-two-col">
                      <div>
                        <label style={labelStyle}>Gender *</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle('gender')}>
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.gender && <p style={errorStyle}>{errors.gender}</p>}
                      </div>
                      <div>
                        <label style={labelStyle}>Date of Birth *</label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} style={inputStyle('dob')} />
                        {errors.dob && <p style={errorStyle}>{errors.dob}</p>}
                      </div>
                    </div>

                    <div className="registration-two-col">
                      <div>
                        <label style={labelStyle}>Pin Code *</label>
                        <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange} style={inputStyle('pinCode')} />
                        {errors.pinCode && <p style={errorStyle}>{errors.pinCode}</p>}
                      </div>
                      <div>
                        <label style={labelStyle}>Country *</label>
                        <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="India" style={inputStyle('country')} />
                        {errors.country && <p style={errorStyle}>{errors.country}</p>}
                      </div>
                    </div>

                    <div className="registration-two-col">
                      <div>
                        <label style={labelStyle}>State *</label>
                        <input type="text" name="state" value={formData.state} onChange={handleChange} style={inputStyle('state')} />
                        {errors.state && <p style={errorStyle}>{errors.state}</p>}
                      </div>
                      <div>
                        <label style={labelStyle}>City *</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} style={inputStyle('city')} />
                        {errors.city && <p style={errorStyle}>{errors.city}</p>}
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Full Address *</label>
                      <textarea name="address" value={formData.address} onChange={handleChange} rows="3" style={{ ...inputStyle('address'), resize: 'vertical' }} />
                      {errors.address && <p style={errorStyle}>{errors.address}</p>}
                    </div>

                    <div>
                      <label style={labelStyle}>T-Shirt Size *</label>
                      <select name="tshirtSize" value={formData.tshirtSize} onChange={handleChange} style={inputStyle('tshirtSize')}>
                        <option value="">Select Size</option>
                        <option value="S">Small (S)</option>
                        <option value="M">Medium (M)</option>
                        <option value="L">Large (L)</option>
                        <option value="XL">Extra Large (XL)</option>
                        <option value="XXL">Double Extra Large (XXL)</option>
                      </select>
                      {errors.tshirtSize && <p style={errorStyle}>{errors.tshirtSize}</p>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                    <button onClick={() => { if (validateDetails()) setStep(3); }} className="btn" style={btnPrimary}>
                      Select Category →
                    </button>
                  </div>
                </>
              )}

              {/* ═══════════════ STEP 3: CATEGORY SELECTION ═══════════════ */}
              {step === 3 && (
                <>
                  <button onClick={goBack} style={btnBack}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    Back to Details
                  </button>

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                      Participant {currentIndex + 1} — Select Category
                    </h2>
                    <span style={{ fontSize: '0.85rem', background: 'var(--surface-alt)', padding: '4px 12px', borderRadius: 20, color: 'var(--text-muted)', fontWeight: 600 }}>
                      Step 2/2
                    </span>
                  </div>

                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Selecting category for <strong>{formData.fullName}</strong>
                  </p>

                  {/* 1. Ground Categories List */}
                  {groundCategories.length > 0 && (
                    <>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                        Choose Ground Race Category
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                        {groundCategories.map(ec => {
                          const isSelected = formData.selectedCategoryId === ec.id;
                          const isFull = ec.maxParticipants && ec.registeredCount >= ec.maxParticipants;
                          return (
                            <div key={ec.id}
                              onClick={() => !isFull && setFormData(prev => ({ ...prev, selectedCategoryId: isSelected ? null : ec.id }))}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', padding: '14px 16px',
                                border: isSelected ? '2px solid #00a0ff' : '1px solid var(--border)',
                                borderRadius: '8px', background: isSelected ? 'rgba(0, 160, 255, 0.05)' : 'var(--surface-alt)',
                                cursor: isFull ? 'not-allowed' : 'pointer', opacity: isFull ? 0.5 : 1,
                                transition: 'all 0.2s',
                              }}
                            >
                              <div>
                                <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                                  {ec.category?.icon && <span style={{ marginRight: 6 }}>{ec.category.icon}</span>}
                                  {getCategoryDisplayName(ec)}
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                  {getCategoryDistance(ec)} • {ec.category?.tagline || 'On-ground running event'}
                                </p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>
                                  {ec.discountPrice ? (
                                    <><span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.85em', marginRight: 6 }}>₹{ec.price}</span>₹{ec.discountPrice}</>
                                  ) : (<>₹{ec.price}</>)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* 2. Optional Virtual Section */}
                  {virtualCategories.length > 0 && (
                    <div style={{ padding: '24px', background: 'rgba(255,220,80,0.05)', borderRadius: '12px', border: '1px solid rgba(255,220,80,0.3)', marginBottom: '24px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: formData.wantsVirtual ? '16px' : '0' }}>
                        <input 
                          type="checkbox" 
                          checked={formData.wantsVirtual} 
                          onChange={(e) => {
                             const checked = e.target.checked;
                             setFormData(p => ({ 
                               ...p, 
                               wantsVirtual: checked,
                               virtualParentCategoryId: checked ? virtualCategories[0]?.id : null,
                               virtualSubCategoryId: null
                             }));
                          }} 
                          style={{ width: '22px', height: '22px', accentColor: '#ffdc50' }}
                        />
                        Participate in Virtual Marathon Challenge? (Optional)
                      </label>

                      {formData.wantsVirtual && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', paddingLeft: '34px', borderLeft: '2px solid rgba(255,220,80,0.5)' }}>
                          <div>
                            <label style={labelStyle}>Select Virtual Distance</label>
                            <select 
                              className="input" 
                              style={inputStyle('virtualSubCategoryId')}
                              value={formData.virtualSubCategoryId}
                              onChange={(e) => setFormData(p => ({ ...p, virtualSubCategoryId: e.target.value }))}
                            >
                              <option value="">— Choose Distance —</option>
                              {Array.isArray(virtualCategories[0]?.virtualSettings) && virtualCategories[0].virtualSettings.map(sub => (
                                <option key={sub.categoryId} value={sub.categoryId}>
                                  {sub.categoryName} (₹{sub.discountPrice ?? sub.price})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {errors.category && (
                    <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '16px' }}>⚠ {errors.category}</p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button onClick={saveCurrentParticipant} className="btn" style={btnPrimary}>
                      {currentIndex + 1 < participantCount
                        ? `Save & Next Participant →`
                        : `Review All ${participantCount > 1 ? `${participantCount} Participants` : ''} →`
                      }
                    </button>
                  </div>
                </>
              )}

              {/* ═══════════════ STEP 4: REVIEW ALL ═══════════════ */}
              {step === 4 && (
                <>
                  <button onClick={goBack} style={btnBack}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    Back
                  </button>

                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', color: 'var(--text)' }}>Review & Submit</h2>

                  {submitError && (
                    <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', marginBottom: 16, fontSize: '0.9rem' }}>
                      {submitError}
                    </div>
                  )}

                  {/* Event Info */}
                  <div style={{ padding: '16px', background: 'var(--surface-alt)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>Event</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{event.title}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formattedEventDate} • {event.venue}, {event.city}</p>
                  </div>

                  {/* Each participant */}
                  {participants.map((p, i) => {
                    const cat = getCatById(p.selectedCategoryId);
                    const price = getParticipantPrice(p);
                    return (
                      <div key={i} style={{ padding: '16px', background: 'var(--surface-alt)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                              Participant {i + 1}: {p.fullName}
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.email} • {p.phone}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.gender} • DOB: {p.dob} • {p.city}, {p.state}</p>
                            {cat && (
                              <p style={{ fontSize: '0.9rem', color: '#00a0ff', fontWeight: 600, marginTop: 6 }}>
                                {p.displayCategoryName} ({p.displayDistance}) — ₹{price}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => editParticipant(i)}
                            style={{ fontSize: '0.8rem', color: '#1E40AF', background: 'none', border: '1px solid #1E40AF', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Order Summary */}
                  <div style={{ padding: '16px', background: 'var(--surface-alt)', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '20px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>Order Summary</h3>
                    {participants.map((p, i) => {
                      const cat = getCatById(p.selectedCategoryId);
                      const price = getParticipantPrice(p);
                      return (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                          <span>{p.fullName.split(' ')[0]} — {p.displayCategoryName || '—'}</span>
                          <span>₹{price.toLocaleString('en-IN')}</span>
                        </div>
                      );
                    })}
                    {discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: '#22c55e', fontSize: '0.9rem' }}>
                        <span>Coupon ({couponCode})</span>
                        <span>−₹{discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', marginTop: '8px', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '1.15rem' }}>
                      <span>Total</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Coupon */}
                  {!couponResult && (
                    <div style={{ marginBottom: '24px' }}>
                      <label style={labelStyle}>Have a coupon code?</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code" style={{ ...inputStyle(''), flex: '1 1 240px', minWidth: 0 }} />
                        <button onClick={handleApplyCoupon} disabled={applyingCoupon || !couponCode.trim()} className="btn" style={{ ...btnPrimary, padding: '10px 20px', fontSize: '0.95rem', opacity: couponCode.trim() ? 1 : 0.5 }}>
                          {applyingCoupon ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '6px' }}>{couponError}</p>}
                    </div>
                  )}
                  {couponResult && (
                    <div style={{ padding: '12px 16px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 8, color: '#22c55e', marginBottom: 24, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <span>✓ Coupon <strong>{couponCode}</strong> applied — you save ₹{discount}</span>
                      <button onClick={() => { setCouponResult(null); setCouponCode(''); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}>Remove</button>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button onClick={handleSubmit} disabled={submitting} className="btn" style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1 }}>
                      {submitting ? 'Submitting...' : `Submit Registration — ₹${total.toLocaleString('en-IN')}`}
                    </button>
                  </div>
                </>
              )}

              {/* ═══════════════ STEP 5: SECURE PAYMENT ═══════════════ */}
              {step === 5 && (
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>Secure Payment</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>
                    Complete your payment through the secure Razorpay gateway below.
                  </p>
                  
                  <div 
                    id="razorpay-container" 
                    style={{ 
                      minHeight: '600px', 
                      width: '100%',
                      maxWidth: '440px',
                      margin: '0 auto',
                      background: rzpLoading ? 'var(--surface-alt)' : 'transparent', 
                      borderRadius: '12px', 
                      border: rzpLoading ? '1px solid var(--border)' : 'none',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }} 
                  >
                    {rzpLoading && (
                      <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Initializing Payment Gateway...</p>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ marginTop: '32px', textAlign: 'left' }}>
                    <button 
                      onClick={() => {
                        setRzpOptions(null);
                        setStep(4);
                      }} 
                      style={{ ...btnBack, marginBottom: 0 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                      Back to Review
                    </button>
                  </div>
                </div>
              )}

              {/* ═══════════════ STEP 6: SUCCESS ═══════════════ */}
              {step === 6 && submitSuccess && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2rem' }}>✓</div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>Registration Successful!</h2>
                  <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Your registration for <strong>{event.title}</strong> has been submitted.
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
                    Registration ID: <code style={{ background: 'var(--surface-alt)', padding: '2px 8px', borderRadius: 4 }}>#{submitSuccess.id}</code>
                  </p>
                  <div style={{ padding: '16px', background: 'var(--surface-alt)', borderRadius: '8px', border: '1px solid var(--border)', display: 'inline-block', textAlign: 'left' }}>
                    <p style={{ marginBottom: 4 }}><strong>Participants:</strong> {participants.length}</p>
                    <p style={{ marginBottom: 4 }}><strong>Amount:</strong> ₹{submitSuccess.finalAmount.toLocaleString('en-IN')}</p>
                    <p style={{ marginBottom: 4 }}><strong>Status:</strong> {submitSuccess.status}</p>
                    <p><strong>Payment:</strong> {submitSuccess.paymentStatus}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ═══════════════ SIDEBAR ═══════════════ */}
            <div className="registration-sidebar">
              {/* Event info */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>{event.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', gap: 8 }}><span>📅</span> {formattedEventDate}</div>
                  <div style={{ display: 'flex', gap: 8 }}><span>📍</span> {event.venue}, {event.city}</div>
                  <div style={{ display: 'flex', gap: 8 }}><span>🏃</span> {categories.length} Race Categories</div>
                </div>
              </div>

              {/* Participant progress */}
              {step >= 2 && step <= 4 && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>Participants</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[...Array(participantCount)].map((_, i) => {
                      const done = participants[i];
                      const isCurrent = i === currentIndex && step < 4;
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem',
                          background: isCurrent ? 'rgba(30,64,175,0.05)' : done ? 'rgba(34,197,94,0.05)' : 'var(--surface-alt)',
                          border: isCurrent ? '1px solid #1E40AF' : done ? '1px solid rgba(34,197,94,0.2)' : '1px solid var(--border)',
                        }}>
                          <span style={{ fontWeight: 600, color: done ? '#22c55e' : isCurrent ? '#1E40AF' : 'var(--text-muted)' }}>
                            {done ? '✓' : isCurrent ? '●' : '○'} Participant {i + 1}
                          </span>
                          {done && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{done.fullName.split(' ')[0]}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {[1, 2].map((box) => (
                <div key={box} style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px 16px', textAlign: 'center', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '2px' }}>Advertisement</span>
                  <div style={{ width: '100%', height: '120px', background: 'var(--border-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    Ad Space {box}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
