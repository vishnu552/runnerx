'use server';

import { API_URL } from './api';
import { setSessionToken, destroySession } from './auth';

export async function loginUser(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || 'Login failed' };
    }

    if (data.user?.role !== 'USER') {
      await destroySession();
      return { error: 'This account is for admin backend only. Please login on the admin portal.' };
    }

    if (data.token) {
      await setSessionToken(data.token);
      return { success: true, redirect: '/dashboard' };
    }

    return { error: 'Invalid response from server' };
  } catch (error) {
    console.error('Login action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function registerUser(prevState, formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || 'Registration failed' };
    }

    if (data.user?.role !== 'USER') {
      await destroySession();
      return { error: 'Only user accounts can access this frontend.' };
    }

    if (data.token) {
      await setSessionToken(data.token);
      return { success: true, redirect: '/dashboard' };
    }

    return { error: 'Invalid response from server' };
  } catch (error) {
    console.error('Register action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function authUser(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const res = await fetch(`${API_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || 'Authentication failed' };
    }

    if (data.user?.role !== 'USER') {
      await destroySession();
      return { error: 'This account is for admin backend only. Please login on the admin portal.' };
    }

    if (data.token) {
      await setSessionToken(data.token);
      return {
        success: true,
        action: data.action,
        message: data.message,
        redirect: '/dashboard',
      };
    }

    return { error: 'Invalid response from server' };
  } catch (error) {
    console.error('Auth action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function logoutUser() {
  await destroySession();
  return { success: true };
}

export async function updateProfile(prevState, formData) {
  try {
    const { cookies } = await import('next/headers');
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
      emergencyContactName: formData.get('emergencyContactName') || null,
      emergencyContactPhone: formData.get('emergencyContactPhone') || null,
      tshirtSize: formData.get('tshirtSize') || null,
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

    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Profile update error:', error);
    return { error: 'An unexpected error occurred' };
  }
}
