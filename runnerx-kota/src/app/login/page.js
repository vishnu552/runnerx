'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useState, useEffect, useRef } from 'react';
import { unifiedAuth, checkUserStatus } from '@/lib/actions';
import Link from 'next/link';

function SubmitButton({ label }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={pending}>
      {pending ? 'Please wait...' : label}
    </button>
  );
}

const initialState = {
  error: null,
  success: false,
  redirect: null,
};

export default function LoginPage() {
  const [state, formAction] = useActionState(unifiedAuth, initialState);
  const [email, setEmail] = useState('');
  const [userExists, setUserExists] = useState(null); // null: not checked, true: exists, false: new
  const [checking, setChecking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const blurTimeoutRef = useRef(null);

  // Clear existence state if email changes significantly
  useEffect(() => {
    if (userExists !== null) {
      setUserExists(null);
    }
  }, [email]);

  async function handleCheckUser() {
    if (!email || !email.includes('@') || email.length < 5) return;
    
    setChecking(true);
    try {
      const result = await checkUserStatus(email);
      setUserExists(result.exists);
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  }

  const onBlur = () => {
    // Small delay to ensure we don't check if user clicked something else immediately
    blurTimeoutRef.current = setTimeout(handleCheckUser, 200);
  };

  const onFocus = () => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
  };

  return (
    <>
      <section className="section" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '100vh', paddingTop: '160px', paddingBottom: '80px' }}>
        <div className="container" style={{ maxWidth: '480px', width: '100%' }}>
          <div className="card" style={{ padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Link href="/">
                <img 
                  src="/images/runnerx-logo.png" 
                  alt="RunnerX Logo" 
                  style={{ height: '80px', width: 'auto', margin: '0 auto', display: 'block' }}
                />
              </Link>
            </div>

            {state?.error && !state?.fieldErrors && (
              <div style={{ padding: '12px', background: 'rgba(229, 57, 53, 0.1)', color: '#ef4444', borderRadius: '4px', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid rgba(229, 57, 53, 0.2)' }}>
                {state.error}
              </div>
            )}

            {state?.success && (
              <div style={{ padding: '16px', background: 'rgba(76, 175, 80, 0.1)', color: '#2e7d32', borderRadius: '8px', marginBottom: '24px', fontSize: '0.95rem', border: '1px solid rgba(76, 175, 80, 0.2)', textAlign: 'center' }}>
                {state.message}
              </div>
            )}

            {!state?.success && (
              <form className="contact-form" action={formAction}>
                <input type="hidden" name="auth_mode" value={userExists === false ? 'register' : 'login'} />
                
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-email">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="form-input"
                      type="email"
                      id="auth-email"
                      name="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={onBlur}
                      onFocus={onFocus}
                      required
                    />
                    {checking && (
                      <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                        <div className="loader-mini" />
                      </div>
                    )}
                  </div>
                  {state?.fieldErrors?.email && (
                    <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                      {state.fieldErrors.email[0]}
                    </div>
                  )}
                </div>

                {/* Login Flow */}
                {userExists === true && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <label className="form-label" htmlFor="auth-password">Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          className="form-input"
                          type={showPassword ? 'text' : 'password'}
                          id="auth-password"
                          name="password"
                          placeholder="Your password"
                          required
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
                      {state?.fieldErrors?.password && (
                        <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                          {state.fieldErrors.password[0]}
                        </div>
                      )}
                      <div style={{ textAlign: 'right', marginTop: '10px' }}>
                        <Link href="/auth/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                    <SubmitButton label="Sign In" />
                  </div>
                )}

                {/* Register Flow */}
                {userExists === false && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label" htmlFor="auth-name">Full Name</label>
                      <input
                        className="form-input"
                        type="text"
                        id="auth-name"
                        name="name"
                        placeholder="John Doe"
                        required
                      />
                      {state?.fieldErrors?.name && (
                        <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                          {state.fieldErrors.name[0]}
                        </div>
                      )}
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label" htmlFor="auth-phone">Mobile Number</label>
                      <input
                        className="form-input"
                        type="tel"
                        id="auth-phone"
                        name="phone"
                        placeholder="10-digit mobile number"
                        required
                        maxLength={10}
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        }}
                      />
                      {state?.fieldErrors?.phone && (
                        <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                          {state.fieldErrors.phone[0]}
                        </div>
                      )}
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label" htmlFor="auth-reg-password">Create Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          className="form-input"
                          type={showPassword ? 'text' : 'password'}
                          id="auth-reg-password"
                          name="password"
                          placeholder="Min. 6 characters"
                          required
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
                      {state?.fieldErrors?.password && (
                        <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                          {state.fieldErrors.password[0]}
                        </div>
                      )}
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: '20px 0' }}>
                      By registering, you agree to our <Link href="/terms" style={{ textDecoration: 'underline' }}>Terms</Link> and <Link href="/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>.
                    </p>
                    
                    <SubmitButton label="Sign Up" />
                  </div>
                )}

                {userExists === null && (
                  <div style={{ marginTop: '24px' }}>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                      onClick={handleCheckUser}
                      disabled={checking || !email.includes('@')}
                    >
                      {checking ? 'Checking...' : 'Continue'}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        .loader-mini {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0,0,0,0.1);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-in {
          animation-duration: 0.3s;
          animation-fill-mode: forwards;
        }
        .fade-in {
          animation-name: fadeIn;
        }
        .slide-in-from-top-2 {
          animation-name: slideInFromTop;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInFromTop {
          from { transform: translateY(-8px); }
          to { transform: translateY(0); }
        }
      `}</style>
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
