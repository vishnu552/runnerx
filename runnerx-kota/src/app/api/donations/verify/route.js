import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('runnerx-user-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();

    const res = await fetch(`${API_URL}/api/auth/donations/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Donation verify proxy error:', error);
    return NextResponse.json({ success: false, message: 'Failed to verify donation' }, { status: 500 });
  }
}
