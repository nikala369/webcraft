import { Injectable, signal } from '@angular/core';
import { Signal } from '@angular/core';

interface User {
  id: number;
  username: string;
  roles: string[];
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<User | null>(null); // Authenticated user state
  private isAuthenticatedSignal = signal(false);  // Auth status

  constructor() {
    this.loadUserFromStorage();
  }

  login(username: string, password: string): void {
    // Replace with actual API later
    const fakeUser: User = {
      id: 1,
      username: username,
      roles: ['user'],
      token: 'fake-jwt-token'
    };

    this.userSignal.set(fakeUser);
    this.isAuthenticatedSignal.set(true);
    localStorage.setItem('auth_token', fakeUser.token);
    localStorage.setItem('auth_user', JSON.stringify(fakeUser));
  }

  logout(): void {
    this.userSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  // Getter signals
  get user(): Signal<User | null> {
    return this.userSignal;
  }

  get isAuthenticated(): Signal<boolean> {
    return this.isAuthenticatedSignal;
  }

  // Load user from storage (on page reload)
  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('auth_user');
    if (userData) {
      this.userSignal.set(JSON.parse(userData));
      this.isAuthenticatedSignal.set(true);
    }
  }

  // Check role access
  hasRole(role: string): boolean {
    const user = this.userSignal();
    return user ? user.roles.includes(role) : false;
  }
}
