import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';
import { 
  LucideLayoutDashboard, LucideUser, LucideCalendarCheck, 
  LucideCalendarDays, LucideReceiptText, 
  LucidePlane, LucideLogOut, LucideUsers, LucideCheckSquare, 
  LucideFileSpreadsheet, LucideX
} from '@lucide/angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideLayoutDashboard,
    LucideUser,
    LucideCalendarCheck,
    LucideCalendarDays,
    LucideReceiptText,
    LucidePlane,
    LucideLogOut,
    LucideUsers,
    LucideCheckSquare,
    LucideFileSpreadsheet,
    LucideX
  ],
  templateUrl: './sidebar.component.html',
  styles: [`
    :host {
      display: contents;
    }
    :host .active-nav {
      background: linear-gradient(135deg, #0b1736 0%, #162a5c 100%) !important;
      color: #ffffff !important;
      border-left: 3.5px solid #f97316 !important;
      box-shadow: 0 4px 12px rgba(11, 23, 54, 0.22) !important;
    }
    :host .active-nav svg {
      color: #f97316 !important;
    }
    :host a:not(.active-nav) svg {
      color: #64748b;
    }
    :host a:not(.active-nav):hover {
      background-color: #fff7ed !important;
      color: #ea580c !important;
    }
    :host a:not(.active-nav):hover svg {
      color: #f97316 !important;
    }
    :host .active-nav .badge-span {
      background-color: #f97316 !important;
      color: #ffffff !important;
    }
  `]
})
export class SidebarComponent {
  readonly auth = inject(AuthService);
  readonly layout = inject(LayoutService);

  onNavClick(): void {
    this.layout.closeSidebar();
  }

  readonly isEmployee = computed(() => this.auth.currentUser()?.role === 'Employee');
  readonly isManager = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role === 'Manager' || role === 'Super Admin' || role === 'HR Admin';
  });
  readonly isHR = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role === 'HR Admin' || role === 'Super Admin' || role === 'HR Executive';
  });
  readonly isPayroll = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role === 'Payroll Admin' || role === 'Finance' || role === 'Super Admin';
  });
  readonly isRecruiter = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role === 'Recruiter' || role === 'HR Admin' || role === 'Super Admin';
  });
  readonly isAdmin = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role === 'Super Admin' || role === 'HR Admin';
  });

  logout(): void {
    this.auth.logout();
  }
}
