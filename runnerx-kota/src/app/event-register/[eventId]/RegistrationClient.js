'use client';

import React, { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import PageHero from '@/components/PageHero';

const emptyForm = {
  fullName: '', email: '', phone: '', gender: '', dob: '',
  pinCode: '', country: '', state: '', city: '', address: '',
  wantsGround: false,
  selectedCategoryId: '',
  wantsVirtual: false,
  virtualParentCategoryId: '',
  virtualSubCategoryId: '',
  tshirtSize: '',
  emergencyName: '',
  emergencyPhone: '',
};

// ── Age helper (age as of today — the registration date) ──────────────────
function getAgeToday(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function RegistrationClient({ currentUser, event }) {
  // Flow: step 1 (count) → step 2 (details for participant N) → step 3 (category for participant N) → repeat → step 4 (review all) → step 5 (payment) → step 6 (success)
  const [step, setStep] = useState(1);
  const [participantCount, setParticipantCount] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0); // which participant we're filling (0-based)
  const [participants, setParticipants] = useState([]); // completed participants
  const [isForSelf, setIsForSelf] = useState(false);

  // Progressive save state
  const [registrationId, setRegistrationId] = useState(null); // set after first participant saved
  const [savedLineItems, setSavedLineItems] = useState([]); // [{participantName, uniqueRegId, lineItemId}]
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

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
  const [isVerifying, setIsVerifying] = useState(false);

  // Review Page states
  const [expandedParticipant, setExpandedParticipant] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [tempEditData, setTempEditData] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Derive categories from event
  const categories = event?.categories || [];
  const groundCategories = categories.filter(c => c.raceType?.toUpperCase() !== 'VIRTUAL');
  const virtualCategories = categories.filter(c => c.raceType?.toUpperCase() === 'VIRTUAL');

  // Age-based eligibility helper for the current participant
  const participantAge = getAgeToday(formData.dob);
  const isCategoryEligible = (cat) => {
    if (participantAge === null) return true;
    if (cat.ageMin != null && participantAge < cat.ageMin) return false;
    if (cat.ageMax != null && participantAge > cat.ageMax) return false;
    return true;
  };

  // Donation State
  const [wantsToDonate, setWantsToDonate] = useState(null); // null, true, false
  const [donationData, setDonationData] = useState({
    causeName: '', ngoName: '', amount: '', donorName: '', donorEmail: '', donorPhone: '',
    panCardName: '', panCardNumber: '', wantsTaxExemption: false,
  });

  // Available causes from SupportCausePage
  const causes = [
    { name: 'Education for Underprivileged', ngos: ['Teach For India'] },
    { name: 'Healthcare Access', ngos: ['Mercy Corps India'] },
    { name: 'Environmental Conservation', ngos: ['Wildlife Conservation Trust'] },
    { name: 'Women Empowerment', ngos: ['Pratham Foundation'] },
    { name: 'Child Welfare', ngos: ['SOS Children Villages'] },
  ];
  const donationAmountOptions = [100, 250, 500, 1000, 2500, 5000];

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

  // Current working price (for Step 3 before saving)
  const currentItemPrice = getParticipantPrice(formData);
  const participantsSubtotal = participants.reduce((sum, p) => sum + getParticipantPrice(p), 0);
  const donationAmount = (wantsToDonate && donationData.amount) ? Number(donationData.amount) : 0;
  
  const baseAmount = participantsSubtotal + (step === 3 ? currentItemPrice : 0) + donationAmount;
  const discountAmount = couponResult?.coupon?.discountAmount || 0;
  
  const finalSubtotal = Math.max(0, baseAmount - discountAmount);
  const taxAmount = 0; // finalSubtotal * 0.18;
  const totalAmount = finalSubtotal + taxAmount;
  
  const [showBreakdown, setShowBreakdown] = useState(false);

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
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateCategory() {
    const errs = {};
    const wantsGround = formData.wantsGround;
    const wantsVirtual = formData.wantsVirtual;

    if (!wantsGround && !wantsVirtual) {
      errs.category = 'Please opt-in to at least one participation type (On-Ground or Virtual)';
    }
    
    if (wantsGround) {
      if (!formData.selectedCategoryId) errs.category = 'Please select a ground race category';
      if (!formData.emergencyName.trim()) errs.emergencyName = 'Emergency contact name is required';
      if (!formData.emergencyPhone.trim()) errs.emergencyPhone = 'Emergency contact phone is required';
      else if (formData.emergencyPhone.trim().length < 10) errs.emergencyPhone = 'Enter a valid phone number';
    }
    
    if (wantsVirtual && !formData.virtualSubCategoryId) {
      errs.category = 'Please select a virtual race distance';
    }

    if (!formData.tshirtSize) {
      errs.tshirtSize = 'T-shirt size is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // Save current participant to DB (progressive save) then move to next or review
  async function saveCurrentParticipant() {
    if (!validateCategory()) return;
    setSaveError('');
    setIsSaving(true);

    // Build local participant data for display
    const participantData = { ...formData };
    const displayParts = [];
    
    if (participantData.selectedCategoryId) {
      const cat = getCatById(Number(participantData.selectedCategoryId));
      if (cat) displayParts.push(`${getCategoryDisplayName(cat)} (${getCategoryDistance(cat)})`);
    }
    if (participantData.wantsVirtual && participantData.virtualSubCategoryId) {
      const parent = getCatById(Number(participantData.virtualParentCategoryId));
      const sub = (parent?.virtualSettings || []).find(s => String(s.categoryId) === String(participantData.virtualSubCategoryId));
      if (sub) {
        const subName = getVirtualCategoryName(sub.categoryName);
        displayParts.push(`${subName} (T-Shirt: ${participantData.tshirtSize})`);
      }
    }
    participantData.displayCategoryName = displayParts.join(' + ');
    participantData.displayDistance = '';

    // ── Progressive API call ──────────────────────────────────────────────────
    // Determine which category to save (ground takes priority; virtual saved separately)
    const categoryIdToSave = participantData.selectedCategoryId
      ? Number(participantData.selectedCategoryId)
      : (participantData.wantsVirtual ? Number(participantData.virtualParentCategoryId) : null);

    if (!categoryIdToSave) {
      setSaveError('No category selected.');
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        eventId: event.id,
        saveMode: 'progressive',
        registrationId: registrationId || undefined,
        participant: {
          eventCategoryId: categoryIdToSave,
          fullName: participantData.fullName,
          email: participantData.email,
          phone: participantData.phone,
          gender: participantData.gender,
          dob: participantData.dob,
          pinCode: participantData.pinCode,
          country: participantData.country || 'India',
          state: participantData.state,
          city: participantData.city,
          address: participantData.address,
          isRegistrant: currentIndex === 0 && isForSelf,
          tshirtSize: participantData.tshirtSize || null,
          emergencyContactName: participantData.emergencyName || null,
          emergencyContactPhone: participantData.emergencyPhone || null,
          virtualSubCategoryId: participantData.wantsVirtual && !participantData.selectedCategoryId
            ? Number(participantData.virtualSubCategoryId) || null
            : null,
        },
      };

      const res = await fetch(`${API_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) {
        setSaveError(data.message || 'Failed to save participant. Please try again.');
        setIsSaving(false);
        return;
      }

      // Store registration ID (created by first participant)
      if (!registrationId) setRegistrationId(data.registrationId);

      // Track saved line items for success page
      participantData.lineItemId = data.lineItemId;
      participantData.uniqueRegId = data.uniqueRegId;
      setSavedLineItems(prev => [
        ...prev,
        { participantName: participantData.fullName, uniqueRegId: data.uniqueRegId, lineItemId: data.lineItemId },
      ]);
    } catch (err) {
      console.error('Progressive save error:', err);
      setSaveError('Network error. Please check your connection and try again.');
      setIsSaving(false);
      return;
    }
    // ────────────────────────────────────────────────────────────────────────

    const updated = [...participants];
    updated[currentIndex] = participantData;
    setParticipants(updated);
    setIsSaving(false);

    if (currentIndex + 1 < participantCount) {
      // Move to next participant
      setCurrentIndex(currentIndex + 1);
      setFormData({ ...emptyForm });
      setErrors({});
      setStep(2);
    } else {
      // All done, go to donation step
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
    } else if (step === 5) {
      setStep(4);
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
        body: JSON.stringify({ code: couponCode.trim(), siteFor: event.siteFor, amount: baseAmount }),
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

  function validateDonation() {
    if (wantsToDonate === null) {
      setErrors({ donation: 'Please select whether you want to donate or not.' });
      return false;
    }
    if (wantsToDonate === true) {
      const errs = {};
      if (!donationData.amount || Number(donationData.amount) <= 0) errs.amount = 'Please enter a valid donation amount';
      if (!donationData.donorName) errs.donorName = 'Donor name is required';
      if (!donationData.donorEmail) errs.donorEmail = 'Donor email is required';
      if (!donationData.donorPhone) errs.donorPhone = 'Donor phone is required';
      else if (donationData.donorPhone.length < 10) errs.donorPhone = 'Enter a valid phone number';
      if (donationData.wantsTaxExemption) {
        if (!donationData.panCardName) errs.panCardName = 'PAN card name is required';
        if (!donationData.panCardNumber) errs.panCardNumber = 'PAN number is required';
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(donationData.panCardNumber)) errs.panCardNumber = 'Invalid PAN format';
      }
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }
    return true;
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
    if (!registrationId) {
      setSubmitError('Registration session expired. Please start over.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      // ── Generate Order Mode ──────────────────────────────────────────────
      // All participants are already saved progressively.
      // We only need to apply the coupon and create a Razorpay order.
      const res = await fetch(`${API_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          registrationId,
          generateOrder: true,
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
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: 'RunnerX Kota Marathon',
          description: `Registration for ${event.title}`,
          order_id: data.razorpayOrder.id,
          handler: async function (response) {
            setIsVerifying(true);
            setSubmitting(true);
            const verified = await verifyPayment(response, registration.id);
            if (verified) {
              setIsVerifying(false);
              setStep(7);
            } else {
              setIsVerifying(false);
              setSubmitError('Payment verification failed. Please contact support.');
              setStep(5);
            }
            setSubmitting(false);
          },
          prefill: {
            name: currentUser?.name || participants[0]?.fullName || '',
            email: currentUser?.email || participants[0]?.email || '',
            contact: (() => {
              let p = currentUser?.phone || participants[0]?.phone || '';
              p = p.replace(/\D/g, '');
              if (p.length === 10) return '+91' + p;
              return p;
            })(),
          },
          readonly: { email: true, contact: true },
          theme: { color: '#ffc83c' },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
              setStep(5);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setSubmitting(false);
      } else if (registration.finalAmount === 0) {
        // Amount was 0 (fully discounted or free) — mark confirmed via verify
        const verified = await verifyPayment({ razorpay_order_id: '', razorpay_payment_id: 'FREE', razorpay_signature: '' }, registration.id);
        setStep(7);
        setSubmitting(false);
      } else {
        // Amount > 0 but Razorpay failed to create an order
        setSubmitError('Payment gateway error. Please check your Razorpay API keys or try again later.');
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
  function getVirtualCategoryName(categoryName) {
    let name = (categoryName || '').toLowerCase();
    if (name.includes('3k') || name.includes('3 km')) return 'Virtual 3k';
    if (name.includes('5k') || name.includes('5 km')) return 'Virtual 5k';
    if (name.includes('10k') || name.includes('10 km')) return 'Virtual 10k';
    if (name.includes('half marathon') || name.includes('21.1') || name.includes('21k')) return 'Virtual Half Marathon';
    
    if (!name.startsWith('virtual')) {
      return `Virtual ${categoryName}`;
    }
    return categoryName;
  }

  const formattedEventDate = event ? new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  }) : '';

  const inputStyle = (field) => ({
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    border: errors[field] ? '1px solid #ef4444' : '1px solid var(--border)',
    background: 'var(--background)', color: 'var(--text)', fontSize: '1rem',
    outline: errors[field] ? '2px solid rgba(239,68,68,0.2)' : undefined,
    transition: 'all 0.2s',
  });
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const errorStyle = { color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' };
  const btnPrimary = { backgroundColor: '#ffc83c', color: 'white', padding: '12px 24px', fontSize: '1.1rem', fontWeight: 600, border: 'none', borderRadius: '8px', cursor: 'pointer' };
  const btnBack = { background: 'none', border: 'none', color: '#ffc83c', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '0', marginBottom: '24px', fontWeight: 700 };

  if (!event) {
    return (
      <PageHero 
        title="Event Not Found"
        subtitle="This event doesn't exist or is no longer available for registration."
      />
    );
  }

  // Progress info
  const totalSteps = 1 + (participantCount * 2) + 1 + 1 + 1; // step1 + (details+category)*N + donation + review + payment
  const currentProgress = step === 1 ? 1
    : step === 5 ? totalSteps - 1
    : step === 6 ? totalSteps
    : step === 7 ? totalSteps
    : 1 + (currentIndex * 2) + (step === 2 ? 1 : 2);

  const renderContent = () => (
    <>
      <PageHero 
        title="Register for"
        titleAccent={event.title}
      />

      <section className="section" style={{ minHeight: '60vh' }}>
        <div className="container registration-container">
          {/* Progress Bar */}


          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="registration-header">
              {step > 1 && step < 7 && (
                <button onClick={goBack} style={btnBack}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                  Back
                </button>
              )}

              {/* Outside Headings */}
              {step === 1 && (
                <h2 style={{ fontWeight: 900, marginBottom: '8px', color: 'var(--text)', textTransform: 'uppercase' }}>Register Participants</h2>
              )}
              {step === 2 && (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <h2 style={{ fontWeight: 900, color: 'var(--text)', margin: 0, textTransform: 'uppercase' }}>
                    Participant {currentIndex + 1} of {participantCount} — Details
                  </h2>
                </div>
              )}
              {step === 3 && (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <h2 style={{ fontWeight: 900, color: 'var(--text)', margin: 0, textTransform: 'uppercase' }}>
                    Participant {currentIndex + 1} — Select Category
                  </h2>
                </div>
              )}
              {step === 4 && (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <h2 style={{ fontWeight: 900, color: 'var(--text)', margin: 0, textTransform: 'uppercase' }}>
                    Support a Cause
                  </h2>
                </div>
              )}
              {step === 5 && (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <h2 style={{ fontWeight: 900, color: 'var(--text)', margin: 0, textTransform: 'uppercase' }}>
                    Review & Submit
                  </h2>
                </div>
              )}
            </div>
            
            <div className="registration-main-card" style={{ maxWidth: '850px', width: '100%', border: 'none', background: 'none', padding: 0, alignSelf: 'center' }}>
              
              {isVerifying && (
                <div style={{ textAlign: 'center', padding: '100px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px', animation: 'fadeIn 0.5s ease' }}>
                  <div style={{ position: 'relative', width: '100px', height: '100px', marginBottom: '40px' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '4px solid rgba(255, 200, 60, 0.1)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '4px solid transparent', borderTopColor: '#ffc83c', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '2.5rem' }}>💳</div>
                  </div>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '16px', color: 'var(--text)', letterSpacing: '-0.02em' }}>Verifying Your Payment</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
                    Hang tight! We're confirming your transaction with the bank. This usually takes just a few seconds. 
                  </p>
                  <p style={{ color: '#ffc83c', fontSize: '1rem', fontWeight: 700, marginTop: '32px', textTransform: 'uppercase', letterSpacing: '2px', animation: 'pulse 2s infinite' }}>
                    Please do not refresh or close this page
                  </p>
                  <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
                  `}</style>
                </div>
              )}

              {/* ═══════════════ STEP 1: PARTICIPANT COUNT ═══════════════ */}
              {!isVerifying && step === 1 && (
                <>

                  <div className="registration-form-section card" style={{ border: '2px solid #ffc83c', marginBottom: '32px' }}>
                    <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '24px', fontWeight: 600 }}>
                      How many people would you like to register for this event?
                    </p>
                    
                    <div style={{ marginBottom: '32px' }}>
                      <label className="registration-label" style={labelStyle}>Number of Participants</label>
                      <select 
                        value={participantCount} 
                        onChange={(e) => setParticipantCount(Number(e.target.value))}
                        className="registration-input"
                        style={{ ...inputStyle(''), maxWidth: '120px' }}
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => { setParticipants([]); setCurrentIndex(0); setFormData({ ...emptyForm }); setStep(2); }} 
                        className="btn" 
                        style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px' }}
                      >
                        Start Registration
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ═══════════════ STEP 2: PARTICIPANT DETAILS ═══════════════ */}
              {!isVerifying && step === 2 && (
                <>
                  <div className="registration-form-section card" style={{ border: '2px solid #ffc83c' }}>

                  {/* Completed participants pills */}
                  {participants.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                      {participants.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => editParticipant(i)}
                          style={{
                            padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                            background: i === currentIndex ? '#ffc83c' : 'rgba(34, 197, 94, 0.1)',
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
                      <label className="registration-label" style={labelStyle}>Full Name *</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="registration-input" style={inputStyle('fullName')} />
                      {errors.fullName && <p style={errorStyle}>{errors.fullName}</p>}
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>Enter details as per gov ID (Aadhaar/PAN/Passport).</p>
                    </div>

                    <div className="registration-two-col">
                      <div>
                        <label className="registration-label" style={labelStyle}>Email Address *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="registration-input" style={inputStyle('email')} />
                        {errors.email && <p style={errorStyle}>{errors.email}</p>}
                      </div>
                      <div>
                        <label className="registration-label" style={labelStyle}>Mobile No. *</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="registration-input" style={inputStyle('phone')} />
                        {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="registration-two-col">
                      <div>
                        <label className="registration-label" style={labelStyle}>Gender *</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="registration-input" style={inputStyle('gender')}>
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.gender && <p style={errorStyle}>{errors.gender}</p>}
                      </div>
                      <div>
                        <label className="registration-label" style={labelStyle}>Date of Birth *</label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="registration-input" style={inputStyle('dob')} />
                        {errors.dob && <p style={errorStyle}>{errors.dob}</p>}
                      </div>
                    </div>

                    <div className="registration-two-col">
                      <div>
                        <label className="registration-label" style={labelStyle}>Pin Code *</label>
                        <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange} className="registration-input" style={inputStyle('pinCode')} />
                        {errors.pinCode && <p style={errorStyle}>{errors.pinCode}</p>}
                      </div>
                      <div>
                        <label className="registration-label" style={labelStyle}>Country *</label>
                        <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="India" className="registration-input" style={inputStyle('country')} />
                        {errors.country && <p style={errorStyle}>{errors.country}</p>}
                      </div>
                    </div>

                    <div className="registration-two-col">
                      <div>
                        <label className="registration-label" style={labelStyle}>State *</label>
                        <input type="text" name="state" value={formData.state} onChange={handleChange} className="registration-input" style={inputStyle('state')} />
                        {errors.state && <p style={errorStyle}>{errors.state}</p>}
                      </div>
                      <div>
                        <label className="registration-label" style={labelStyle}>City *</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} className="registration-input" style={inputStyle('city')} />
                        {errors.city && <p style={errorStyle}>{errors.city}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="registration-label" style={labelStyle}>Full Address *</label>
                      <textarea name="address" value={formData.address} onChange={handleChange} rows="3" style={{ ...inputStyle('address'), resize: 'vertical' }} />
                      {errors.address && <p style={errorStyle}>{errors.address}</p>}
                    </div>

                    </div>
                  </div>

                </>
              )}

              {/* ═══════════════ STEP 3: CATEGORY SELECTION ═══════════════ */}
              {!isVerifying && step === 3 && (
                <>

                  {/* 1. On-Ground Participation Section */}
                  {groundCategories.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        On-Ground Race
                      </h3>
                      <div className="registration-form-section card" style={{ border: '2px solid #ffc83c' }}>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '20px', fontWeight: 600 }}>Participate in On-Ground Race?</p>
                        <div style={{ display: 'flex', gap: '24px', marginBottom: formData.wantsGround ? '24px' : '0' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}>
                            <input type="radio" name="wantsGround" checked={formData.wantsGround === true} onChange={() => setFormData(p => ({ ...p, wantsGround: true }))} style={{ width: '20px', height: '20px', accentColor: '#ffc83c' }} />
                            Yes
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}>
                            <input type="radio" name="wantsGround" checked={formData.wantsGround === false} onChange={() => setFormData(p => ({ ...p, wantsGround: false, selectedCategoryId: '' }))} style={{ width: '20px', height: '20px', accentColor: '#ffc83c' }} />
                            No
                          </label>
                        </div>

                        {formData.wantsGround && (
                          <div style={{ padding: '20px', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <label className="registration-label" style={labelStyle}>Select Ground Race Category</label>
                            <select value={formData.selectedCategoryId || ''} onChange={(e) => setFormData(prev => ({ ...prev, selectedCategoryId: Number(e.target.value) || null }))} className="registration-input" style={inputStyle('selectedCategoryId')}>
                              <option value="">— Choose Distance —</option>
                              {groundCategories.map(ec => {
                                const eligible = isCategoryEligible(ec);
                                const ageLabel = !eligible
                                  ? (ec.ageMin != null && participantAge < ec.ageMin
                                      ? `Min age: ${ec.ageMin} yrs`
                                      : `Max age: ${ec.ageMax} yrs`)
                                  : null;
                                return (
                                  <option key={ec.id} value={ec.id} disabled={!eligible}>
                                    {getCategoryDisplayName(ec)} ({getCategoryDistance(ec)}) — ₹{ec.discountPrice || ec.price}{ageLabel ? ` ⚠ ${ageLabel}` : ''}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. Virtual Participation Section */}
                  {virtualCategories.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Virtual Marathon Challenge
                      </h3>
                      <div className="registration-form-section card" style={{ border: '2px solid #ffc83c' }}>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '20px', fontWeight: 600 }}>Participate in Virtual Marathon Challenge?</p>
                        <div style={{ display: 'flex', gap: '24px', marginBottom: formData.wantsVirtual ? '24px' : '0' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}>
                            <input type="radio" name="wantsVirtual" checked={formData.wantsVirtual === true} onChange={() => setFormData(p => ({ ...p, wantsVirtual: true, virtualParentCategoryId: virtualCategories[0]?.id || '' }))} style={{ width: '20px', height: '20px', accentColor: '#ffc83c' }} />
                            Yes
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}>
                            <input type="radio" name="wantsVirtual" checked={formData.wantsVirtual === false} onChange={() => setFormData(p => ({ ...p, wantsVirtual: false, virtualSubCategoryId: '' }))} style={{ width: '20px', height: '20px', accentColor: '#ffc83c' }} />
                            No
                          </label>
                        </div>

                        {formData.wantsVirtual && (
                          <div style={{ padding: '20px', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <label className="registration-label" style={labelStyle}>Select Virtual Distance</label>
                            <select className="registration-input" style={inputStyle('virtualSubCategoryId')} value={formData.virtualSubCategoryId} onChange={(e) => setFormData(p => ({ ...p, virtualSubCategoryId: e.target.value }))}>
                              <option value="">— Choose Distance —</option>
                              {Array.isArray(virtualCategories[0]?.virtualSettings) && virtualCategories[0].virtualSettings.map(sub => {
                                const subName = getVirtualCategoryName(sub.categoryName);
                                return (
                                  <option key={sub.categoryId} value={sub.categoryId}>
                                    {subName} (₹{sub.discountPrice ?? sub.price})
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {errors.category && (
                    <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '16px', fontWeight: 600 }}>⚠ {errors.category}</p>
                  )}
                  {saveError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#dc2626', fontSize: '0.9rem', fontWeight: 600 }}>
                      ⚠ {saveError}
                    </div>
                  )}

                  {/* 3. Additional Information Section */}
                  <div style={{ marginBottom: '0' }}>
                    <h3 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Additional Information
                    </h3>
                    <div className="registration-form-section card" style={{ border: '2px solid #ffc83c' }}>
                      <div style={{ marginBottom: formData.wantsGround ? '24px' : '0' }}>
                        <label className="registration-label" style={labelStyle}>Confirm T-Shirt Size *</label>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>This T-shirt is included with your registration.</p>
                        <select name="tshirtSize" value={formData.tshirtSize} onChange={handleChange} className="registration-input" style={{ ...inputStyle('tshirtSize'), maxWidth: '300px' }}>
                          <option value="">Select Size</option>
                          <option value="XXS">XXS - 32 Inch</option>
                          <option value="XS">XS - 34 Inch</option>
                          <option value="S">S - 36 Inch</option>
                          <option value="M">M - 38 Inch</option>
                          <option value="L">L - 40 Inch</option>
                          <option value="XL">XL - 42 Inch</option>
                          <option value="XXL">XXL - 44 Inch</option>
                        </select>
                        {errors.tshirtSize && <p style={errorStyle}>{errors.tshirtSize}</p>}
                      </div>

                      {formData.wantsGround && (
                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>Emergency Contact</h4>
                          <div className="registration-two-col">
                            <div>
                              <label className="registration-label" style={labelStyle}>Contact Name *</label>
                              <input type="text" name="emergencyName" value={formData.emergencyName} onChange={handleChange} placeholder="Relation/Name" className="registration-input" style={inputStyle('emergencyName')} />
                              {errors.emergencyName && <p style={errorStyle}>{errors.emergencyName}</p>}
                            </div>
                            <div>
                              <label className="registration-label" style={labelStyle}>Contact Mobile *</label>
                              <input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} placeholder="10-digit number" className="registration-input" style={inputStyle('emergencyPhone')} />
                              {errors.emergencyPhone && <p style={errorStyle}>{errors.emergencyPhone}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </>
              )}

              {/* ═══════════════ STEP 4: SUPPORT A CAUSE (DONATION) ═══════════════ */}
              {!isVerifying && step === 4 && (
                <>
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Support a Cause
                    </h3>
                    <div className="registration-form-section card" style={{ border: '2px solid #ffc83c' }}>
                      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '20px', fontWeight: 600 }}>
                        Contribute to a cause and make your run more meaningful. Would you like to donate?
                      </p>
                      
                      <div style={{ display: 'flex', gap: '24px', marginBottom: wantsToDonate ? '24px' : '0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700 }}>
                          <input type="radio" checked={wantsToDonate === true} onChange={() => { setWantsToDonate(true); if(!donationData.donorName) setDonationData(prev => ({ ...prev, donorName: participants[0]?.fullName, donorEmail: participants[0]?.email, donorPhone: participants[0]?.phone })); }} style={{ width: '22px', height: '22px', accentColor: '#ffc83c' }} />
                          Yes, I want to support
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700 }}>
                          <input type="radio" checked={wantsToDonate === false} onChange={() => setWantsToDonate(false)} style={{ width: '22px', height: '22px', accentColor: '#ffc83c' }} />
                          No, maybe next time
                        </label>
                      </div>

                      {errors.donation && <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '12px', fontWeight: 600 }}>{errors.donation}</p>}

                      {wantsToDonate && (
                        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
                          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                          
                          {/* Cause Selection (Commented for now) */}
                          {/* 
                          <div style={{ padding: '20px', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <label className="registration-label" style={labelStyle}>Choose a Cause *</label>
                            <select 
                              value={donationData.causeName} 
                              onChange={(e) => setDonationData(prev => ({ ...prev, causeName: e.target.value }))}
                              className="registration-input" style={inputStyle('causeName')}
                            >
                              <option value="">— Select Cause —</option>
                              {causes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            {errors.causeName && <p style={errorStyle}>{errors.causeName}</p>}
                          </div>
                          */}

                          <div style={{ padding: '20px', background: 'rgba(255,200,60,0.1)', borderRadius: '12px', border: '1px dashed #ffc83c' }}>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)', fontWeight: 600 }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffc83c" strokeWidth="2.5" style={{ marginRight: 8, verticalAlign: 'middle' }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                              Deepti Welfare Foundation is the NGO that will receive this donation.
                            </p>
                          </div>

                          {/* Donation Amount */}
                          <div style={{ padding: '20px', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <label className="registration-label" style={labelStyle}>Donation Amount (₹) *</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                              {donationAmountOptions.map(amt => (
                                <button
                                  key={amt}
                                  onClick={() => setDonationData(prev => ({ ...prev, amount: String(amt) }))}
                                  style={{
                                    padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
                                    background: donationData.amount === String(amt) ? '#ffc83c' : 'white',
                                    color: donationData.amount === String(amt) ? 'white' : 'var(--text)',
                                    border: '1px solid #ffc83c'
                                  }}
                                >
                                  ₹{amt.toLocaleString('en-IN')}
                                </button>
                              ))}
                            </div>
                            <input 
                              type="number" 
                              min="1"
                              placeholder="Or enter custom amount" 
                              value={donationData.amount}
                              onChange={(e) => setDonationData(prev => ({ ...prev, amount: Math.max(0, Number(e.target.value)) || '' }))}
                              className="registration-input" style={inputStyle('amount')}
                            />
                            {errors.amount && <p style={errorStyle}>{errors.amount}</p>}
                          </div>

                          {/* Donor Details */}
                          <div style={{ padding: '20px', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>Donor Information</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              <div className="registration-two-col">
                                <div>
                                  <label className="registration-label" style={labelStyle}>Donor Name *</label>
                                  <input type="text" value={donationData.donorName} onChange={(e) => setDonationData(p => ({ ...p, donorName: e.target.value }))} className="registration-input" style={inputStyle('donorName')} />
                                  {errors.donorName && <p style={errorStyle}>{errors.donorName}</p>}
                                </div>
                                <div>
                                  <label className="registration-label" style={labelStyle}>Donor Email *</label>
                                  <input type="email" value={donationData.donorEmail} onChange={(e) => setDonationData(p => ({ ...p, donorEmail: e.target.value }))} className="registration-input" style={inputStyle('donorEmail')} />
                                  {errors.donorEmail && <p style={errorStyle}>{errors.donorEmail}</p>}
                                </div>
                              </div>
                              <div style={{ maxWidth: '300px' }}>
                                <label className="registration-label" style={labelStyle}>Donor Phone *</label>
                                <input type="tel" value={donationData.donorPhone} onChange={(e) => setDonationData(p => ({ ...p, donorPhone: e.target.value }))} placeholder="10-digit number" className="registration-input" style={inputStyle('donorPhone')} />
                                {errors.donorPhone && <p style={errorStyle}>{errors.donorPhone}</p>}
                              </div>
                            </div>
                          </div>

                          {/* Tax Exemption */}
                          <div style={{ padding: '20px', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>Tax Exemption (Section 80G)</h4>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Do you want a tax exemption certificate for this donation?</p>
                            
                            <div style={{ display: 'flex', gap: '24px', marginBottom: donationData.wantsTaxExemption ? '24px' : '0' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}>
                                <input type="radio" checked={donationData.wantsTaxExemption === true} onChange={() => setDonationData(p => ({ ...p, wantsTaxExemption: true }))} style={{ width: '20px', height: '20px', accentColor: '#ffc83c' }} />
                                Yes
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}>
                                <input type="radio" checked={donationData.wantsTaxExemption === false} onChange={() => setDonationData(p => ({ ...p, wantsTaxExemption: false, panCardName: '', panCardNumber: '' }))} style={{ width: '20px', height: '20px', accentColor: '#ffc83c' }} />
                                No
                              </label>
                            </div>

                            {donationData.wantsTaxExemption && (
                              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', animation: 'fadeIn 0.3s ease' }}>
                                <div className="registration-two-col">
                                  <div>
                                    <label className="registration-label" style={labelStyle}>PAN Card Name *</label>
                                    <input type="text" value={donationData.panCardName} onChange={(e) => setDonationData(p => ({ ...p, panCardName: e.target.value }))} placeholder="As on PAN" className="registration-input" style={inputStyle('panCardName')} />
                                    {errors.panCardName && <p style={errorStyle}>{errors.panCardName}</p>}
                                  </div>
                                  <div>
                                    <label className="registration-label" style={labelStyle}>PAN Number *</label>
                                    <input type="text" value={donationData.panCardNumber} onChange={(e) => setDonationData(p => ({ ...p, panCardNumber: e.target.value.toUpperCase() }))} placeholder="ABCDE1234F" maxLength={10} className="registration-input" style={inputStyle('panCardNumber')} />
                                    {errors.panCardNumber && <p style={errorStyle}>{errors.panCardNumber}</p>}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* ═══════════════ STEP 5: REVIEW ALL ═══════════════ */}
              {!isVerifying && step === 5 && (
                <>

                  {submitError && (
                    <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', marginBottom: 16, fontSize: '0.9rem' }}>
                      {submitError}
                    </div>
                  )}


                  {/* Each participant - Collapsible */}
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Participants</h3>
                    {participants.map((p, i) => {
                      const isExpanded = expandedParticipant === i;
                      const cat = getCatById(p.selectedCategoryId);
                      const price = getParticipantPrice(p);
                      return (
                        <div key={i} style={{ padding: '20px', background: 'var(--surface)', borderRadius: '16px', border: '2px solid #ffc83c', marginBottom: '12px', transition: 'all 0.3s' }}>
                          <div 
                            onClick={() => setExpandedParticipant(isExpanded ? null : i)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ width: '32px', height: '32px', background: '#ffc83c', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                                {i + 1}
                              </div>
                              <div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{p.fullName}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                                  {p.virtualSubCategoryId ? (() => {
                                      const parent = getCatById(p.virtualParentCategoryId);
                                      const sub = parent?.virtualSettings?.find(s => String(s.categoryId) === String(p.virtualSubCategoryId));
                                      if (sub) {
                                        let name = sub.categoryName;
                                        if (name.toLowerCase().includes('virtual')) return name;
                                        return `${name} (Virtual)`;
                                      }
                                      return parent?.name || "Virtual Race";
                                    })() : (cat?.name || "Race Category")}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingIdx(i);
                                  setTempEditData({ ...p });
                                  setEditErrors({});
                                  setIsEditModalOpen(true);
                                }}
                                style={{ fontSize: '0.75rem', color: '#ffc83c', background: 'none', border: '1px solid #ffc83c', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}
                              >
                                Edit
                              </button>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.3s', color: 'var(--text-muted)' }}>
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </div>
                          </div>

                          {isExpanded && (
                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', animation: 'fadeIn 0.3s ease' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                <div>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Contact Info</p>
                                  <p style={{ fontSize: '0.9rem', color: 'var(--text)', margin: 0 }}>{p.email}</p>
                                  <p style={{ fontSize: '0.9rem', color: 'var(--text)', margin: 0 }}>{p.phone}</p>
                                </div>
                                <div>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Personal</p>
                                  <p style={{ fontSize: '0.9rem', color: 'var(--text)', margin: 0 }}>{p.gender} • {p.dob}</p>
                                  <p style={{ fontSize: '0.9rem', color: 'var(--text)', margin: 0 }}>{p.city}, {p.state}</p>
                                </div>
                                <div>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Selection</p>
                                  {p.selectedCategoryId && (
                                    <p style={{ fontSize: '0.9rem', color: '#d4a017', fontWeight: 700, margin: 0 }}>
                                      Ground: {getCatById(p.selectedCategoryId)?.title} ({getCatById(p.selectedCategoryId)?.distance} KM)
                                    </p>
                                  )}
                                  {p.virtualCategoryId && (
                                    <p style={{ fontSize: '0.9rem', color: '#6366f1', fontWeight: 700, margin: 0 }}>
                                      Virtual: {getCatById(p.virtualCategoryId)?.title} ({getCatById(p.virtualCategoryId)?.distance} KM)
                                    </p>
                                  )}
                                  <p style={{ fontSize: '0.9rem', color: 'var(--text)', margin: '4px 0 0' }}>T-Shirt: {p.tshirtSize}</p>
                                </div>
                                {p.emergencyName && (
                                  <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Emergency</p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text)', margin: 0 }}>{p.emergencyName}</p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text)', margin: 0 }}>{p.emergencyPhone}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Summary */}
                  <div style={{ padding: '24px', background: 'var(--surface)', borderRadius: '16px', border: '2px solid #ffc83c', marginTop: '20px', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Summary</h3>
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
                    {discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: '#22c55e', fontSize: '0.95rem', fontWeight: 600 }}>
                        <span>Coupon Discount ({couponCode})</span>
                        <span>−₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    
                    <div style={{ height: '1px', background: 'var(--border)', margin: '12px 0' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <span>Subtotal</span>
                      <span>₹{finalSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {/* <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <span>GST (18%)</span>
                      <span>₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div> */}

                    {/* Coupon Question/Input */}
                    {!couponResult ? (
                      <div style={{ margin: '12px 0 16px' }}>
                        {!showCouponInput ? (
                          <button 
                            onClick={() => setShowCouponInput(true)}
                            style={{ background: 'none', border: 'none', color: '#ffc83c', fontSize: '0.85rem', fontWeight: 700, padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Do you have a coupon code?
                          </button>
                        ) : (
                          <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input 
                                type="text" 
                                value={couponCode} 
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                                placeholder="Enter coupon" 
                                style={{ ...inputStyle(''), padding: '6px 12px', fontSize: '0.85rem', flex: 1 }} 
                              />
                              <button 
                                onClick={handleApplyCoupon} 
                                disabled={applyingCoupon || !couponCode.trim()}
                                style={{ background: '#ffc83c', color: 'white', border: 'none', borderRadius: '6px', height: '34px', padding: '0 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                              >
                                {applyingCoupon ? '...' : 'Apply'}
                              </button>
                              <button 
                                onClick={() => { setShowCouponInput(false); setCouponCode(''); setCouponError(''); }}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                title="Cancel"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                            </div>
                            {couponError && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>{couponError}</p>}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ margin: '12px 0 16px', padding: '8px 12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 700 }}>Coupon Applied: {couponCode}</span>
                        <button onClick={() => setCouponResult(null)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Remove</button>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '1.25rem', fontWeight: 900 }}>
                      <span>Total Amount</span>
                      <span>₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>

                  </div>

                  <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(255,200,60,0.05)', borderRadius: '12px', border: '1px solid rgba(255,200,60,0.2)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <input 
                      type="checkbox" 
                      id="terms-agree"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#ffc83c', marginTop: '2px' }}
                    />
                    <label htmlFor="terms-agree" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', cursor: 'pointer' }}>
                      I have read and agree to the <a href="/terms" target="_blank" style={{ color: '#ffc83c', fontWeight: 700, textDecoration: 'underline' }} onClick={(e) => e.stopPropagation()}>Terms & Conditions</a>, <a href="/waiver" target="_blank" style={{ color: '#ffc83c', fontWeight: 700, textDecoration: 'underline' }} onClick={(e) => e.stopPropagation()}>Waiver</a>, <a href="/refund" target="_blank" style={{ color: '#ffc83c', fontWeight: 700, textDecoration: 'underline' }} onClick={(e) => e.stopPropagation()}>Refund Policy</a>, and <a href="/privacy-policy" target="_blank" style={{ color: '#ffc83c', fontWeight: 700, textDecoration: 'underline' }} onClick={(e) => e.stopPropagation()}>Privacy Policy</a>. I confirm that I am registering for myself and/or others with proper authorization and consent to RunnerX LLP processing personal data as outlined.
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', marginBottom: '32px' }}>
                    <button 
                      onClick={handleSubmit}
                      disabled={submitting || !agreedToTerms}
                      style={{ 
                        padding: '14px 40px', 
                        background: (submitting || !agreedToTerms) ? '#cbd5e1' : '#ffc83c', 
                        color: 'white', border: 'none', 
                        borderRadius: '12px', fontSize: '1.1rem', fontWeight: 900, 
                        cursor: (submitting || !agreedToTerms) ? 'not-allowed' : 'pointer', 
                        textTransform: 'uppercase', letterSpacing: '1px',
                        boxShadow: (submitting || !agreedToTerms) ? 'none' : '0 8px 20px rgba(255,200,60,0.3)',
                        transition: 'all 0.3s',
                        opacity: (submitting || !agreedToTerms) ? 0.7 : 1
                      }}
                      onMouseDown={(e) => !submitting && agreedToTerms && (e.currentTarget.style.transform = 'scale(0.98)')}
                      onMouseUp={(e) => !submitting && agreedToTerms && (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      {submitting ? 'Processing...' : 'Pay Now'}
                    </button>
                  </div>

                    {wantsToDonate && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.95rem', color: '#6366f1', fontWeight: 600 }}>
                        <span>Donation to Deepti Welfare Foundation</span>
                        <span>₹{donationAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}


                </>
              )}

              {/* ═══════════════ STEP 6: REDIRECTING ═══════════════ */}
              {!isVerifying && step === 6 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                  <div style={{ width: '64px', height: '64px', border: '4px solid #f3f3f3', borderTop: '4px solid #ffc83c', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '24px' }} />
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>Opening Payment Gateway</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 32px' }}>
                    Please complete your transaction in the secure Razorpay popup. Do not refresh this page.
                  </p>
                  
                  <div style={{ marginTop: '32px', textAlign: 'left' }}>
                    <button 
                      onClick={() => {
                        setRzpOptions(null);
                        setStep(5);
                      }} 
                      style={{ ...btnBack, marginBottom: 0 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                      Back to Review
                    </button>
                  </div>
                </div>
              )}

              {/* ═══════════════ STEP 7: SUCCESS ═══════════════ */}
              {!isVerifying && step === 7 && submitSuccess && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2.5rem', border: '3px solid #22c55e' }}>✓</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>You're Registered! 🎉</h2>
                  <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Your registration for <strong>{event.title}</strong> is confirmed.
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
                    Confirmation emails have been sent to all participants.
                  </p>

                  {/* Per-participant Registration IDs */}
                  {savedLineItems.length > 0 && (
                    <div style={{ maxWidth: '560px', margin: '0 auto 32px', textAlign: 'left' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Registration IDs</h3>
                      <div style={{ border: '2px solid #ffc83c', borderRadius: '12px', overflow: 'hidden' }}>
                        {savedLineItems.map((item, i) => (
                          <div key={item.lineItemId} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '14px 20px',
                            background: i % 2 === 0 ? 'var(--surface-alt)' : 'white',
                            borderBottom: i < savedLineItems.length - 1 ? '1px solid var(--border)' : 'none',
                          }}>
                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{item.participantName}</span>
                            <code style={{
                              background: 'rgba(255,200,60,0.15)', color: '#b8860b',
                              padding: '4px 12px', borderRadius: '6px',
                              fontWeight: 800, fontSize: '0.95rem', letterSpacing: '1px'
                            }}>{item.uniqueRegId}</code>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                        Save these IDs — they are your entry pass for race day.
                      </p>
                    </div>
                  )}

                  <div style={{ marginTop: '24px' }}>
                    <a 
                      href={(process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002') + '/dashboard/registrations'} 
                      className="btn"
                      style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-block' }}
                    >
                      Go to My Dashboard
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* ═══════════════ SIDEBAR ═══════════════ */}
            {/* <div className="registration-sidebar">
               
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>{event.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', gap: 8 }}><span>📅</span> {formattedEventDate}</div>
                  <div style={{ display: 'flex', gap: 8 }}><span>📍</span> {event.venue}, {event.city}</div>
                  <div style={{ display: 'flex', gap: 8 }}><span>🏃</span> {categories.length} Race Categories</div>
                </div>
              </div>

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
            </div> */}

          </div>
        </div>
      </section>

      {/* ═══════════════ SUMMARY CART BAR (In-Flow) ═══════════════ */}
      {step >= 2 && step <= 4 && (
        <div className="summary-cart-bar" style={{ 
          width: '100%', maxWidth: '850px', margin: '0px auto 60px',
          position: 'relative', zIndex: 100, background: '#ffc83c', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          {/* Dark Overlay for Breakdown */}
          {showBreakdown && (
            <div 
              onClick={() => setShowBreakdown(false)}
              style={{ 
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                background: 'rgba(0,0,0,0.6)', zIndex: 998,
                backdropFilter: 'blur(4px)'
              }} 
            />
          )}

          {/* Breakdown Popover */}
          {showBreakdown && (
            <div style={{ 
              position: 'absolute', bottom: 'calc(100% + 12px)', left: 0, right: 0,
              background: 'white', border: '2px solid #ffc83c',
              borderRadius: '20px', padding: '28px',
              boxShadow: '0 -15px 40px rgba(0,0,0,0.2)',
              zIndex: 999,
              display: 'flex', flexDirection: 'column', gap: '14px',
              animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <style>{`
                @keyframes slideUp {
                  from { transform: translateY(20px); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
                }
              `}</style>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', color: '#1a1a2e' }}>Price Breakdown</h4>
                <button onClick={() => setShowBreakdown(false)} style={{ background: '#f4f4f5', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span>Subtotal ({participants.length + (step === 3 ? 1 : 0)} items {wantsToDonate ? '+ Donation' : ''})</span>
                <span>₹{baseAmount.toLocaleString('en-IN')}</span>
              </div>
              
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#22c55e', fontWeight: 600 }}>
                  <span>Discount ({couponCode})</span>
                  <span>−₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              
              {/* <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                <span>GST (18%)</span>
                <span>₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div> */}
              
              <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 900 }}>
                <span>Total Amount</span>
                <span>₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}
          {submitError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', margin: '0 24px 16px 24px', color: '#dc2626', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {submitError}
            </div>
          )}

          {/* Main Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', minHeight: '80px', position: 'relative', zIndex: 1000 }} className="registration-btn-group">
            <div 
              onClick={() => setShowBreakdown(!showBreakdown)}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', color: 'white' }}
            >
              <div style={{ position: 'relative' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                {(participants.length + (step === 3 ? 1 : 0)) > 0 && (
                  <span style={{ 
                    position: 'absolute', top: '-8px', right: '-8px', 
                    background: '#1a1a2e', color: 'white', fontSize: '0.7rem', 
                    width: '18px', height: '18px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                  }}>
                    {participants.length + (step === 3 ? 1 : 0)}
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 900 }}>₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: showBreakdown ? 'rotate(180deg)' : 'none', transition: '0.3s' }}>
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </div>
            </div>

            <button 
              onClick={() => {
                if (step === 2) { if (validateDetails()) setStep(3); }
                else if (step === 3) { saveCurrentParticipant(); }
                else if (step === 4) { if (validateDonation()) setStep(5); }
                else if (step === 5) { handleSubmit(); }
              }}
              disabled={submitting || isSaving}
              style={{ 
                background: 'white', color: '#ffc83c', border: 'none', 
                padding: '10px 24px', borderRadius: '12px', fontSize: '1.1rem', 
                fontWeight: 800, cursor: (submitting || isSaving) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                opacity: (submitting || isSaving) ? 0.7 : 1,
              }}
            >
              {isSaving ? 'Saving...' : submitting ? 'Processing...' : (
                <>
                  {step === 5 ? 'Pay Now' : 'Continue'}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );

  // Edit Modal Component
  function EditParticipantModal() {
    if (!isEditModalOpen || !tempEditData) return null;

    const handleEditChange = (e) => {
      const { name, value } = e.target;
      setTempEditData(prev => ({ ...prev, [name]: value }));
    };

    const saveEdit = () => {
      // 1. Validate info (Reuse validateDetails logic but with tempEditData)
      const errs = {};
      if (!tempEditData.fullName.trim()) errs.fullName = 'Required';
      if (!tempEditData.email.trim()) errs.email = 'Required';
      if (!tempEditData.phone.trim()) errs.phone = 'Required';
      if (!tempEditData.tshirtSize) errs.tshirtSize = 'Required';
      if (tempEditData.wantsGround && (!tempEditData.emergencyName || !tempEditData.emergencyPhone)) {
        errs.emergency = 'Emergency contact required for ground race';
      }
      
      if (Object.keys(errs).length > 0) {
        setEditErrors(errs);
        return;
      }

      const updated = [...participants];
      updated[editingIdx] = { ...tempEditData };
      setParticipants(updated);
      setIsEditModalOpen(false);
    };

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
        <div style={{ background: 'white', width: '100%', maxWidth: '850px', maxHeight: '90vh', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
          <div style={{ padding: '20px 24px', background: '#ffc83c', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Edit Participant {editingIdx + 1}</h3>
            <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
          
          <div className="edit-modal-content" style={{ overflowY: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Section: Personal Info */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Personal Information</h4>
                <div className="registration-two-col">
                  <div>
                    <label className="registration-label" style={labelStyle}>Full Name *</label>
                    <input type="text" name="fullName" value={tempEditData.fullName} onChange={handleEditChange} className="registration-input" style={inputStyle('')} />
                    {editErrors.fullName && <p style={errorStyle}>{editErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="registration-label" style={labelStyle}>Email *</label>
                    <input type="email" name="email" value={tempEditData.email} onChange={handleEditChange} className="registration-input" style={inputStyle('')} />
                    {editErrors.email && <p style={errorStyle}>{editErrors.email}</p>}
                  </div>
                </div>
                <div className="registration-two-col" style={{ marginTop: '16px' }}>
                  <div>
                    <label className="registration-label" style={labelStyle}>Phone *</label>
                    <input type="tel" name="phone" value={tempEditData.phone} onChange={handleEditChange} className="registration-input" style={inputStyle('')} />
                    {editErrors.phone && <p style={errorStyle}>{editErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="registration-label" style={labelStyle}>Date of Birth *</label>
                    <input type="date" name="dob" value={tempEditData.dob} onChange={handleEditChange} className="registration-input" style={inputStyle('')} />
                  </div>
                </div>
                <div className="registration-two-col" style={{ marginTop: '16px' }}>
                  <div>
                    <label className="registration-label" style={labelStyle}>Gender</label>
                    <select name="gender" value={tempEditData.gender} onChange={handleEditChange} className="registration-input" style={inputStyle('')}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="registration-label" style={labelStyle}>T-Shirt Size *</label>
                    <select name="tshirtSize" value={tempEditData.tshirtSize} onChange={handleEditChange} className="registration-input" style={inputStyle('')}>
                      <option value="">Select Size</option>
                      <option value="XXS">XXS - 32 Inch</option>
                      <option value="XS">XS - 34 Inch</option>
                      <option value="S">S - 36 Inch</option>
                      <option value="M">M - 38 Inch</option>
                      <option value="L">L - 40 Inch</option>
                      <option value="XL">XL - 42 Inch</option>
                      <option value="XXL">XXL - 44 Inch</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Address */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Address</h4>
                <div className="registration-two-col">
                  <div>
                    <label className="registration-label" style={labelStyle}>Pin Code</label>
                    <input type="text" name="pinCode" value={tempEditData.pinCode} onChange={handleEditChange} className="registration-input" style={inputStyle('')} />
                  </div>
                  <div>
                    <label className="registration-label" style={labelStyle}>Country</label>
                    <input type="text" name="country" value={tempEditData.country} onChange={handleEditChange} className="registration-input" style={inputStyle('')} />
                  </div>
                </div>
                <div className="registration-two-col" style={{ marginTop: '16px' }}>
                  <div>
                    <label className="registration-label" style={labelStyle}>City</label>
                    <input type="text" name="city" value={tempEditData.city} onChange={handleEditChange} className="registration-input" style={inputStyle('')} />
                  </div>
                  <div>
                    <label className="registration-label" style={labelStyle}>State</label>
                    <input type="text" name="state" value={tempEditData.state} onChange={handleEditChange} className="registration-input" style={inputStyle('')} />
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <label className="registration-label" style={labelStyle}>Full Address</label>
                  <textarea name="address" value={tempEditData.address} onChange={handleEditChange} rows="2" style={{ ...inputStyle(''), resize: 'vertical' }} />
                </div>
              </div>

              {/* Section: Category */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Select Category</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  
                  {/* Ground Selection */}
                  <div style={{ padding: '20px', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>On-Ground Participation?</p>
                    <div style={{ display: 'flex', gap: '24px', marginBottom: (tempEditData.wantsGround || !!tempEditData.selectedCategoryId) ? '16px' : '0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" checked={tempEditData.wantsGround || !!tempEditData.selectedCategoryId} onChange={() => setTempEditData(p => ({ ...p, wantsGround: true }))} style={{ accentColor: '#ffc83c' }} /> Yes
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" checked={!(tempEditData.wantsGround || !!tempEditData.selectedCategoryId)} onChange={() => setTempEditData(p => ({ ...p, wantsGround: false, selectedCategoryId: '' }))} style={{ accentColor: '#ffc83c' }} /> No
                      </label>
                    </div>
                    {(tempEditData.wantsGround || !!tempEditData.selectedCategoryId) && (
                      <select 
                        value={tempEditData.selectedCategoryId} 
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          const ec = categories.find(c => c.id === id);
                          setTempEditData(p => ({ 
                            ...p, 
                            selectedCategoryId: id
                          }));
                        }} 
                        className="registration-input" style={inputStyle('')}
                      >
                        <option value="">— Choose Distance —</option>
                        {groundCategories.map(ec => {
                          const isFull = ec.maxParticipants && ec.registeredCount >= ec.maxParticipants;
                          return (
                            <option key={ec.id} value={ec.id} disabled={isFull}>
                              {getCategoryDisplayName(ec)} ({getCategoryDistance(ec)}) — ₹{ec.discountPrice || ec.price} {isFull ? '(FULL)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  {/* Virtual Selection */}
                  {virtualCategories.length > 0 && (
                    <div style={{ padding: '20px', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>Virtual Marathon Challenge?</p>
                      <div style={{ display: 'flex', gap: '24px', marginBottom: (tempEditData.wantsVirtual || !!tempEditData.virtualSubCategoryId) ? '16px' : '0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="radio" checked={tempEditData.wantsVirtual || !!tempEditData.virtualSubCategoryId} onChange={() => setTempEditData(p => ({ ...p, wantsVirtual: true, virtualParentCategoryId: virtualCategories[0]?.id || '' }))} style={{ accentColor: '#ffc83c' }} /> Yes
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="radio" checked={!(tempEditData.wantsVirtual || !!tempEditData.virtualSubCategoryId)} onChange={() => setTempEditData(p => ({ ...p, wantsVirtual: false, virtualSubCategoryId: '' }))} style={{ accentColor: '#ffc83c' }} /> No
                        </label>
                      </div>
                      {(tempEditData.wantsVirtual || !!tempEditData.virtualSubCategoryId) && (
                        <select 
                          value={tempEditData.virtualSubCategoryId} 
                          onChange={(e) => {
                            setTempEditData(p => ({ 
                              ...p, 
                              virtualSubCategoryId: e.target.value 
                            }));
                          }} 
                          className="registration-input" style={inputStyle('')}
                        >
                          <option value="">— Choose Distance —</option>
                          {Array.isArray(virtualCategories[0]?.virtualSettings) && virtualCategories[0].virtualSettings.map(sub => {
                            const subName = getVirtualCategoryName(sub.categoryName);
                            return (
                              <option key={sub.categoryId} value={sub.categoryId}>
                                {subName} (₹{sub.discountPrice ?? sub.price})
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </div>
                  )}

                </div>
              </div>

              {/* Section: Emergency */}
              {tempEditData.wantsGround && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Emergency Contact</h4>
                  <div className="registration-two-col">
                    <div>
                      <label className="registration-label" style={labelStyle}>Contact Name *</label>
                      <input type="text" name="emergencyName" value={tempEditData.emergencyName} onChange={handleEditChange} className="registration-input" style={inputStyle('')} />
                      {editErrors.emergency && <p style={errorStyle}>{editErrors.emergency}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}>Contact Phone *</label>
                      <input type="tel" name="emergencyPhone" value={tempEditData.emergencyPhone} onChange={handleEditChange} style={inputStyle('')} />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div style={{ padding: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--surface-alt)' }}>
            <button onClick={() => setIsEditModalOpen(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button onClick={saveEdit} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#ffc83c', color: 'white', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,200,60,0.3)' }}>Save Changes</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {renderContent()}
      {EditParticipantModal()}
    </>
  );
}
