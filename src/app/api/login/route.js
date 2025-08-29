import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const response = await fetch('https://web-production-dbd6b.up.railway.app/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Kirim token kembali ke client
      return NextResponse.json({ 
        success: true, 
        token: data.token 
      });
    } else {
      return NextResponse.json(
        { success: false, error: data.message || 'Login failed' },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}