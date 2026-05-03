'use client';

import { useState, useEffect, Suspense, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordUser } from '@/lib/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      className="w-full bg-[#00a0ff] hover:bg-[#136a8a] text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-100 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider italic flex items-center justify-center gap-2"
      disabled={pending}
    >
      {pending ? (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          Updating...
        </>
      ) : 'Reset Password →'}
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
  const [state, formAction] = useActionState(resetPasswordUser, initialState);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (state?.success && state?.redirect) {
      setTimeout(() => {
        router.push(state.redirect);
      }, 3000);
    }
  }, [state, router]);

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-8 md:p-10 w-full relative overflow-hidden">
      {/* Subtle accent line */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#00a0ff]"></div>

      <h2 className="text-xl font-bold text-slate-900 mb-6 text-center italic uppercase font-roboto-condensed">
        Set New Password
      </h2>

      {state?.success && state?.message && (
        <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg mb-6 text-sm font-medium">
          {state.message} Redirecting to login...
        </div>
      )}

      {state?.error && !state?.fieldErrors && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg mb-6 text-sm font-medium">
          {state.error}
        </div>
      )}

      {!token && !state?.error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg mb-6 text-sm font-medium">
          Invalid or missing reset token.
        </div>
      )}

      {!state?.success && token && (
        <form className="space-y-6" action={formAction}>
          <input type="hidden" name="token" value={token} />
          
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 italic" htmlFor="new-password">
              New Password
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#00a0ff] focus:border-[#00a0ff] transition-all bg-slate-50 text-slate-900 pr-12"
                type={showPass ? 'text' : 'password'}
                id="new-password"
                name="password"
                placeholder="Minimum 6 characters"
                // required
                // minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                onClick={() => setShowPass(!showPass)}
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

          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 italic" htmlFor="confirm-password">
              Confirm Password
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#00a0ff] focus:border-[#00a0ff] transition-all bg-slate-50 text-slate-900 pr-12"
                type={showConfirm ? 'text' : 'password'}
                id="confirm-password"
                name="confirmPassword"
                placeholder="Repeat your password"
                // required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                onClick={() => setShowConfirm(!showConfirm)}
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

          <SubmitButton />
        </form>
      )}

      {!token && (
        <div className="text-center py-6">
          <p className="text-slate-600 mb-6 font-medium italic">
            No valid reset token found. Please request a new link.
          </p>
          <Link href="/auth/forgot-password" size="sm" className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg transition-colors uppercase italic tracking-wide">
            Go to Forgot Password
          </Link>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-[#1a8ab4] transition-colors">
          Change your mind? <span className="text-[#1a8ab4] font-bold underline">Back to Login</span>
        </Link>
      </div>
    </div>
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

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50 flex flex-col justify-center items-center px-4 py-12 px-4 shadow-sm">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 font-roboto-condensed uppercase italic">
            Create New Password
          </h1>
          <p className="text-slate-500 font-medium">
            Choose a secure password to regain access to your RunnerX account.
          </p>
        </div>

        <section className="flex justify-center">
          <Suspense fallback={
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-12 w-full text-center">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-[#1a8ab4] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 font-medium italic">Verifying session...</p>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
