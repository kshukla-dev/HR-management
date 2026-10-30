import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { User, UserRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private currentUserSignal = signal<User | null>(null);
  private allUsersSignal = signal<User[]>([]);
  private isLoadingSignal = signal<boolean>(true);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly allUsers = this.allUsersSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  constructor() {
    this.initAuth();
  }

  async initAuth(): Promise<void> {
    try {
      const usersRes = await firstValueFrom(this.api.getUsers());
      if (usersRes.success && usersRes.users.length > 0) {
        this.allUsersSignal.set(usersRes.users);

        const savedUserStr = localStorage.getItem('hrms_user');
        if (savedUserStr) {
          try {
            const saved = JSON.parse(savedUserStr);
            const matched = usersRes.users.find(u => u.id === saved.id || u.email.toLowerCase() === (saved.email || '').toLowerCase());
            if (matched && (matched.isBlocked || matched.isActive === false)) {
              this.logout();
              return;
            }
            this.currentUserSignal.set(matched || saved);
          } catch {
            const activeDefault = usersRes.users.find(u => !u.isBlocked) || usersRes.users[0];
            this.currentUserSignal.set(activeDefault);
            localStorage.setItem('hrms_user', JSON.stringify(activeDefault));
          }
        } else {
          // If no stored session, initialize default Super Admin for seamless testing
          const activeDefault = usersRes.users.find(u => !u.isBlocked) || usersRes.users[0];
          this.currentUserSignal.set(activeDefault);
          localStorage.setItem('hrms_user', JSON.stringify(activeDefault));
        }
      }
    } catch (err) {
      console.error('Failed to load initial users in AuthService:', err);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  async loginWithCredentials(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    this.isLoadingSignal.set(true);
    try {
      const res = await firstValueFrom(this.api.login({ email, password }));
      if (res.success && res.user) {
        this.currentUserSignal.set(res.user);
        localStorage.setItem('hrms_user', JSON.stringify(res.user));
        localStorage.setItem('hrms_token', res.token);
        return { success: true };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (err: any) {
      const msg = err.error?.message || err.message || 'Login failed. Please check your credentials.';
      return { success: false, message: msg };
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  logout(): void {
    localStorage.removeItem('hrms_user');
    localStorage.removeItem('hrms_token');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = this.currentUser();
    if (!user) return { success: false, message: 'No active session' };

    try {
      const res = await firstValueFrom(this.api.changePassword({
        userId: user.id,
        email: user.email,
        currentPassword,
        newPassword
      }));

      if (res.success) {
        const updated = { ...user, password: newPassword, mustChangePassword: false };
        this.currentUserSignal.set(updated);
        localStorage.setItem('hrms_user', JSON.stringify(updated));
        return { success: true, message: res.message || 'Password updated successfully' };
      }
      return { success: false, message: res.message || 'Failed to update password' };
    } catch (err: any) {
      const msg = err.error?.message || err.message || 'Failed to update password';
      return { success: false, message: msg };
    }
  }

  async switchUser(role: UserRole): Promise<void> {
    this.isLoadingSignal.set(true);
    try {
      const res = await firstValueFrom(this.api.login({ role }));
      if (res.success && res.user) {
        this.currentUserSignal.set(res.user);
        localStorage.setItem('hrms_user', JSON.stringify(res.user));
        localStorage.setItem('hrms_token', res.token);
      }
    } catch (err) {
      console.error('Failed to switch user:', err);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSignal();
    if (!user) return false;
    if (user.role === 'Super Admin') return true;
    if (user.permissions.includes('*')) return true;
    return user.permissions.some(p => {
      if (p.endsWith('.*')) {
        const prefix = p.replace('.*', '');
        return permission.startsWith(prefix);
      }
      return p === permission;
    });
  }
}
