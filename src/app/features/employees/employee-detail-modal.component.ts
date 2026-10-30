import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Employee, EmployeeKycDocument, CompanyIssuedDocument } from '../../core/models';
import {
  LucideX, LucideMail, LucidePhone, LucideFileText, LucidePencil,
  LucideTrash2, LucideUserX, LucideUserCheck
} from '@lucide/angular';

@Component({
  selector: 'app-employee-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideX,
    LucideMail,
    LucidePhone,
    LucidePencil,
    LucideTrash2,
    LucideUserX,
    LucideUserCheck
  ],
  templateUrl: './employee-detail-modal.component.html'
})
export class EmployeeDetailModalComponent implements OnInit {
  @Input({ required: true }) employee!: Employee;
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<Employee>();
  @Output() edit = new EventEmitter<Employee>();
  @Output() delete = new EventEmitter<Employee>();
  @Output() terminate = new EventEmitter<Employee>();
  @Output() reactivate = new EventEmitter<Employee>();

  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  activeTab: 'personal' | 'employment' | 'salary' | 'documents' = 'personal';
  isEditingManager = false;
  managerList: Employee[] = [];
  selectedManagerId = '';
  savingManager = false;
  currentEmp!: Employee;

  // Documents State
  docSubTab: 'kyc' | 'company' = 'kyc';
  kycDocuments: EmployeeKycDocument[] = [];
  companyDocuments: CompanyIssuedDocument[] = [];
  loadingDocs = false;
  kycFilter = 'All';
  companyFilter = 'All';

  // Verification dialog
  verifyingDoc: EmployeeKycDocument | null = null;
  verifyAction: 'Verified' | 'Rejected' = 'Verified';
  verificationRemarks = '';
  isSubmittingVerification = false;

  // Issue Company Doc dialog
  isIssueModalOpen = false;
  issueCategory = 'Form 16 / Tax Document';
  issueTitle = '';
  issueFinancialYear = '2024-2025';
  issueValidUntil = 'Permanent';
  issueDescription = '';
  issueDepartment = 'Human Resources & Finance';
  isSubmittingIssue = false;

  companyCategories = [
    'Form 16 / Tax Document',
    'Medical & Health Insurance',
    'Appraisal / Increment Letter',
    'Appointment / Contract',
    'Relieving / Experience Certificate',
    'Company Policy / NDA'
  ];

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

  get canEditManager(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'Super Admin' || role === 'HR Admin';
  }

  get canViewSalary(): boolean {
    const user = this.auth.currentUser();
    const role = user?.role;
    return role === 'Super Admin' || role === 'HR Admin' || role === 'Payroll Admin' || user?.employeeId === this.employee?.id;
  }

  get canManageDocs(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'Super Admin' || role === 'HR Admin' || role === 'HR Executive' || role === 'Payroll Admin';
  }

  get filteredKycDocs(): EmployeeKycDocument[] {
    if (this.kycFilter === 'All') return this.kycDocuments;
    return this.kycDocuments.filter(d => d.status === this.kycFilter);
  }

  get filteredCompanyDocs(): CompanyIssuedDocument[] {
    if (this.companyFilter === 'All') return this.companyDocuments;
    return this.companyDocuments.filter(d => d.category.toLowerCase().includes(this.companyFilter.toLowerCase()));
  }

