/**
 * User status enum
 */
export enum UserStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

/**
 * User role enum
 */
export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  CREATOR = 'ROLE_CREATOR',
  GUEST = 'ROLE_GUEST',
}

/**
 * User model with full profile information
 */
export interface AuthUser {
  id: number | string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: UserStatus | string;
  role: UserRole | string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  preferences?: UserPreferences;
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  emailUpdates?: boolean;
  defaultPageSize?: number;
}

/**
 * Auth response from login endpoint
 */
export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  status: string;
  /** Expiration in seconds (if provided by backend) */
  expiresIn?: number;
}

/**
 * Register response interface
 */
export interface RegisterResponse {
  message: string;
  /**
   * Optional data returned from registration
   * May include userId, verification instructions, etc.
   */
  data?: {
    userId?: number | string;
    requiresVerification?: boolean;
    verificationMethod?: 'EMAIL' | 'PHONE' | string;
    verificationExpiry?: string;
    [key: string]: any;
  };
}

/**
 * Register request interface
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * Password request format
 */
export interface PasswordResetRequest {
  /** Email or username */
  source: 'EMAIL' | 'USERNAME';
  /** Value for the selected source type */
  username?: string;
  email?: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirmation {
  /** Reset token from email */
  code: string;
  /** New password */
  newPassword: string;
}

/**
 * Password change request
 */
export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * API Error response
 */
export interface ApiError {
  status?: number;
  code?: string;
  message: string;
  errors?: { [key: string]: string };
  timestamp?: string;
  path?: string;
}
