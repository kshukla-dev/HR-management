import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaveRequest, AttendanceRecord, TravelExpenseRequest, SeparationRequest } from '../../core/models';
import { 
  LucideCornerUpLeft, LucideX, LucideCheck, LucideCalendar 
} from '@lucide/angular';

interface ActionItem {
  id: string;
  type: 'leave' | 'reg' | 'expense' | 'separation';
  action: 'Approved' | 'Rejected' | 'Sent Back';
  title: string;
}

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideCornerUpLeft, LucideX, LucideCheck, LucideCalendar],
  templateUrl: './approvals.component.html'
})
export class ApprovalsComponent implements OnInit {
  private api = inject(ApiService);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  activeCategory = signal<'leaves' | 'regularizations' | 'expenses' | 'separations'>('regularizations');
  managerScope = signal<'my_reportees' | 'all'>('my_reportees');
  selectedMonth = signal<string>('All');

  pendingLeaves = signal<LeaveRequest[]>([]);
  pendingRegs = signal<AttendanceRecord[]>([]);
  pendingExpenses = signal<TravelExpenseRequest[]>([]);
  pendingSeparations = signal<SeparationRequest[]>([]);
  loading = signal<boolean>(true);

  actionItem = signal<ActionItem | null>(null);
  actionComment = '';
  submittingAction = signal<boolean>(false);

  availableMonths = [
    { value: 'All', label: 'All Months' },
    { value: '2026-10', label: 'October 2026' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-07', label: 'July 2026' }
  ];

  filteredLeaves = computed(() => {
    const list = this.pendingLeaves();
    const m = this.selectedMonth();
    if (m === 'All') return list;
    return list.filter(l => (l.startDate && l.startDate.startsWith(m)) || (l.appliedDate && l.appliedDate.startsWith(m)));
  });

  filteredRegs = computed(() => {
    const list = this.pendingRegs();
    const m = this.selectedMonth();
    if (m === 'All') return list;
    return list.filter(r => r.date && r.date.startsWith(m));
  });

  filteredExpenses = computed(() => {
    const list = this.pendingExpenses();
    const m = this.selectedMonth();
    if (m === 'All') return list;
    return list.filter(e => e.date && e.date.startsWith(m));
  });

  filteredSeparations = computed(() => {
    const list = this.pendingSeparations();
    const m = this.selectedMonth();
    if (m === 'All') return list;
    return list.filter(s => (s.officialLwd && s.officialLwd.startsWith(m)) || (s.resignationDate && s.resignationDate.startsWith(m)));
  });

  totalPending = computed(() => {
    return this.filteredLeaves().length + this.filteredRegs().length + this.filteredExpenses().length + this.filteredSeparations().length;
  });

  ngOnInit() {
    this.loadPending();
  }

  setScope(scope: 'my_reportees' | 'all') {
    this.managerScope.set(scope);
    this.loadPending();
  }

  setMonth(month: string) {
    this.selectedMonth.set(month);
  }

  formatDate(dateStr: string) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  }

  setActionItem(item: ActionItem) {
    this.actionItem.set(item);
    this.actionComment = '';
  }

  loadPending() {
    const user = this.currentUser();
    if (!user) return;
    this.loading.set(true);

    const isManager = user.role === 'Manager';
    const role = isManager ? 'Reporting Manager' : 'HR Admin';
    const managerId = isManager || this.managerScope() === 'my_reportees' ? user.employeeId : undefined;

    this.api.getPendingApprovals(role, managerId).subscribe({
      next: (res) => {
        if (res.success && res.pending) {
          this.pendingLeaves.set(res.pending.leaves || []);
          this.pendingRegs.set(res.pending.regularizations || []);
          this.pendingExpenses.set(res.pending.expenses || []);
          this.pendingSeparations.set(res.pending.separations || []);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load pending approvals:', err);
        this.loading.set(false);
      }
    });
  }

  handleActionConfirm() {
    const item = this.actionItem();
    const user = this.currentUser();
    if (!item || !user) return;

    this.submittingAction.set(true);
    if (item.type === 'leave') {
      this.api.actionLeave(item.id, {
        action: item.action,
        comment: this.actionComment,
        actorName: user.name
      }).subscribe({
        next: () => {
          this.pendingLeaves.update(list => list.filter(l => l.id !== item.id));
          this.finishAction();
        },
        error: (err) => {
          console.error(err);
          this.submittingAction.set(false);
        }
      });
    } else if (item.type === 'reg') {
      this.api.actionRegularization(item.id, item.action, this.actionComment).subscribe({
        next: () => {
          this.pendingRegs.update(list => list.filter(r => r.regularization?.id !== item.id));
          this.finishAction();
        },
        error: (err) => {
          console.error(err);
          this.submittingAction.set(false);
        }
      });
    } else if (item.type === 'expense') {
      this.api.actionTravelExpense(item.id, item.action === 'Approved' ? 'Approve' : 'Reject').subscribe({
        next: () => {
          this.pendingExpenses.update(list => list.filter(e => e.id !== item.id));
          this.finishAction();
        },
        error: (err) => {
          console.error(err);
          this.submittingAction.set(false);
        }
      });
    }
  }

  private finishAction() {
    this.actionItem.set(null);
    this.actionComment = '';
    this.submittingAction.set(false);
  }
}
