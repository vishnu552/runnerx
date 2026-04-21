import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('runnerx-user-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const res = await fetch(`${API_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Profile proxy error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch profile' }, { status: 500 });
  }
}
