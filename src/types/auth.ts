// User role enumeration
export enum UserRole {
  USER = 'USER',
  ARTIST = 'ARTIST',
  ADMIN = 'ADMIN',
}

// Base user interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Registration request interface
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

// Login request interface
export interface LoginRequest {
  email: string;
  password: string;
}

// Password reset request interface
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Session interface
export interface Session {
  user: User;
  expires: string;
}

// JWT payload interface
export interface JWTPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  iat: number; // Issued at
  exp: number; // Expiration
  jti: string; // JWT ID
}

// Authentication response interface
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token?: string;
  };
  error?: string;
}

// Password validation interface
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
} 