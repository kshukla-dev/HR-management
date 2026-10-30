import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SeparationRequest } from '../../core/models';
import { 
  LucideLogOut, LucideX 
} from '@lucide/angular';

@Component({
  selector: 'app-separation',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideLogOut, LucideX],
  templateUrl: './separation.component.html'
})
export class SeparationComponent implements OnInit {
  private api = inject(ApiService);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  separations = signal<SeparationRequest[]>([]);
  showApplyModal = signal<boolean>(false);
  reason = 'Career Growth / New Opportunity';
  proposedLwd = '2026-11-28';
  comments = '';
  submitting = signal<boolean>(false);
  loading = signal<boolean>(true);

  canClear() {
    const role = this.currentUser()?.role;
    return role === 'Super Admin' || role === 'HR Admin' || role === 'Finance';
  }

  canFinalizeExit() {
    const role = this.currentUser()?.role;
    return role === 'Super Admin' || role === 'HR Admin' || role === 'HR Executive';
  }

  ngOnInit() {
    this.loadSeparations();
  }

  loadSeparations() {
    this.loading.set(true);
    this.api.getSeparations().subscribe({
      next: (res) => {
        if (res.success) this.separations.set(res.separations);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  handleApplyResignation() {
    const user = this.currentUser();
    if (!user) return;
    this.submitting.set(true);

    this.api.applySeparation({
      employeeId: user.employeeId,
      reason: this.reason,
      proposedLwd: this.proposedLwd,
      comments: this.comments
    }).subscribe({
      next: (res) => {
        if (res.success && res.separation) {
          this.separations.update(prev => [res.separation, ...prev]);
          this.showApplyModal.set(false);
        }
        this.submitting.set(false);
      },
      error: (err) => {
        console.error('Failed to apply resignation:', err);
        this.submitting.set(false);
      }
    });
  }

  handleClearDepartment(sepId: string, department: string) {
    this.api.updateClearance(sepId, {
      department,
      status: 'Cleared',
      remarks: 'Verification completed and signed off.',
      actorName: this.currentUser()?.name || 'Authorized Officer'
    }).subscribe({
      next: (res) => {
        if (res.success && res.separation) {
          this.separations.update(prev => prev.map(s => s.id === sepId ? res.separation : s));
        }
      },
      error: (err) => console.error('Failed to update clearance:', err)
    });
  }

  handleFinalizeExit(sepId: string) {
    if (!confirm('Are you sure you want to finalize this exit? This will mark the employee as Terminated and permanently revoke their portal login access.')) {
      return;
    }
    this.api.finalizeSeparation(sepId, {
      actorName: this.currentUser()?.name || 'HR Admin',
      remarks: 'Exit clearance verified and portal login revoked.'
    }).subscribe({
      next: (res) => {
        if (res.success && res.separation) {
          this.separations.update(prev => prev.map(s => s.id === sepId ? res.separation : s));
        }
      },
      error: (err) => console.error('Failed to finalize separation:', err)
    });
  }
}
