'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_URL } from '@/app/lib/api';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const origin = searchParams.get('origin') || '';
  const router = useRouter();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    const loginHref = origin ? `/login?origin=${origin}` : '/login';

    const verifyEmail = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! Taking you to login...');
          setTimeout(() => router.push(loginHref), 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link might be invalid or expired.');
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
      }
    };

    verifyEmail();
  }, [token, origin, router]);

  const loginHref = origin ? `/login?origin=${origin}` : '/login';

  return (
    <section
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        paddingTop: '80px',
        paddingBottom: '80px',
      }}
    >
      <div className="container" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="card" style={{ padding: '40px', textAlign: 'center', borderRadius: '20px' }}>
          {status === 'verifying' && (
            <>
              <div style={{ marginBottom: '20px', fontSize: '3rem' }}>⏳</div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text)',
                }}
              >
                Verifying Email
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.15)',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                }}
              >
                ✓
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text)',
                }}
              >
                Verified!
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                }}
              >
                ✗
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text)',
                }}
              >
                Verification Failed
              </h2>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  marginTop: '8px',
                  marginBottom: '24px',
                }}
              >
                {message}
              </p>
              <button
                onClick={() => router.push(loginHref)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function VerifyFallback() {
  return (
    <section
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
    </section>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyContent />
    </Suspense>
  );
}