  ngOnInit(): void {
    this.currentEmp = { ...this.employee };
    this.selectedManagerId = this.currentEmp.reportingManagerId;
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loadingDocs = true;
    this.api.getEmployeeDocuments(this.currentEmp.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.kycDocuments = res.kycDocuments || [];
          this.companyDocuments = res.companyDocuments || [];
          this.currentEmp.documents = this.kycDocuments;
          this.currentEmp.companyDocuments = this.companyDocuments;
        }
        this.loadingDocs = false;
      },
      error: () => {
        this.loadingDocs = false;
      }
    });
  }

  countKyc(status: string): number {
    return this.kycDocuments.filter(d => d.status === status).length;
  }

  // Verification Handlers
  openVerifyDialog(doc: EmployeeKycDocument, action: 'Verified' | 'Rejected'): void {
    this.verifyingDoc = doc;
    this.verifyAction = action;
    this.verificationRemarks = action === 'Verified'
      ? 'Document verified and approved against government records.'
      : 'Document rejected due to illegible scan / mismatch. Please re-upload clear copy.';
  }

  closeVerifyDialog(): void {
    this.verifyingDoc = null;
    this.verificationRemarks = '';
  }

  submitVerification(): void {
    if (!this.verifyingDoc) return;
    this.isSubmittingVerification = true;
    const reviewer = this.auth.currentUser()?.name || 'HR Administrator';

    this.api.verifyEmployeeKycDocument(this.currentEmp.id, this.verifyingDoc.id, {
      status: this.verifyAction,
      remarks: this.verificationRemarks,
      reviewerName: reviewer
    }).subscribe({
      next: (res) => {
        this.isSubmittingVerification = false;
        if (res.success) {
          this.closeVerifyDialog();
          this.loadDocuments();
        }
      },
      error: () => {
        this.isSubmittingVerification = false;
      }
    });
  }

  // Issue Company Doc Handlers
  openIssueDialog(): void {
    this.issueCategory = 'Form 16 / Tax Document';
    this.issueTitle = `Form 16 (Part A & B) - AY 2025-26`;
    this.issueFinancialYear = '2024-2025';
    this.issueValidUntil = 'Permanent';
    this.issueDescription = `Annual Tax Withholding Certificate for ${this.currentEmp.firstName} ${this.currentEmp.lastName} under IT Act Section 203.`;
    this.issueDepartment = 'Finance & Payroll Department';
    this.isIssueModalOpen = true;
  }

  onIssueCategoryChange(cat: string): void {
    this.issueCategory = cat;
    if (cat.includes('Form 16')) {
      this.issueTitle = `Form 16 (Part A & B) - AY 2025-26`;
      this.issueFinancialYear = '2024-2025';
      this.issueValidUntil = 'Permanent';
    } else if (cat.includes('Medical')) {
      this.issueTitle = `Group Health Insurance Cashless E-Card`;
      this.issueFinancialYear = '2025-2026';
      this.issueValidUntil = '31-Mar-2026';
    } else if (cat.includes('Appraisal')) {
      this.issueTitle = `Annual CTC Revision & Appraisal Letter 2025`;
      this.issueFinancialYear = '2025-2026';
      this.issueValidUntil = '31-Mar-2026';
    } else if (cat.includes('Appointment')) {
      this.issueTitle = `Official Appointment Letter & Service Agreement`;
      this.issueValidUntil = 'Permanent';
    } else {
      this.issueTitle = `${cat} - ${this.currentEmp.firstName} ${this.currentEmp.lastName}`;
    }
  }

  closeIssueDialog(): void {
    this.isIssueModalOpen = false;
  }

  submitIssueCompanyDoc(): void {
    if (!this.issueTitle) return;
    this.isSubmittingIssue = true;

    this.api.issueCompanyDocument(this.currentEmp.id, {
      category: this.issueCategory,
      title: this.issueTitle,
      financialYear: this.issueFinancialYear,
      validUntil: this.issueValidUntil,
      issuedBy: this.issueDepartment,
      description: this.issueDescription,
      fileSize: '1.4 MB'
    }).subscribe({
      next: (res) => {
        this.isSubmittingIssue = false;
        if (res.success) {
          this.closeIssueDialog();
          this.loadDocuments();
        }
      },
      error: () => {
        this.isSubmittingIssue = false;
      }
    });
  }

  deleteCompanyDoc(docId: string): void {
    if (!confirm('Are you sure you want to remove this issued company document?')) return;
    this.api.deleteCompanyDocument(this.currentEmp.id, docId).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadDocuments();
        }
      }
    });
  }

  downloadDoc(docId: string, filename?: string): void {
    const link = document.createElement('a');
    link.href = `/api/documents/download/${docId}`;
    link.download = filename || `document_${docId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async handleStartEditManager(): Promise<void> {
    this.isEditingManager = true;
    if (this.managerList.length === 0) {
      try {
        const res = await firstValueFrom(this.api.getEmployees({ limit: 100 }));
        if (res.success && res.employees) {
          this.managerList = res.employees.filter(e => e.id !== this.currentEmp.id);
        }
      } catch (err) {
        console.error('Failed to load managers:', err);
      }
    }
  }

  async handleSaveManager(): Promise<void> {
    if (!this.selectedManagerId) return;
    this.savingManager = true;
    try {
      const selectedMgr = this.managerList.find(m => m.id === this.selectedManagerId);
      const mgrName = selectedMgr ? `${selectedMgr.firstName} ${selectedMgr.lastName}` : this.currentEmp.reportingManagerName;
      const res = await firstValueFrom(this.api.updateEmployee(this.currentEmp.id, {
        reportingManagerId: this.selectedManagerId,
        reportingManagerName: mgrName
      }));
      if (res.success && res.employee) {
        this.currentEmp = res.employee;
        this.update.emit(res.employee);
        this.isEditingManager = false;
      }
    } catch (err) {
      console.error('Failed to update reporting manager:', err);
    } finally {
      this.savingManager = false;
    }
  }
}
