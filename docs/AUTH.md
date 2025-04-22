# Authentication System Documentation

## Overview
The MAX platform implements a secure authentication system using NextAuth.js for handling user sessions and JWT tokens. The system supports both traditional email/password authentication and OAuth providers for social login.

## Features
- Email/Password Authentication
- Social Login (Google, Twitter)
- JWT Token Management
- Session Management
- Role-Based Access Control
- Password Reset Flow
- Email Verification
- Two-Factor Authentication (2FA)

## User Roles
1. **Regular User**
   - Can trade artists
   - View market data
   - Manage portfolio

2. **Artist**
   - All regular user permissions
   - Manage artist profile
   - View performance metrics

3. **Admin**
   - All permissions
   - Manage user accounts
   - Configure system settings
   - Monitor trading activity

## Authentication Flow
1. **Registration**
   ```mermaid
   sequenceDiagram
       User->>Frontend: Fill registration form
       Frontend->>Backend: POST /api/auth/register
       Backend->>Database: Create user record
       Backend->>Email Service: Send verification email
       Backend->>Frontend: Return success response
       Frontend->>User: Show confirmation message
   ```

2. **Login**
   ```mermaid
   sequenceDiagram
       User->>Frontend: Enter credentials
       Frontend->>NextAuth: POST /api/auth/signin
       NextAuth->>Database: Verify credentials
       Database->>NextAuth: Return user data
       NextAuth->>Frontend: Set session cookie
       Frontend->>User: Redirect to dashboard
   ```

## Security Measures
- Password hashing using bcrypt
- CSRF protection
- Rate limiting
- JWT token rotation
- Session invalidation
- IP-based blocking
- Audit logging

## API Endpoints

### Authentication
```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

// POST /api/auth/reset-password
interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
```

### Session Management
```typescript
// GET /api/auth/session
interface Session {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  expires: string;
}
```

## Implementation Details

### User Schema
```typescript
interface User {
  id: string;
  email: string;
  password: string; // Hashed
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### JWT Token Structure
```typescript
interface JWTPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat: number; // Issued at
  exp: number; // Expiration
  jti: string; // JWT ID
}
```

## Error Handling
- Invalid credentials
- Account locked
- Email not verified
- Password requirements not met
- Rate limit exceeded
- Session expired
- Invalid 2FA code

## Testing Strategy
1. **Unit Tests**
   - Password hashing
   - Token validation
   - Permission checks

2. **Integration Tests**
   - Registration flow
   - Login flow
   - Password reset

3. **E2E Tests**
   - Complete authentication flows
   - Social login integration
   - Session management

## Security Considerations
1. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one number
   - At least one special character

2. **Rate Limiting**
   - 5 login attempts per minute
   - 3 password reset requests per hour
   - 10 API calls per second

3. **Session Security**
   - 30-minute session timeout
   - Automatic logout on inactivity
   - Single session per user

## Monitoring
- Failed login attempts
- Password reset requests
- Session creation/destruction
- API endpoint usage
- Error rates 