import { NextRequest, NextResponse } from 'next/server';


 
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

  

    return NextResponse.json({
      success: true,
      user: {
        id: 'demo-user-id',
        email,
      },
      token: 'demo-auth-token',
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
}
