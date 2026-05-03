'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! Taking you to login...');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
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
  }, [token, router]);

  return (
    <section className="section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: '80px', paddingBottom: '40px' }}>
      <div className="container" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          {status === 'verifying' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '3rem' }}>⏳</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
                Verifying Email
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                {message}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.15)', margin: '0 auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  ✓
                </div>
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
                Verified!
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                {message}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)', margin: '0 auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  ✗
                </div>
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
                Verification Failed
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
                {message}
              </p>
              <button onClick={() => router.push('/login')} className="btn btn-primary" style={{ width: '100%' }}>
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
