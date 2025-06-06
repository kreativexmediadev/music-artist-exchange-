import { prisma } from '@/lib/prisma';

async function verifyTestUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
      }
    });

    console.log('Test user data:', user ? {
      id: user.id,
      email: user.email,
      hasPassword: !!user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    } : 'No user found');
  } catch (error) {
    console.error('Error verifying test user:', error);
  }
}

verifyTestUser(); 