import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Employee } from '../../core/models';
import { EmployeeDetailModalComponent } from './employee-detail-modal.component';
import { AddEmployeeModalComponent } from './add-employee-modal.component';
import {
  LucideDownload, LucideUserPlus, LucideSearch, LucideEye,
  LucidePencil, LucideTrash2, LucideShieldAlert,
  LucideUserX, LucideUserCheck, LucideRotateCcw, LucideMoreVertical
} from '@lucide/angular';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmployeeDetailModalComponent,
    AddEmployeeModalComponent,
    LucideDownload,
    LucideUserPlus,
    LucideSearch,
    LucideEye,
    LucidePencil,
    LucideTrash2,
    LucideShieldAlert,
    LucideUserX,
    LucideUserCheck,
    LucideRotateCcw,
    LucideMoreVertical
  ],
  templateUrl: './employee-list.component.html'
})
export class EmployeeListComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly api = inject(ApiService);

  employees: Employee[] = [];
  search = '';
  department = 'All';
  status = 'All';
  selectedEmployee: Employee | null = null;
  employeeToEdit: Employee | null = null;
  showAddModal = false;
  loading = true;
  openMenuId: string | null = null;

  toggleActionMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  closeActionMenu(): void {
    this.openMenuId = null;
  }

  // Deletion modal state
  deleteModalOpen = false;
  employeeToDelete: Employee | null = null;
  isDeleting = false;
  deleteError = '';

  get canAddEmployee(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'Super Admin' || role === 'HR Admin';
  }

  get canEditEmployee(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'Super Admin' || role === 'HR Admin';
  }

  get canDeleteEmployee(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'Super Admin' || role === 'HR Admin';
  }

  get canTerminateEmployee(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'Super Admin' || role === 'HR Admin' || role === 'HR Executive';
  }

  get canViewSalary(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'Super Admin' || role === 'HR Admin' || role === 'Payroll Admin';
  }

  // Termination modal state
  terminateModalOpen = false;
  employeeToTerminate: Employee | null = null;
  terminationActionType: 'terminate' | 'reactivate' = 'terminate';
  terminationReason = 'Resignation / Relieved';
  terminationRemarks = '';
  isTerminating = false;
  terminateError = '';

  isRestoring = false;

  async restoreDefaultEmployees(): Promise<void> {
    this.isRestoring = true;
    try {
      const res = await firstValueFrom(this.api.restoreDefaultEmployees());
      if (res.success) {
        await this.loadEmployees();
      }
    } catch (err) {
      console.error('Failed to restore default employees:', err);
    } finally {
      this.isRestoring = false;
    }
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  async loadEmployees(): Promise<void> {
    this.loading = true;
    try {
      const res = await firstValueFrom(this.api.getEmployees({
        q: this.search || undefined,
        department: this.department !== 'All' ? this.department : undefined,
        status: this.status !== 'All' ? this.status : undefined
      }));
      if (res.success) {
        this.employees = res.employees;
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      this.loading = false;
    }
  }

  openAddModal(): void {
    this.employeeToEdit = null;
    this.showAddModal = true;
  }

  openEditModal(emp: Employee): void {
    this.employeeToEdit = emp;
    this.showAddModal = true;
  }

  onEmployeeSaved(savedEmp: Employee): void {
    const exists = this.employees.some(e => e.id === savedEmp.id);
    if (exists) {
      this.employees = this.employees.map(e => e.id === savedEmp.id ? savedEmp : e);
      if (this.selectedEmployee?.id === savedEmp.id) {
        this.selectedEmployee = savedEmp;
      }
    } else {
      this.employees = [savedEmp, ...this.employees];
    }
    this.showAddModal = false;
    this.employeeToEdit = null;
  }

  onEmployeeUpdated(updated: Employee): void {
    this.employees = this.employees.map(e => e.id === updated.id ? updated : e);
    this.selectedEmployee = updated;
  }

  // --- Deletion Flow ---
  confirmDeleteEmployee(emp: Employee): void {
    this.employeeToDelete = emp;
    this.deleteError = '';
    this.deleteModalOpen = true;
  }

  cancelDelete(): void {
    this.employeeToDelete = null;
    this.deleteModalOpen = false;
    this.deleteError = '';
  }

  async executeDelete(): Promise<void> {
    if (!this.employeeToDelete) return;
    this.isDeleting = true;
    this.deleteError = '';

    try {
      const res = await firstValueFrom(this.api.deleteEmployee(this.employeeToDelete.id));
      if (res.success) {
        this.employees = this.employees.filter(e => e.id !== this.employeeToDelete!.id);
        if (this.selectedEmployee?.id === this.employeeToDelete.id) {
          this.selectedEmployee = null;
        }
        this.cancelDelete();
      } else {
        this.deleteError = res.message || 'Failed to delete employee record.';
      }
    } catch (err: any) {
      this.deleteError = err.message || 'Error deleting employee record.';
    } finally {
      this.isDeleting = false;
    }
  }

  // --- Termination / Revoke Access Flow ---
  confirmTerminateEmployee(emp: Employee): void {
    this.employeeToTerminate = emp;
    this.terminationActionType = 'terminate';
    this.terminationReason = 'Resignation / Relieved';
    this.terminationRemarks = '';
    this.terminateError = '';
    this.terminateModalOpen = true;
  }

  confirmReactivateEmployee(emp: Employee): void {
    this.employeeToTerminate = emp;
    this.terminationActionType = 'reactivate';
    this.terminationReason = 'Reinstated';
    this.terminationRemarks = 'Restoring active employment status and portal login access.';
    this.terminateError = '';
    this.terminateModalOpen = true;
  }

  cancelTerminate(): void {
    this.employeeToTerminate = null;
    this.terminateModalOpen = false;
    this.terminateError = '';
  }

  async executeTerminate(): Promise<void> {
    if (!this.employeeToTerminate) return;
    this.isTerminating = true;
    this.terminateError = '';

    try {
      const res = await firstValueFrom(this.api.terminateEmployee(this.employeeToTerminate.id, {
        reason: this.terminationReason,
        remarks: this.terminationRemarks,
        actionType: this.terminationActionType,
        performedBy: this.auth.currentUser()?.name || 'HR Admin'
      }));

      if (res.success && res.employee) {
        this.employees = this.employees.map(e => e.id === res.employee.id ? res.employee : e);
        if (this.selectedEmployee?.id === res.employee.id) {
          this.selectedEmployee = res.employee;
        }
        this.cancelTerminate();
      } else {
        this.terminateError = res.message || 'Action failed.';
      }
    } catch (err: any) {
      this.terminateError = err.error?.message || err.message || 'Error updating employee status.';
    } finally {
      this.isTerminating = false;
    }
  }
}
