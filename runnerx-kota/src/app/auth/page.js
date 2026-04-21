'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useState } from 'react';
import { authUser } from '@/lib/actions';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={pending}>
      {pending ? 'Please wait...' : 'Get Started →'}
    </button>
  );
}

const initialState = {
  error: null,
  success: false,
  action: null,
  message: null,
  redirect: null,
};

export default function AuthPage() {
  const [state, formAction] = useActionState(authUser, initialState);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state?.redirect) {
      if (state.action === 'register') {
        setShowSuccess(true);
        setTimeout(() => {
          router.push(state.redirect);
          router.refresh();
        }, 1500);
      } else {
        router.push(state.redirect);
        router.refresh();
      }
    }
  }, [state, router]);

  return (
    <>
      <section className="page-hero" style={{ paddingBottom: '40px' }}>
        <div className="container">
          <h1 className="page-hero-title">RunnerX Account</h1>
          <p className="page-hero-subtitle">
            Enter your email and password to login or create an account instantly.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <div className="card" style={{ padding: '40px' }}>
            {showSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.15)', margin: '0 auto 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  ✓
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-heading)', fontSize: '1.5rem',
                  fontWeight: 700, color: 'var(--text)', marginBottom: '8px'
                }}>
                  Account Created!
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Welcome to RunnerX. Taking you to your dashboard...
                </p>
              </div>
            ) : (
              <>
                <h2 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: '8px',
                  textAlign: 'center',
                }}>
                  Login or Create Account
                </h2>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  marginBottom: '32px',
                }}>
                  One form. If you have an account, you&apos;ll be logged in. Otherwise, we&apos;ll create one for you.
                </p>

                {state?.error && (
                  <div style={{ padding: '12px', background: 'rgba(229, 57, 53, 0.1)', color: 'var(--primary)', borderRadius: '4px', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid rgba(229, 57, 53, 0.2)' }}>
                    {state.error}
                  </div>
                )}

                <form className="contact-form" action={formAction}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="auth-email">Email Address</label>
                    <input
                      className="form-input"
                      type="email"
                      id="auth-email"
                      name="email"
                      placeholder="you@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label" htmlFor="auth-password">Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="form-input"
                        type={showPassword ? 'text' : 'password'}
                        id="auth-password"
                        name="password"
                        placeholder="Minimum 6 characters"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ paddingRight: '45px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '6px' }}>
                      <a href="/auth/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500 }}>
                        Forgot password?
                      </a>
                    </div>
                  </div>

                  <SubmitButton />
                </form>

                <div style={{
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid var(--border-light)',
                  textAlign: 'center',
                }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    By continuing, you agree to our{' '}
                    <a href="/terms" style={{ color: 'var(--primary)', fontWeight: 500 }}>Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy-policy" style={{ color: 'var(--primary)', fontWeight: 500 }}>Privacy Policy</a>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
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
