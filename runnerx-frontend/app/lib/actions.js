'use server';

import { API_URL } from './api';
import { setSessionToken, destroySession } from './auth';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { ORIGIN_COOKIE_NAME } from './constants';
import { getOriginConfig } from './origin';

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
