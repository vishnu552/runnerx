'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { getInfoSections } from '@/lib/api';

const fallbackPolicies = [
  {
    heading: 'Privacy Policy',
    content: `We collect personal information necessary for race registration, including name, email, phone number, date of birth, and address details. Your data is used exclusively for event management, communication regarding the marathon, and improving our services.\n\nWe implement industry-standard security measures to protect your personal information. Your data will never be sold to third parties. We may share limited information with event partners (e.g., timing companies, medical teams) solely for event operations.\n\nYou have the right to access, correct, or delete your personal data at any time through your dashboard profile settings.`,
  },
  {
    heading: 'Terms & Conditions',
    content: `By registering for any RunnerX event, you agree to abide by the rules and regulations set forth by the organizers.\n\nParticipants must be in good health and physically fit to participate. We recommend consulting a physician before registering. The organizers reserve the right to modify the event schedule, route, or cancel the event due to unforeseen circumstances.\n\nAll participants must carry a valid government-issued ID on race day. Failure to present identification may result in disqualification. Bib numbers are non-transferable and must be worn visibly during the race.`,
  },
  {
    heading: 'Refund & Cancellation Policy',
    content: `Registration fees are non-refundable unless the event is cancelled by the organizers. In case of event cancellation, a full refund will be processed within 15 business days.\n\nCategory upgrades are allowed until the upgrade deadline (typically 10 days before the event). When upgrading, the price difference must be paid. No refund is issued for category downgrades.\n\nBulk coupon purchases are non-refundable. Unused coupons expire on the last day of online registration for the associated event.`,
  },
  {
    heading: 'Cookie Policy',
    content: `We use essential cookies to maintain your session and provide a smooth experience. Authentication cookies are stored securely (HTTP-only) and persist for 7 days.\n\nWe do not use advertising or third-party tracking cookies. Analytics cookies, if used, collect anonymized data to help us improve the website experience.`,
  },
  {
    heading: 'Donation & Tax Exemption Policy',
    content: `Donations made through the RunnerX platform are directed to registered NGOs and charitable organizations. A tax exemption certificate (Section 80G) will be provided upon request if valid PAN details are submitted during the donation.\n\nDonation amounts are non-refundable. Tax certificates are generated within 30 days of the donation and sent to the registered email address.`,
  },
];

export default function PolicyPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPolicies() {
      try {
        const sections = await getInfoSections('POLICY');
        if (sections && sections.length > 0) {
          setPolicies(sections);
        } else {
          setPolicies(fallbackPolicies);
        }
      } catch (error) {
        console.error('Failed to fetch policies:', error);
        setPolicies(fallbackPolicies);
      } finally {
        setLoading(false);
      }
    }
    fetchPolicies();
  }, []);

  const togglePolicy = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading policies...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700,
          color: 'var(--text)', marginBottom: '8px', textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          Policy
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Please review our policies below. Click on any section to expand.
        </p>
      </div>

      {/* Policy accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {policies.map((policy, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={policy.id || index}
              className="card"
              style={{
                border: '1px solid var(--border)', borderRadius: '10px',
                overflow: 'hidden',
                borderLeft: isOpen ? '4px solid var(--primary)' : '4px solid transparent',
                transition: 'border-color 0.2s',
              }}
            >
              <button
                onClick={() => togglePolicy(index)}
                style={{
                  width: '100%', padding: '18px 20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  fontSize: '1rem', fontWeight: 600,
                  color: isOpen ? 'var(--primary)' : 'var(--text)',
                }}>
                  {policy.heading || policy.title}
                </span>
                <svg
                  width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke={isOpen ? 'var(--primary)' : 'var(--text-muted)'}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {isOpen && (
                <div style={{
                  padding: '0 20px 20px',
                  borderTop: '1px solid var(--border)',
                }}>
                  <p style={{
                    fontSize: '0.9rem', color: 'var(--text-secondary)',
                    lineHeight: 1.8, paddingTop: '16px', whiteSpace: 'pre-wrap',
                  }}>
                    {policy.content}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
