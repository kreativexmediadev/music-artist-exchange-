import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
      },
    });

    console.log('Test user created successfully:', user);
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser(); 