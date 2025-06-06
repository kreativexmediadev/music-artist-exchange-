import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function recreateTestUser() {
  try {
    // Delete existing user if exists
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' }
    });

    // Create new user with known password hash
    const hashedPassword = await bcrypt.hash('test123', 10);
    console.log('Generated password hash:', hashedPassword);
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
      },
    });

    console.log('Test user recreated successfully:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } catch (error) {
    console.error('Error recreating test user:', error);
  }
}

recreateTestUser(); 