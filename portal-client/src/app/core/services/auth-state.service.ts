import { Injectable, signal } from '@angular/core';
import { AuthResponse } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly userKey = 'portal_user';
  
  // Signal for reactive user state
  readonly currentUser = signal<{ userName: string; email?: string } | null>(this.getStoredUser());

  setUser(authResponse: AuthResponse): void {
    if (authResponse.userName) {
      const user = {
        userName: authResponse.userName,
        email: authResponse.email
      };
      this.currentUser.set(user);
      this.storeUser(user);
    }
  }

  clearUser(): void {
    this.currentUser.set(null);
    this.clearStoredUser();
  }

  getUserName(): string | null {
    const user = this.currentUser();
    return user?.userName || null;
  }

  getInitials(): string {
    const user = this.currentUser();
    if (!user?.userName) {
      return 'G';
    }
    return user.userName.slice(0, 2).toUpperCase();
  }

  private storeUser(user: { userName: string; email?: string }): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  private getStoredUser(): { userName: string; email?: string } | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const stored = localStorage.getItem(this.userKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private clearStoredUser(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.userKey);
    }
  }
}

