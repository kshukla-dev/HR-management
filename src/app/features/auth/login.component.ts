import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  LucideEye, LucideEyeOff, LucideCheckCircle2,
  LucideAlertCircle
} from '@lucide/angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideEye,
    LucideEyeOff,
    LucideCheckCircle2,
    LucideAlertCircle
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = 'it@jacksonandfrank.com';
  password = 'jacksonandfranc@123';
  rememberMe = true;
  showPassword = false;
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  quickAccounts = [
    { label: 'IT Admin (J&F)', email: 'it@jacksonandfrank.com', role: 'Super Admin' },
    { label: 'HR Super Admin', email: 'admin@democorp.com', role: 'Super Admin' },
    { label: 'HR Manager', email: 'hr@democorp.com', role: 'HR Admin' },
    { label: 'Team Lead', email: 'manager@democorp.com', role: 'Manager' },
    { label: 'Employee', email: 'priya@democorp.com', role: 'Employee' }
  ];

  selectQuickAccount(acc: { email: string }) {
    this.email = acc.email;
    this.password = 'jacksonandfranc@123';
    this.errorMessage.set('');
  }

  async handleLogin() {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.email || !this.email.trim()) {
      this.errorMessage.set('Please enter your email address.');
      return;
    }

    if (!this.password) {
      this.errorMessage.set('Please enter your password.');
      return;
    }

    this.isLoading.set(true);

    try {
      const res = await this.auth.loginWithCredentials(this.email.trim(), this.password);
      if (res.success) {
        this.successMessage.set('Sign in successful. Redirecting...');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 400);
      } else {
        this.errorMessage.set(res.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Login failed. Please check credentials.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
