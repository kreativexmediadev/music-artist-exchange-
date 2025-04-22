import { NextResponse } from 'next/server';
import { RegisterRequest, AuthResponse } from '@/types/auth';
import { validateEmail } from '@/utils/auth';

export async function POST(request: Request) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, firstName, lastName, role } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // TODO: Add actual user creation logic here
    // This is a placeholder for demonstration
    const response: AuthResponse = {
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: 'temp-id',
          email,
          firstName,
          lastName,
          role,
          emailVerified: false,
          twoFactorEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 