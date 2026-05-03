'use client';

import { ORIGIN_COOKIE_NAME } from '@/app/lib/constants';
import { SITE_CONFIG } from '@/app/lib/origin';
import { useEffect, useState } from 'react';

/**
 * Login fallback page.
 * If a user navigates directly to the dashboard site without going through
 * a city site, this page shows them links to log in on each city site.
 * 
 * In the future, this will be replaced with a proper login form.
 */
export default function LoginFallbackPage() {
  const [sites] = useState(Object.values(SITE_CONFIG));

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '24px',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '48px 40px',
        maxWidth: '480px', width: '100%', textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      }}>
        {/* Logo */}
        <h1 style={{
          fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em',
          marginBottom: '8px', fontStyle: 'italic',
        }}>
          RUNNER<span style={{ color: '#00a0ff' }}>X</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '32px', lineHeight: 1.6 }}>
          Please log in through one of our event sites to access your dashboard.
        </p>

        {/* City site links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sites.map((site) => (
            <a
              key={site.code}
              href={`${site.url}/login`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '16px 24px', borderRadius: '12px',
                border: '1px solid #e2e8f0', background: '#f8fafc',
                textDecoration: 'none', color: '#0f172a',
                fontSize: '1rem', fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#00a0ff';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = '#00a0ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.color = '#0f172a';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              🏃 {site.fullName}
            </a>
          ))}
        </div>

        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '32px' }}>
          Your dashboard is shared across all RunnerX events.
        </p>
      </div>
    </div>
  );
}
