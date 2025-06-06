import { signIn } from 'next-auth/react';

async function testLogin() {
  console.log('Testing login functionality...');

  try {
    const result = await signIn('credentials', {
      redirect: false,
      email: 'test@example.com',
      password: 'password123',
    });

    console.log('Login result:', result);

    if (result?.error) {
      console.error('Login failed:', result.error);
    } else {
      console.log('Login successful!');
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}

testLogin(); 