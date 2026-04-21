'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

export default function CouponPage() {
  const [activeTab, setActiveTab] = useState('get'); // 'get' or 'my'
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '2px', background: 'var(--border)', borderRadius: '10px', padding: '3px' }}>
        <button
          onClick={() => setActiveTab('get')}
          style={{
            flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.15s',
            background: activeTab === 'get' ? 'white' : 'transparent',
            color: activeTab === 'get' ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'get' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          Get a Coupon
        </button>
        <button
          onClick={() => setActiveTab('my')}
          style={{
            flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.15s',
            background: activeTab === 'my' ? 'white' : 'transparent',
            color: activeTab === 'my' ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'my' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          My Coupons
        </button>
      </div>

      {activeTab === 'get' && <GetCouponSection />}
      {activeTab === 'my' && <MyCouponsSection />}
    </div>
  );
}

function GetCouponSection() {
  return (
    <>
      {/* Hero */}
      <div className="card" style={{
        padding: '40px 32px', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(14,165,233,0.04), rgba(34,197,94,0.04))',
        borderTop: '4px solid var(--primary)',
      }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
          Buy Entries for Your Team, Group, or Others
        </h1>
        <p style={{
          color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', fontSize: '1rem', lineHeight: 1.7,
        }}>
          Buy multiple race entries in one go and share them with your team, friends, or participants.
          Each person can register individually using your coupon, without making any payment.
        </p>
      </div>

      {/* Feature cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>👥</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>For Teams</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Perfect for corporate teams, clubs, and groups
          </p>
        </div>
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📦</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>Bulk Entries</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Buy once and distribute easily
          </p>
        </div>
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎁</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>Gift & Share</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Buy a race entry for someone and share it with them
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '20px', textAlign: 'center' }}>
          How It Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { step: 1, title: 'Buy Entries', desc: 'Select the number of entries you want and complete the payment.' },
            { step: 2, title: 'Get Coupons', desc: "You'll receive a unique coupon code instantly." },
            { step: 3, title: 'Share with Participants', desc: 'Send the coupon code to your team, friends, or anyone you choose.' },
            { step: 4, title: 'They Register', desc: 'Each person uses the coupon code during registration and joins the race without paying.' },
          ].map(item => (
            <div key={item.step} style={{ textAlign: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 700, margin: '0 auto 10px',
              }}>
                {item.step}
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{item.title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Buy Entries CTA */}
      <div style={{ textAlign: 'center' }}>
        <button
          className="btn btn-primary"
          style={{
            padding: '16px 48px', fontSize: '1.1rem', fontWeight: 700,
            boxShadow: '0 4px 12px rgba(11,110,79,0.25)',
          }}
          onClick={() => alert('Bulk coupon purchase flow coming soon! This feature requires full payment gateway integration.')}
        >
          Buy Entries
        </button>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>
          You can buy up to 1,000 entries at once. Coupon codes are valid until the last day of online registration.
        </p>
      </div>
    </>
  );
}

function MyCouponsSection() {
  // Placeholder — coupons will be loaded from API once backend is fully integrated
  return (
    <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎟️</div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
        No Coupons Yet
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 420, margin: '0 auto 20px' }}>
        Once you purchase bulk entries, your coupon codes will appear here. You can share them, track their usage, and manage allocation.
      </p>
      <div style={{
        padding: '16px', background: 'var(--surface-alt)', borderRadius: '10px',
        border: '1px solid var(--border)', maxWidth: 400, margin: '0 auto',
        fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--text)' }}>What you'll see here:</strong><br />
        • Coupon Code & Event Logo<br />
        • Usage count & Expiry date<br />
        • Share (WhatsApp, Email) & Manage options<br />
        • Which email addresses have used the code
      </div>
    </div>
  );
}
