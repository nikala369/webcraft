import { Injectable } from '@angular/core';

/**
 * TokenService handles JWT token storage, retrieval and removal
 * using localStorage as the storage mechanism.
 */
@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';
  private isLocalStorageAvailable: boolean;

  constructor() {
    // Check if localStorage is available
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability();

    if (!this.isLocalStorageAvailable) {
      console.warn(
        'localStorage is not available. Authentication persistence will be disabled.'
      );
    }
  }

  /**
   * Saves the JWT token to localStorage
   * @param token - The JWT token string to save
   */
  saveToken(token: string): void {
    // if (!this.isLocalStorageAvailable) return;

    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token to localStorage:', error);
    }
  }

  /**
   * Retrieves the JWT token from localStorage
   * @returns The stored token or null if not found
   */
  getToken(): string | null {
    // if (!this.isLocalStorageAvailable) return null;

    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving token from localStorage:', error);
      return null;
    }
  }

  /**
   * Removes the JWT token from localStorage
   */
  removeToken(): void {
    if (!this.isLocalStorageAvailable) return;

    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  }

  /**
   * Checks if a JWT token is expired
   * @param token - The JWT token to check (optional, uses stored token if not provided)
   * @returns boolean indicating if token is expired or not
   */
  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getToken();

    if (!tokenToCheck) {
      return true; // No token means it's expired
    }

    try {
      // Decode the token (JWT is in format header.payload.signature)
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));

      if (!payload.exp) {
        return false; // No expiration claim, assume not expired
      }

      // exp is in seconds, current time is in milliseconds
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate.getTime() <= Date.now();
    } catch (e) {
      console.error('Error parsing JWT token:', e);
      return true; // If there's an error parsing the token, consider it expired
    }
  }

  /**
   * Checks if localStorage is available in the current environment
   * @returns boolean indicating if localStorage is available
   */
  private checkLocalStorageAvailability(): boolean {
    const testKey = '__test_key__';

    try {
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
}
