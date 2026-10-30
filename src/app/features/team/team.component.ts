import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Employee } from '../../core/models';
import { EmployeeDetailModalComponent } from '../employees/employee-detail-modal.component';
import { 
  LucideMail, LucidePhone 
} from '@lucide/angular';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, LucideMail, LucidePhone, EmployeeDetailModalComponent],
  templateUrl: './team.component.html'
})
export class TeamComponent implements OnInit {
  private api = inject(ApiService);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  allEmployees = signal<Employee[]>([]);
  teamMembers = signal<Employee[]>([]);
  selectedEmp = signal<Employee | null>(null);
  loading = signal<boolean>(true);
  filterScope = signal<'all' | 'direct'>('all');

  canInspectProfile = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'Super Admin' || role === 'HR Admin' || role === 'HR Executive';
  });

  directReportsCount() {
    const user = this.currentUser();
    if (!user) return 0;
    return this.allEmployees().filter(e => 
      (e.reportingManagerId && e.reportingManagerId === user.employeeId) || 
      (e.reportingManagerName && e.reportingManagerName === user.name)
    ).length;
  }

  setScope(scope: 'all' | 'direct') {
    this.filterScope.set(scope);
    this.applyFilter();
  }

  ngOnInit() {
    this.loadTeam();
  }

  loadTeam() {
    this.loading.set(true);
    this.api.getEmployees({ limit: 100 }).subscribe({
      next: (res) => {
        if (res.success && res.employees) {
          this.allEmployees.set(res.employees);
          this.applyFilter();
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilter() {
    const user = this.currentUser();
    const all = this.allEmployees();
    const directReports = all.filter(e => 
      (e.reportingManagerId && e.reportingManagerId === user?.employeeId) || 
      (e.reportingManagerName && e.reportingManagerName === user?.name)
    );

    if (this.filterScope() === 'direct') {
      this.teamMembers.set(directReports);
    } else {
      this.teamMembers.set(all);
    }
  }

  onEmployeeUpdated(emp: Employee) {
    this.loadTeam();
    this.selectedEmp.set(null);
  }
}
