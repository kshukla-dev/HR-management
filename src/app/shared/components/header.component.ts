import { Component, OnInit, OnDestroy, inject, signal, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { LayoutService } from '../../core/services/layout.service';
import { NotificationItem, UserRole } from '../../core/models';
import {
  LucideSearch, LucideShield,
  LucideChevronDown, LucideCheck, LucideBell,
  LucideLogOut, LucideKeyRound, LucideUser,
  LucideX, LucideLock, LucideCheckCircle2, LucideAlertCircle,
  LucideMenu
} from '@lucide/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideSearch,
    LucideShield,
    LucideChevronDown,
    LucideCheck,
    LucideBell,
    LucideLogOut,
    LucideKeyRound,
    LucideUser,
    LucideX,
    LucideLock,
    LucideCheckCircle2,
    LucideAlertCircle,
    LucideMenu
  ],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  readonly layout = inject(LayoutService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  isCheckedIn = true;
  punchTime = '09:04 AM';
  elapsedSeconds = 19800; // 5.5 hours
  notifications: NotificationItem[] = [];
  showNotifDrawer = false;
  showRoleMenu = false;
  showUserMenu = false;
  searchQuery = '';
  punchLoading = false;
  private timer: any = null;

  // Change Password Modal state
  showChangePasswordModal = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  changePasswordError = '';
  changePasswordSuccess = '';
  isChangingPassword = false;

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.loadNotifications();
      }
    });
  }

  ngOnInit(): void {
    this.timer = setInterval(() => {
      if (this.isCheckedIn) {
        this.elapsedSeconds++;
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  get formattedElapsedTime(): string {
    const totalSeconds = this.elapsedSeconds;
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  formatTimestamp(ts: string): string {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  async loadNotifications(): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.getNotifications());
      if (res && res.success) {
        this.notifications = res.notifications;
      }
    } catch (err) {
      console.error('Failed to load notifications in Header:', err);
    }
  }

  async handlePunchToggle(): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;
    this.punchLoading = true;
    try {
      if (this.isCheckedIn) {
        await firstValueFrom(this.api.checkOut(user.employeeId));
        this.isCheckedIn = false;
      } else {
        await firstValueFrom(this.api.checkIn(user.employeeId));
        this.isCheckedIn = true;
        const now = new Date();
        this.punchTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.elapsedSeconds = 0;
      }
    } catch (err) {
      console.error('Punch action failed:', err);
    } finally {
      this.punchLoading = false;
    }
  }

  toggleRoleMenu(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.showRoleMenu = !this.showRoleMenu;
    if (this.showRoleMenu) {
      this.showNotifDrawer = false;
      this.showUserMenu = false;
    }
  }

  toggleNotifDrawer(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.showNotifDrawer = !this.showNotifDrawer;
    if (this.showNotifDrawer) {
      this.showRoleMenu = false;
      this.showUserMenu = false;
    }
  }

  toggleUserMenu(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) {
      this.showRoleMenu = false;
      this.showNotifDrawer = false;
    }
  }

  closeAllDropdowns(): void {
    this.showRoleMenu = false;
    this.showNotifDrawer = false;
    this.showUserMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    if (!target.closest('.role-dropdown-container')) {
      this.showRoleMenu = false;
    }
    if (!target.closest('.notif-dropdown-container')) {
      this.showNotifDrawer = false;
    }
    if (!target.closest('.user-dropdown-container')) {
      this.showUserMenu = false;
    }
  }

  selectRole(role: UserRole): void {
    this.auth.switchUser(role);
    this.closeAllDropdowns();
  }

  async handleMarkAsRead(id: string): Promise<void> {
    await firstValueFrom(this.api.markNotificationRead(id));
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n);
  }

  async handleMarkAllRead(): Promise<void> {
    await firstValueFrom(this.api.markAllNotificationsRead());
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
  }

  navigate(tab: string): void {
    this.closeAllDropdowns();
    this.router.navigate([`/${tab}`]);
  }

  logout(): void {
    this.closeAllDropdowns();
    this.auth.logout();
  }

  openChangePassword(): void {
    this.closeAllDropdowns();
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.changePasswordError = '';
    this.changePasswordSuccess = '';
    this.showChangePasswordModal = true;
  }

  closeChangePassword(): void {
    this.showChangePasswordModal = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.changePasswordError = '';
    this.changePasswordSuccess = '';
  }

  async submitChangePassword(): Promise<void> {
    this.changePasswordError = '';
    this.changePasswordSuccess = '';

    if (!this.currentPassword) {
      this.changePasswordError = 'Please enter your current password.';
      return;
    }

    if (!this.newPassword || this.newPassword.length < 6) {
      this.changePasswordError = 'New password must be at least 6 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.changePasswordError = 'New password and confirmation do not match.';
      return;
    }

    this.isChangingPassword = true;
    try {
      const res = await this.auth.changePassword(this.currentPassword, this.newPassword);
      if (res.success) {
        this.changePasswordSuccess = res.message || 'Password changed successfully!';
        setTimeout(() => {
          this.closeChangePassword();
        }, 1500);
      } else {
        this.changePasswordError = res.message || 'Failed to update password.';
      }
    } catch (err: any) {
      this.changePasswordError = err.message || 'Failed to update password.';
    } finally {
      this.isChangingPassword = false;
    }
  }
}
