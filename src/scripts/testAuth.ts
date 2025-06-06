import { authOptions } from '@/app/api/auth/[...nextauth]/route';

console.log('Testing Authentication Configuration...');

// Check required environment variables
const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  process.exit(1);
}

console.log('All required environment variables are present.');

// Test NextAuth configuration
console.log('\nNextAuth Configuration:');
console.log('- Session Strategy:', authOptions.session?.strategy);
console.log('- Providers:', authOptions.providers?.map(p => p.name));
console.log('- Debug Mode:', authOptions.debug);

console.log('\nAuthentication test completed successfully.'); 