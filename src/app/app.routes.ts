import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EmployeeListComponent } from './features/employees/employee-list.component';
import { AttendanceComponent } from './features/attendance/attendance.component';
import { LeaveComponent } from './features/leave/leave.component';
import { ApprovalsComponent } from './features/approvals/approvals.component';
import { PayrollComponent } from './features/payroll/payroll.component';
import { TravelExpenseComponent } from './features/travel-expense/travel-expense.component';
import { SeparationComponent } from './features/separation/separation.component';
import { ProfileComponent } from './features/profile/profile.component';
import { TeamComponent } from './features/team/team.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'documents', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'employees', component: EmployeeListComponent, canActivate: [authGuard] },
  { path: 'attendance', component: AttendanceComponent, canActivate: [authGuard] },
  { path: 'leave', component: LeaveComponent, canActivate: [authGuard] },
  { path: 'approvals', component: ApprovalsComponent, canActivate: [authGuard] },
  { path: 'team', component: TeamComponent, canActivate: [authGuard] },
  { path: 'salary', component: PayrollComponent, canActivate: [authGuard] },
  { path: 'payroll', component: PayrollComponent, canActivate: [authGuard] },
  { path: 'travel-expenses', component: TravelExpenseComponent, canActivate: [authGuard] },
  { path: 'separation', component: SeparationComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
