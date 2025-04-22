import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

// Validate environment variables
if (!process.env.NEXTAUTH_URL) {
  throw new Error('Please set NEXTAUTH_URL environment variable');
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please set NEXTAUTH_SECRET environment variable');
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables');
}

// Configure NextAuth options
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any, // Type assertion needed due to version mismatch
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false, // Disable debug mode
};

// Export NextAuth handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 