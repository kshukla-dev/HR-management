import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { LeaveBalance, LeaveRequest, LeaveType, Employee } from '../../core/models';
import { 
  LucidePlus, LucideCalendarDays, 
  LucideHistory, LucideX, LucidePencil, LucideRotateCcw, LucideMessageSquare,
  LucideAlertCircle
} from '@lucide/angular';

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucidePlus,
    LucideCalendarDays,
    LucideHistory,
    LucideX,
    LucidePencil,
    LucideRotateCcw,
    LucideMessageSquare,
    LucideAlertCircle
  ],
  templateUrl: './leave.component.html'
})
export class LeaveComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  balances: LeaveBalance[] = [];
  requests: LeaveRequest[] = [];
  showApplyModal = false;
  selectedWorkflowReq: LeaveRequest | null = null;
  loading = true;
  myEmployee: Employee | null = null;

  leaveType: LeaveType = 'Casual Leave';
  startDate = new Date().toISOString().split('T')[0];
  endDate = new Date().toISOString().split('T')[0];
  reason = '';
  submitting = false;
  errorMsg = '';

  // Resubmit reverted leave state
  showResubmitModal = false;
  selectedRevertedReq: LeaveRequest | null = null;
  resubmitStartDate = '';
  resubmitEndDate = '';
  resubmitLeaveType: LeaveType = 'Casual Leave';
  resubmitReason = '';
  resubmitSubmitting = false;
  resubmitError = '';

  get calculatedDays(): number {
    const s = new Date(this.startDate);
    const e = new Date(this.endDate);
    const diffTime = e.getTime() - s.getTime();
    if (diffTime < 0) return 0;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  get selectedLeaveBalance(): LeaveBalance | undefined {
    return this.balances.find(b => b.leaveType === this.leaveType);
  }

  get selectedLeaveAvailable(): number {
    return this.selectedLeaveBalance ? this.selectedLeaveBalance.available : 0;
  }

  get isBalanceExhausted(): boolean {
    const bal = this.selectedLeaveBalance;
    return bal ? bal.available <= 0 : false;
  }

  get isExceedingBalance(): boolean {
    const bal = this.selectedLeaveBalance;
    if (!bal) return false;
    return this.calculatedDays > bal.available;
  }

  get remainingBalanceAfterLeave(): number {
    return Math.max(0, this.selectedLeaveAvailable - this.calculatedDays);
  }

  get resubmitSelectedBalance(): LeaveBalance | undefined {
    return this.balances.find(b => b.leaveType === this.resubmitLeaveType);
  }

  get resubmitSelectedAvailable(): number {
    return this.resubmitSelectedBalance ? this.resubmitSelectedBalance.available : 0;
  }

  get resubmitIsExhausted(): boolean {
    const bal = this.resubmitSelectedBalance;
    return bal ? bal.available <= 0 : false;
  }

  get resubmitIsExceeding(): boolean {
    const bal = this.resubmitSelectedBalance;
    if (!bal) return false;
    return this.resubmitCalculatedDays > bal.available;
  }

  get hasRevertedRequests(): boolean {
    return this.requests.some(r => r.status === 'Sent Back');
  }

  get revertedRequests(): LeaveRequest[] {
    return this.requests.filter(r => r.status === 'Sent Back');
  }

  get resubmitCalculatedDays(): number {
    if (!this.resubmitStartDate || !this.resubmitEndDate) return 0;
    const s = new Date(this.resubmitStartDate);
    const e = new Date(this.resubmitEndDate);
    const diffTime = e.getTime() - s.getTime();
    if (diffTime < 0) return 0;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  openApplyModal(): void {
    this.errorMsg = '';
    this.startDate = new Date().toISOString().split('T')[0];
    this.endDate = new Date().toISOString().split('T')[0];
    this.reason = '';

    // If current selected category has 0 balance, switch to first category with > 0 balance if possible
    const currentBal = this.selectedLeaveBalance;
    if (!currentBal || currentBal.available <= 0) {
      const available = this.balances.find(b => b.available > 0);
      if (available) {
        this.leaveType = available.leaveType;
      }
    }
    this.showApplyModal = true;
  }

  openResubmitModal(req: LeaveRequest): void {
    this.selectedRevertedReq = req;
    this.resubmitStartDate = req.startDate;
    this.resubmitEndDate = req.endDate;
    this.resubmitLeaveType = req.leaveType;
    this.resubmitReason = req.reason;
    this.resubmitError = '';
    this.showResubmitModal = true;
  }

  closeResubmitModal(): void {
    this.showResubmitModal = false;
    this.selectedRevertedReq = null;
    this.resubmitError = '';
  }

  async handleResubmit(): Promise<void> {
    if (!this.selectedRevertedReq) return;
    const days = this.resubmitCalculatedDays;
    if (days <= 0) {
      this.resubmitError = 'End date must be equal to or after start date.';
      return;
    }
    if (!this.resubmitReason.trim()) {
      this.resubmitError = 'Please state updated reason/explanation.';
      return;
    }

    if (this.resubmitSelectedAvailable <= 0) {
      this.resubmitError = `Cannot resubmit: 0 leave balance available for ${this.resubmitLeaveType}.`;
      return;
    }

    if (days > this.resubmitSelectedAvailable) {
      this.resubmitError = `Cannot resubmit: Requested ${days} days exceeds available balance (${this.resubmitSelectedAvailable} days) for ${this.resubmitLeaveType}.`;
      return;
    }

    const user = this.auth.currentUser();
    this.resubmitSubmitting = true;
    this.resubmitError = '';

    try {
      const res = await firstValueFrom(this.api.resubmitLeave(this.selectedRevertedReq.id, {
        startDate: this.resubmitStartDate,
        endDate: this.resubmitEndDate,
        leaveType: this.resubmitLeaveType,
        numberOfDays: days,
        reason: this.resubmitReason,
        actorName: user?.name
      }));

      if (res.success) {
        this.requests = this.requests.map(r => r.id === res.request.id ? res.request : r);
        this.closeResubmitModal();
        if (user?.employeeId) {
          const balRes = await firstValueFrom(this.api.getLeaveBalances(user.employeeId));
          if (balRes.success) this.balances = balRes.balances;
        }
      } else {
        this.resubmitError = 'Failed to resubmit leave application.';
      }
    } catch (err: any) {
      this.resubmitError = err.error?.message || err.message || 'Error resubmitting leave request';
    } finally {
      this.resubmitSubmitting = false;
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;
    this.loading = true;
    try {
      const [balRes, reqRes, empRes] = await Promise.all([
        firstValueFrom(this.api.getLeaveBalances(user.employeeId)),
        firstValueFrom(this.api.getLeaveRequests({ employeeId: user.employeeId })),
        user.employeeId ? firstValueFrom(this.api.getEmployeeById(user.employeeId)).catch(() => null) : Promise.resolve(null)
      ]);
      if (balRes.success) this.balances = balRes.balances;
      if (reqRes.success) this.requests = reqRes.requests;
      if (empRes && empRes.success) this.myEmployee = empRes.employee;
    } catch (err) {
      console.error('Failed to load leave data:', err);
    } finally {
      this.loading = false;
    }
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString();
  }

  formatTimestamp(ts: string): string {
    return new Date(ts).toLocaleString();
  }

  async handleApply(): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;
    const days = this.calculatedDays;
    if (days <= 0) {
      this.errorMsg = 'End date must be equal to or after start date.';
      return;
    }
    if (!this.reason.trim()) {
      this.errorMsg = 'Please state a reason for leave.';
      return;
    }

    if (this.selectedLeaveAvailable <= 0) {
      this.errorMsg = `Cannot apply: 0 leave balance available for ${this.leaveType}. Please choose another category.`;
      return;
    }

    if (days > this.selectedLeaveAvailable) {
      this.errorMsg = `Cannot apply: Requested ${days} days exceeds your available balance (${this.selectedLeaveAvailable} days) for ${this.leaveType}.`;
      return;
    }

    this.submitting = true;
    this.errorMsg = '';

    try {
      const res = await firstValueFrom(this.api.applyLeave({
        employeeId: user.employeeId,
        leaveType: this.leaveType,
        startDate: this.startDate,
        endDate: this.endDate,
        numberOfDays: days,
        reason: this.reason
      }));

      if (res.success) {
        this.requests = [res.request, ...this.requests];
        this.showApplyModal = false;
        this.reason = '';
        const balRes = await firstValueFrom(this.api.getLeaveBalances(user.employeeId));
        if (balRes.success) this.balances = balRes.balances;
      } else {
        this.errorMsg = 'Failed to apply leave';
      }
    } catch (err: any) {
      this.errorMsg = err.error?.message || err.message || 'Error submitting leave application';
    } finally {
      this.submitting = false;
    }
  }
}
