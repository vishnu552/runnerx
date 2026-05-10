'use server';

import { API_URL } from './api';
import { setSessionToken, setOriginCookie, destroySession } from './auth';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { ORIGIN_COOKIE_NAME } from './constants';
import { ALLOWED_ORIGINS, getOriginConfig } from './origin';
import { resolvePostLoginUrl } from './post-login-redirect';

export async function checkUserStatus(email) {
  if (!email || !email.includes('@')) return { exists: false };

  try {
    const res = await fetch(
      `${API_URL}/api/auth/check-user?email=${encodeURIComponent(email)}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Check user status error:', error);
    return { exists: false, error: 'Failed to check user status' };
  }
}

export async function loginUser(prevState, formData) {
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();
  const originRaw = formData.get('origin')?.toString() || null;
  const redirectParam = formData.get('redirect')?.toString() || null;

  const fieldErrors = {};
  if (!email) fieldErrors.email = ['Email is required'];
  if (!password) {
    fieldErrors.password = ['Password is required'];
  } else if (password.length < 6) {
    fieldErrors.password = ['Password must be at least 6 characters'];
  } else if (password.length > 30) {
    fieldErrors.password = ['Password must be no more than 30 characters'];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: 'Validation failed', fieldErrors };
  }

  let postLoginUrl = null;
  try {
    const res = await fetch(`${API_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        error: data.message || 'Login failed',
        fieldErrors: data.errors || null,
      };
    }

    if (data.user?.role !== 'USER') {
      await destroySession();
      return {
        error: 'This account is for admin backend only. Please login on the admin portal.',
      };
    }

    if (!data.token) {
      return { error: 'Invalid response from server' };
    }

    await setSessionToken(data.token);
    const safeOrigin = ALLOWED_ORIGINS.includes(originRaw) ? originRaw : null;
    if (safeOrigin) {
      await setOriginCookie(safeOrigin);
    }
    postLoginUrl = await resolvePostLoginUrl(safeOrigin, redirectParam);
  } catch (error) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error('Login action error:', error);
    return { error: 'An unexpected error occurred' };
  }

  if (postLoginUrl) {
    redirect(postLoginUrl);
  }
}

export async function registerUser(prevState, formData) {
  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();
  const phoneRaw = formData.get('phone')?.toString().trim();
  const phone = phoneRaw || null;

  const fieldErrors = {};
  if (!name) fieldErrors.name = ['Full Name is required'];
  if (!email) fieldErrors.email = ['Email is required'];
  if (phone && !/^\d{10}$/.test(phone)) {
    fieldErrors.phone = ['Phone must be a 10-digit number'];
  }
  if (!password) {
    fieldErrors.password = ['Password is required'];
  } else if (password.length < 6) {
    fieldErrors.password = ['Password must be at least 6 characters'];
  } else if (password.length > 30) {
    fieldErrors.password = ['Password must be no more than 30 characters'];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: 'Validation failed', fieldErrors };
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        error: data.message || 'Registration failed',
        fieldErrors: data.errors || null,
      };
    }

    if (data.success) {
      return {
        success: true,
        message:
          data.message ||
          'Registration successful. Please check your email to verify your account.',
      };
    }

    return { error: data.message || 'Invalid response from server' };
  } catch (error) {
    console.error('Register action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function unifiedAuth(prevState, formData) {
  const mode = formData.get('auth_mode');
  if (mode === 'register') {
    return registerUser(prevState, formData);
  }
  return loginUser(prevState, formData);
}

export async function forgotPasswordUser(prevState, formData) {
  const email = formData.get('email')?.toString().trim();

  const fieldErrors = {};
  if (!email) fieldErrors.email = ['Email is required'];

  if (Object.keys(fieldErrors).length > 0) {
    return { error: 'Validation failed', fieldErrors };
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        error: data.message || 'Failed to send reset link',
        fieldErrors: data.errors || null,
      };
    }

    return {
      success: true,
      message: data.message || 'Reset link sent successfully',
      debugToken: data.debugToken || null,
    };
  } catch (error) {
    console.error('Forgot password action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function resetPasswordUser(prevState, formData) {
  const token = formData.get('token')?.toString();
  const password = formData.get('password')?.toString();
  const confirmPassword = formData.get('confirmPassword')?.toString();
  const originRaw = formData.get('origin')?.toString() || '';

  const fieldErrors = {};
  if (!password) {
    fieldErrors.password = ['Password is required'];
  } else if (password.length < 6) {
    fieldErrors.password = ['Password must be at least 6 characters'];
  } else if (password.length > 30) {
    fieldErrors.password = ['Password must be no more than 30 characters'];
  }
  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = ['Passwords do not match'];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: 'Validation failed', fieldErrors };
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        error: data.message || 'Failed to reset password',
        fieldErrors: data.errors || null,
      };
    }

    const safeOrigin = ALLOWED_ORIGINS.includes(originRaw) ? originRaw : null;
    const redirectUrl = safeOrigin ? `/login?origin=${safeOrigin}` : '/login';

    return {
      success: true,
      message: data.message || 'Password reset successfully',
      redirect: redirectUrl,
    };
  } catch (error) {
    console.error('Reset password action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  const origin = cookieStore.get(ORIGIN_COOKIE_NAME)?.value || null;
  
  // Destroy all cookies
  await destroySession();
  
  // Determine redirect URL
  const originConfig = origin ? getOriginConfig(origin) : null;
  const redirectUrl = originConfig ? originConfig.url : (process.env.NEXT_PUBLIC_SITE_URL || '/');
  
  redirect(redirectUrl);
}

export async function updateProfile(prevState, formData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('runnerx-user-token')?.value;

    if (!token) {
      return { error: 'Not authenticated' };
    }

    const profileData = {
      name: formData.get('name'),
      gender: formData.get('gender') || null,
      dateOfBirth: formData.get('dateOfBirth') || null,
      phone: formData.get('phone') || null,
      city: formData.get('city') || null,
      state: formData.get('state') || null,
      county: formData.get('county') || null,
      pinCode: formData.get('pinCode') || null,
      address: formData.get('address') || null,
      bloodGroup: formData.get('bloodGroup') || null,
    };

    const res = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || 'Failed to update profile' };
    }

    revalidatePath('/dashboard', 'layout');

    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Profile update error:', error);
    return { error: 'An unexpected error occurred' };
  }
}
