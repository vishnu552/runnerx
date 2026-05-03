'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { forgotPasswordUser } from '@/lib/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-[#00a0ff] hover:bg-[#136a8a] text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-100 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider italic flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          Sending...
        </>
      ) : 'Send Reset Link →'}
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

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(forgotPasswordUser, initialState);
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 font-roboto-condensed uppercase italic">
            Reset Password
          </h1>
          <p className="text-slate-500 font-medium">
            Enter your email to receive a secure password reset link.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-8 md:p-10 relative overflow-hidden">
          {/* Subtle accent line */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#00a0ff]"></div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center italic uppercase font-roboto-condensed">
            Forgot Password?
          </h2>

          {state?.success && state?.message && (
            <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg mb-6 text-sm">
              <p className="font-medium mb-1">{state.message}</p>
              {state.debugToken && (
                <div className="mt-4 pt-4 border-t border-green-100 italic">
                  <p className="font-bold text-xs uppercase tracking-wider mb-2 text-slate-500">Development Only:</p>
                  <Link 
                    href={`/auth/reset-password?token=${state.debugToken}`}
                    className="text-[#00a0ff] hover:text-[#136a8a] font-bold underline break-all block"
                  >
                    Click here to reset password
                  </Link>
                </div>
              )}
            </div>
          )}

          {state?.error && !state?.fieldErrors && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg mb-6 text-sm font-medium">
              {state.error}
            </div>
          )}

          {!state?.success && (
            <form action={formAction} className="space-y-6">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 italic">
                  Email Address
                </label>
                <input
                  type="email"
                  id="reset-email"
                  name="email"
                  placeholder="name@example.com"
                  // required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#00a0ff] focus:border-[#00a0ff] transition-all bg-slate-50 text-slate-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {state?.fieldErrors?.email && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>
                    {state.fieldErrors.email[0]}
                  </div>
                )}
              </div>

              <SubmitButton />
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-[#00a0ff] transition-colors">
              Remember your password? <span className="text-[#00a0ff] font-bold underline">Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
