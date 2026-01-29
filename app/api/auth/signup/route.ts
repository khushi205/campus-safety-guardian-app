import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/signup
 * 
 * Creates a new user account
 * 
 * Request body:
 * {
 *   name: string,
 *   email: string,
 *   password: string
 * }
 * 
 * TODO: Connect to Firebase Authentication
 * Steps:
 * 1. Hash password using bcrypt
 * 2. Create user in Firebase
 * 3. Store user profile data
 * 4. Return user data and auth token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // TODO: Firebase signup logic
    // const user = await createUserWithEmailAndPassword(email, password);
    // await setUserProfile(user.uid, { name, email });

    return NextResponse.json({
      success: true,
      user: {
        id: 'demo-user-id',
        name,
        email,
      },
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
