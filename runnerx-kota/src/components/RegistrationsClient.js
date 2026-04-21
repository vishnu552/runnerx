'use client';

import { useState } from 'react';
import { authenticatedFetch } from '@/lib/api';

export default function RegistrationsClient({ registrations: initialRegistrations }) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [activeTab, setActiveTab] = useState(null); // 'view' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const openModal = (type, item) => {
    setActiveTab(type);
    setSelectedItem(item);
    if (type === 'edit') {
      setFormData({
        participantName: item.participantName || '',
        participantEmail: item.participantEmail || '',
        participantPhone: item.participantPhone || '',
        participantGender: item.participantGender || '',
        participantDob: item.participantDob ? item.participantDob.split('T')[0] : '',
        participantCity: item.participantCity || '',
        participantState: item.participantState || '',
        participantPinCode: item.participantPinCode || '',
        participantAddress: item.participantAddress || '',
        tshirtSize: item.tshirtSize || '',
      });
    }
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setActiveTab(null);
    setSelectedItem(null);
    setMessage(null);
    document.body.style.overflow = 'auto';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: 'info', text: 'Saving changes...' });

    try {
      const res = await authenticatedFetch(`/api/auth/registrations/line-item/${selectedItem.id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Details updated successfully!' });
        
        // Update local state
        const updatedRegistrations = registrations.map(reg => ({
          ...reg,
          lineItems: reg.lineItems.map(li => 
            li.id === selectedItem.id ? { ...li, ...formData, participantDob: formData.participantDob + 'T00:00:00.000Z' } : li
          )
        }));
        setRegistrations(updatedRegistrations);
        
        setTimeout(() => closeModal(), 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {registrations.map((reg) => {
          const isExpired = new Date() > new Date(reg.event.registrationEnd);
          
          return (
            <div
              key={reg.id}
              className="card"
              style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)', borderRadius: '12px' }}
            >
              {/* Card Header */}
              <div style={{
                padding: '16px 20px',
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                    {reg.eventTitleSnapshot}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>📅 {new Date(reg.eventDateSnapshot).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>🕐 Registered {new Date(reg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '14px',
                    background: reg.status === 'CONFIRMED' ? 'rgba(34,197,94,0.1)' : reg.status === 'CANCELLED' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                    color: reg.status === 'CONFIRMED' ? '#22c55e' : reg.status === 'CANCELLED' ? '#ef4444' : '#eab308',
                    border: `1px solid ${reg.status === 'CONFIRMED' ? 'rgba(34,197,94,0.3)' : reg.status === 'CANCELLED' ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)'}`,
                  }}>
                    {reg.status}
                  </span>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '14px',
                    background: reg.paymentStatus === 'PAID' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                    color: reg.paymentStatus === 'PAID' ? '#22c55e' : '#eab308',
                    border: `1px solid ${reg.paymentStatus === 'PAID' ? 'rgba(34,197,94,0.3)' : 'rgba(234,179,8,0.3)'}`,
                  }}>
                    {reg.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Participants */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reg.lineItems.map((li) => (
                    <div
                      key={li.id}
                      style={{
                        padding: '16px', borderRadius: '8px',
                        background: 'var(--surface-alt)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #00a0ff, #00a0ff)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1rem', fontWeight: 700, flexShrink: 0,
                          }}>
                            {li.participantName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                                {li.participantName}
                              </span>
                              {li.isRegistrant && (
                                <span style={{
                                  fontSize: '0.65rem', color: '#00a0ff', background: 'rgba(30,64,175,0.08)',
                                  padding: '1px 6px', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase'
                                }}>You</span>
                              )}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {li.participantEmail} • {li.participantPhone}
                            </p>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                           <button 
                             onClick={() => openModal('view', li)}
                             style={{
                               padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                               background: 'white', border: '1px solid var(--border)', color: 'var(--text)',
                               cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                             }}
                           >
                             👁 View Detail
                           </button>
                           {!isExpired && (
                             <button 
                               onClick={() => openModal('edit', li)}
                               style={{
                                 padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700,
                                 background: '#00a0ff', border: '1px solid #00a0ff', color: 'white',
                                 cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                               }}
                             >
                               ✎ Edit Detail
                             </button>
                           )}
                           {isExpired && (
                              <div style={{ padding: '8px 4px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, italic: 'true' }}>
                                Registration closed
                              </div>
                           )}
                        </div>
                      </div>

                      <div style={{ 
                        marginTop: '12px', paddingTop: '12px', borderTop: '1px dotted var(--border)',
                        display: 'flex', gap: '20px' 
                      }}>
                        <div>
                          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Category</p>
                          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{li.categoryNameSnapshot}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>T-Shirt Size</p>
                          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{li.tshirtSize || '—'}</p>
                        </div>
                        {li.bibNumber && (
                           <div>
                            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>BIB Number</p>
                            <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#00a0ff' }}>{li.bibNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Registration Total */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Order Total: ₹{reg.finalAmount?.toLocaleString('en-IN')}
                    {reg.couponCode && <span className="ml-2">(Discount applied)</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Order ID: #{reg.orderId || reg.id}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Overlay */}
      {activeTab && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'white', width: '100%', maxWidth: '600px',
            borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ 
              padding: '20px 24px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, textTransform: 'uppercase', fontStyle: 'italic', fontFamily: 'var(--font-heading)' }}>
                {activeTab === 'view' ? 'Participant Details' : 'Edit Participant Info'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto' }}>
              {activeTab === 'view' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <DetailItem label="Full Name" value={selectedItem.participantName} />
                  <DetailItem label="Email" value={selectedItem.participantEmail} />
                  <DetailItem label="Phone" value={selectedItem.participantPhone} />
                  <DetailItem label="Gender" value={selectedItem.participantGender} />
                  <DetailItem label="Date of Birth" value={selectedItem.participantDob ? new Date(selectedItem.participantDob).toLocaleDateString('en-IN') : '—'} />
                  <DetailItem label="T-Shirt Size" value={selectedItem.tshirtSize} />
                  <div style={{ gridColumn: 'span 2' }}>
                    <DetailItem label="Address" value={`${selectedItem.participantAddress || ''}, ${selectedItem.participantCity || ''}, ${selectedItem.participantState || ''} - ${selectedItem.participantPinCode || ''}`} />
                  </div>
                </div>
              ) : (
                <form id="edit-form" onSubmit={handleUpdate} className="space-y-4">
                  {message && (
                    <div style={{ 
                      padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem',
                      background: message.type === 'error' ? '#fee2e2' : message.type === 'success' ? '#dcfce7' : '#e0f2fe',
                      color: message.type === 'error' ? '#b91c1c' : message.type === 'success' ? '#15803d' : '#0369a1',
                      border: `1px solid ${message.type === 'error' ? '#fecaca' : message.type === 'success' ? '#bbf7d0' : '#bae6fd'}`
                    }}>
                      {message.text}
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <InputGroup label="Name" name="participantName" value={formData.participantName} onChange={handleInputChange} required />
                    <InputGroup label="Email" name="participantEmail" value={formData.participantEmail} onChange={handleInputChange} required type="email" />
                    <InputGroup label="Phone" name="participantPhone" value={formData.participantPhone} onChange={handleInputChange} required />
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-muted)' }}>Gender</label>
                      <select name="participantGender" value={formData.participantGender} onChange={handleInputChange} className="form-input w-full" style={{ padding: '10px' }} required>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <InputGroup label="Date of Birth" name="participantDob" value={formData.participantDob} onChange={handleInputChange} required type="date" />
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-muted)' }}>T-Shirt Size</label>
                      <select name="tshirtSize" value={formData.tshirtSize} onChange={handleInputChange} className="form-input w-full" style={{ padding: '10px' }} required>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                    <InputGroup label="City" name="participantCity" value={formData.participantCity} onChange={handleInputChange} />
                    <InputGroup label="State" name="participantState" value={formData.participantState} onChange={handleInputChange} />
                    <InputGroup label="Pin Code" name="participantPinCode" value={formData.participantPinCode} onChange={handleInputChange} />
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-muted)' }}>Full Address</label>
                    <textarea name="participantAddress" value={formData.participantAddress} onChange={handleInputChange} className="form-input w-full" rows={3} style={{ padding: '10px' }} />
                  </div>
                </form>
              )}
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={closeModal} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
              {activeTab === 'edit' && (
                <button 
                  form="edit-form"
                  disabled={saving}
                  style={{ 
                    padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#1E40AF', 
                    color: 'white', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>{value || '—'}</p>
    </div>
  );
}

function InputGroup({ label, name, value, onChange, required = false, type = "text" }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-muted)' }}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="form-input w-full"
        style={{ padding: '10px', fontSize: '0.95rem' }}
      />
    </div>
  );
}
