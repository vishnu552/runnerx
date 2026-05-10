'use client';

import { Suspense, useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { forgotPasswordUser } from '@/app/lib/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary"
      style={{ width: '100%', marginTop: '8px' }}
      disabled={pending}
    >
      {pending ? 'Sending...' : 'Send Reset Link →'}
    </button>
  );
}

const initialState = {
  error: null,
  success: false,
  message: null,
  debugToken: null,
  fieldErrors: null,
};

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin') || '';

  const [state, formAction] = useActionState(forgotPasswordUser, initialState);
  const [email, setEmail] = useState('');

  const loginHref = origin ? `/login?origin=${origin}` : '/login';

  return (
    <section
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        paddingTop: '40px',
        paddingBottom: '40px',
      }}
    >
      <div className="container" style={{ maxWidth: '480px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.8rem',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              fontStyle: 'italic',
              letterSpacing: '0.04em',
            }}
          >
            Reset Password
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Enter your email to receive a secure password reset link.
          </p>
        </div>

        <div className="card" style={{ padding: '32px', borderRadius: '20px' }}>
          {state?.success && state?.message && (
            <div
              style={{
                padding: '14px',
                background: 'rgba(76, 175, 80, 0.1)',
                color: '#2e7d32',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '0.9rem',
                border: '1px solid rgba(76, 175, 80, 0.2)',
              }}
            >
              <p style={{ fontWeight: 500, marginBottom: 0 }}>{state.message}</p>
              {state.debugToken && (
                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(76, 175, 80, 0.25)',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--text-muted)',
                      marginBottom: '6px',
                      fontWeight: 700,
                    }}
                  >
                    Development Only:
                  </p>
                  <Link
                    href={`/auth/reset-password?token=${state.debugToken}${origin ? `&origin=${origin}` : ''}`}
                    style={{
                      color: 'var(--primary)',
                      fontWeight: 700,
                      textDecoration: 'underline',
                      wordBreak: 'break-all',
                    }}
                  >
                    Click here to reset password
                  </Link>
                </div>
              )}
            </div>
          )}

          {state?.error && !state?.fieldErrors && (
            <div
              style={{
                padding: '12px',
                background: 'rgba(229, 57, 53, 0.1)',
                color: '#ef4444',
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '0.9rem',
                border: '1px solid rgba(229, 57, 53, 0.2)',
              }}
            >
              {state.error}
            </div>
          )}

          {!state?.success && (
            <form action={formAction}>
              <div className="form-group">
                <label className="form-label" htmlFor="reset-email">
                  Email Address
                </label>
                <input
                  className="form-input"
                  type="email"
                  id="reset-email"
                  name="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {state?.fieldErrors?.email && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                    {state.fieldErrors.email[0]}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px' }}>
                <SubmitButton />
              </div>
            </form>
          )}

          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
            }}
          >
            <Link
              href={loginHref}
              style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}
            >
              Remember your password?{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>
                Back to Login
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ForgotPasswordFallback() {
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

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordFallback />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
