import { jwtDecode } from 'jwt-decode';
import type { JwtPayload, User } from '../types/auth.types';

/**
 * Token expiry buffer in seconds (60s)
 * Tokens expiring within this time are considered expired to prevent flickering
 */
const TOKEN_EXPIRY_BUFFER = 60;

/**
 * Decode JWT token and extract payload
 * @param token JWT token string
 * @returns Decoded JWT payload or null if invalid
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * @param token JWT token string
 * @returns true if token is expired or will expire within buffer time
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Date.now() / 1000; // Convert to seconds
  const expiryTime = decoded.exp - TOKEN_EXPIRY_BUFFER;

  return currentTime >= expiryTime;
}

/**
 * Extract user information from JWT token
 * @param token JWT token string
 * @returns User object or null if token is invalid
 */
export function getUserFromToken(token: string): User | null {
  const decoded = decodeToken(token);
  if (!decoded) {
    return null;
  }

  return {
    id: decoded.userId,
    username: decoded.sub,
    email: decoded.email,
    role: decoded.role,
  };
}

/**
 * Validate JWT token structure and expiry
 * @param token JWT token string
 * @returns true if token is valid and not expired
 */
export function isTokenValid(token: string): boolean {
  if (!token) {
    return false;
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    return false;
  }

  return !isTokenExpired(token);
}

/**
 * Get token expiration time
 * @param token JWT token string
 * @returns Expiration time in milliseconds or null
 */
export function getTokenExpiration(token: string): number | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  return decoded.exp * 1000; // Convert to milliseconds
}

/**
 * Get remaining time before token expires
 * @param token JWT token string
 * @returns Remaining time in seconds or 0 if expired
 */
export function getTokenRemainingTime(token: string): number {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return 0;
  }

  const remaining = Math.floor((expiration - Date.now()) / 1000);
  return Math.max(0, remaining);
}

