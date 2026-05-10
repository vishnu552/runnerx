'use client';

import { Suspense, useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordUser } from '@/app/lib/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary"
      style={{ width: '100%', marginTop: '8px' }}
      disabled={pending}
    >
      {pending ? 'Updating...' : 'Reset Password →'}
    </button>
  );
}

const initialState = {
  error: null,
  success: false,
  message: null,
  redirect: null,
  fieldErrors: null,
};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const origin = searchParams.get('origin') || '';

  const [state, formAction] = useActionState(resetPasswordUser, initialState);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (state?.success && state?.redirect) {
      const t = setTimeout(() => router.push(state.redirect), 3000);
      return () => clearTimeout(t);
    }
  }, [state, router]);

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
            Create New Password
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Choose a secure password to regain access to your RunnerX account.
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
              {state.message} Redirecting to login...
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

          {!token && !state?.error && (
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
              Invalid or missing reset token.
            </div>
          )}

          {!state?.success && token && (
            <form action={formAction}>
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="origin" value={origin} />

              <div className="form-group">
                <label className="form-label" htmlFor="new-password">
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={showPass ? 'text' : 'password'}
                    id="new-password"
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
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {state?.fieldErrors?.password && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                    {state.fieldErrors.password[0]}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={showConfirm ? 'text' : 'password'}
                    id="confirm-password"
                    name="confirmPassword"
                    placeholder="Repeat your password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingRight: '45px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {state?.fieldErrors?.confirmPassword && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                    {state.fieldErrors.confirmPassword[0]}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '24px' }}>
                <SubmitButton />
              </div>
            </form>
          )}

          {!token && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                No valid reset token found. Please request a new link.
              </p>
              <Link
                href={`/auth/forgot-password${origin ? `?origin=${origin}` : ''}`}
                className="btn btn-primary"
                style={{ display: 'inline-block' }}
              >
                Go to Forgot Password
              </Link>
            </div>
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
              Change your mind?{' '}
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

function ResetPasswordFallback() {
  return (
    <section
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <div style={{ color: 'var(--text-muted)' }}>Verifying session...</div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );
}
