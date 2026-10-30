import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Employee, EmployeeKycDocument, CompanyIssuedDocument, KycDocumentCategory } from '../../core/models';
import {
  LucideMail, LucidePhone, LucideCalendar,
  LucideX, LucidePencil, LucideCamera, LucideCheck
} from '@lucide/angular';

type ProfileTab = 'personal' | 'employment' | 'salary' | 'documents';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideMail,
    LucidePhone,
    LucideCalendar,
    LucideX,
    LucidePencil,
    LucideCamera,
    LucideCheck
  ],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  currentUser = this.authService.currentUser;
  employee = signal<Employee | null>(null);
  activeTab = signal<ProfileTab>('personal');
  loading = signal<boolean>(true);

  // Document Management States
  docSection = signal<'kyc' | 'company'>('kyc');
  kycDocuments = signal<EmployeeKycDocument[]>([]);
  companyDocuments = signal<CompanyIssuedDocument[]>([]);
  loadingDocs = signal<boolean>(false);
  isUploadModalOpen = signal<boolean>(false);
  uploading = signal<boolean>(false);
  uploadSuccessMsg = signal<string>('');

  // Upload Form Fields
  uploadCategory = signal<KycDocumentCategory>('Aadhaar Card');
  uploadDocNumber = signal<string>('');
  uploadCustomName = signal<string>('');
  uploadFileName = signal<string>('');
  uploadFileSize = signal<string>('1.2 MB');
  uploadRemarks = signal<string>('');

  // Filter
  kycFilter = signal<string>('All');
  companyFilter = signal<string>('All');

  // Self-Service Profile Edit States
  isEditDetailsOpen = signal<boolean>(false);
  savingDetails = signal<boolean>(false);
  saveDetailsError = signal<string>('');
  saveDetailsSuccess = signal<string>('');
  editTab = signal<'personal' | 'address' | 'emergency'>('personal');

  // Edit fields
  editPhone = signal<string>('');
  editAvatarUrl = signal<string>('');
  editBloodGroup = signal<string>('B+');
  editMaritalStatus = signal<'Single' | 'Married' | 'Divorced'>('Single');
  editCurrentAddress = signal<string>('');
  editPermanentAddress = signal<string>('');
  editEmergencyName = signal<string>('');
  editEmergencyRelation = signal<string>('');
  editEmergencyPhone = signal<string>('');
  editEducation = signal<{ degree: string; institution: string; year: number; specialization: string }[]>([]);
  editSkills = signal<string[]>([]);
  newSkillInput = signal<string>('');

  readonly presetAvatars = [
    { label: 'Corporate 1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { label: 'Executive 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { label: 'Director 3', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { label: 'Lead 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { label: 'Senior 5', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
    { label: 'Specialist 6', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
    { label: 'Analyst 7', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
    { label: 'Officer 8', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' }
  ];

  kycCategories: KycDocumentCategory[] = [
    'Aadhaar Card',
    'PAN Card',
    'Bank Passbook / Cheque',
    'Passport / Voter ID',
    'Degree / Educational Certificate',
    'Previous Relieving / Experience Letter',
    'Other KYC Document'
  ];

  tabs: { id: ProfileTab; label: string }[] = [
    { id: 'personal', label: 'Personal & Contact' },
    { id: 'employment', label: 'Job & Organizational' },
    { id: 'salary', label: 'Compensation & Benefits' },
    { id: 'documents', label: 'Documents & Records' }
  ];

  ngOnInit() {
    if (this.route.snapshot.routeConfig?.path === 'documents' || window.location.pathname.includes('/documents')) {
      this.activeTab.set('documents');
    }
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'documents') {
        this.activeTab.set('documents');
      }
      if (params['sec'] === 'company') {
        this.docSection.set('company');
      }
    });
    this.loadProfile();
  }

  loadProfile() {
    const user = this.currentUser();
    if (!user) return;
    this.loading.set(true);
    this.api.getEmployeeById(user.employeeId).subscribe({
      next: (res) => {
        if (res.success) {
          this.employee.set(res.employee);
          this.loadDocuments(res.employee.id);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadDocuments(empId: string) {
    this.loadingDocs.set(true);
    this.api.getEmployeeDocuments(empId).subscribe({
      next: (res) => {
        if (res.success) {
          this.kycDocuments.set(res.kycDocuments || []);
          this.companyDocuments.set(res.companyDocuments || []);
        }
        this.loadingDocs.set(false);
      },
      error: () => this.loadingDocs.set(false)
    });
  }

  // Filtered lists
  get filteredKycDocs(): EmployeeKycDocument[] {
    const f = this.kycFilter();
    const list = this.kycDocuments();
    if (f === 'All') return list;
    return list.filter(d => d.status === f);
  }

  get filteredCompanyDocs(): CompanyIssuedDocument[] {
    const f = this.companyFilter();
    const list = this.companyDocuments();
    if (f === 'All') return list;
    return list.filter(d => d.category.toLowerCase().includes(f.toLowerCase()));
  }

  countByStatus(status: string): number {
    return this.kycDocuments().filter(d => d.status === status).length;
  }

  hasCategory(cat: string): boolean {
    return this.kycDocuments().some(d => d.category === cat);
  }

  // Upload modal handlers
  openUploadModal(presetCategory?: KycDocumentCategory) {
    if (presetCategory) {
      this.uploadCategory.set(presetCategory);
    }
    this.uploadDocNumber.set('');
    this.uploadCustomName.set('');
    this.uploadFileName.set(`${this.uploadCategory().replace(/[^a-zA-Z0-9]/g, '_')}_document.pdf`);
    this.uploadFileSize.set('1.4 MB');
    this.uploadRemarks.set('');
    this.uploadSuccessMsg.set('');
    this.isUploadModalOpen.set(true);
  }

  closeUploadModal() {
    this.isUploadModalOpen.set(false);
  }

  onCategoryChange(cat: KycDocumentCategory) {
    this.uploadCategory.set(cat);
    if (!this.uploadCustomName()) {
      this.uploadFileName.set(`${cat.replace(/[^a-zA-Z0-9]/g, '_')}_document.pdf`);
    }
  }

  onFileSelected(event: any) {
    const file = event.target?.files?.[0];
    if (file) {
      this.uploadFileName.set(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      this.uploadFileSize.set(file.size > 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`);
    }
  }

  submitKycUpload() {
    const emp = this.employee();
    if (!emp) return;

    const cat = this.uploadCategory();
    const name = this.uploadCustomName() || this.uploadFileName() || `${cat}.pdf`;

    this.uploading.set(true);
    this.api.uploadEmployeeKycDocument(emp.id, {
      category: cat,
      name,
      documentNumber: this.uploadDocNumber(),
      fileSize: this.uploadFileSize(),
      remarks: this.uploadRemarks()
    }).subscribe({
      next: (res) => {
        this.uploading.set(false);
        if (res.success) {
          this.uploadSuccessMsg.set(`"${name}" successfully uploaded and queued for HR verification.`);
          this.loadDocuments(emp.id);
          setTimeout(() => {
            this.closeUploadModal();
          }, 1200);
        }
      },
      error: () => this.uploading.set(false)
    });
  }

  deleteKycDocument(docId: string) {
    const emp = this.employee();
    if (!emp) return;
    if (!confirm('Are you sure you want to remove this uploaded document?')) return;

    this.api.deleteEmployeeKycDocument(emp.id, docId).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadDocuments(emp.id);
        }
      }
    });
  }

  downloadDocument(docId: string, filename?: string) {
    const link = document.createElement('a');
    link.href = `/api/documents/download/${docId}`;
    link.download = filename || `document_${docId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- Self-Service Edit Details Handlers ---
  openEditDetailsModal(section: 'personal' | 'address' | 'emergency' = 'personal') {
    const emp = this.employee();
    if (!emp) return;
    this.editPhone.set(emp.phone || '');
    this.editAvatarUrl.set(emp.avatarUrl || this.presetAvatars[0].url);
    this.editBloodGroup.set(emp.bloodGroup || 'B+');
    this.editMaritalStatus.set(emp.maritalStatus || 'Single');
    this.editCurrentAddress.set(emp.currentAddress || '');
    this.editPermanentAddress.set(emp.permanentAddress || '');
    this.editEmergencyName.set(emp.emergencyContactName || '');
    this.editEmergencyRelation.set(emp.emergencyContactRelation || '');
    this.editEmergencyPhone.set(emp.emergencyContactPhone || '');
    this.editEducation.set(emp.education ? emp.education.map(e => ({ ...e })) : []);
    this.editSkills.set(emp.skills ? [...emp.skills] : []);
    this.newSkillInput.set('');
    this.saveDetailsError.set('');
    this.saveDetailsSuccess.set('');
    this.editTab.set(section);
    this.isEditDetailsOpen.set(true);
  }

  closeEditDetailsModal() {
    this.isEditDetailsOpen.set(false);
    this.saveDetailsError.set('');
    this.saveDetailsSuccess.set('');
  }

  onSelfPhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.saveDetailsError.set('Image size should be less than 5 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.editAvatarUrl.set(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  selectPresetPhoto(url: string) {
    this.editAvatarUrl.set(url);
  }

  addEducationRow() {
    this.editEducation.update(list => [
      ...list,
      { degree: 'B.Tech / B.E.', institution: '', year: new Date().getFullYear(), specialization: '' }
    ]);
  }

  removeEducationRow(index: number) {
    this.editEducation.update(list => list.filter((_, i) => i !== index));
  }

  addSkill() {
    const val = this.newSkillInput().trim();
    if (val && !this.editSkills().includes(val)) {
      this.editSkills.update(skills => [...skills, val]);
      this.newSkillInput.set('');
    }
  }

  removeSkill(index: number) {
    this.editSkills.update(skills => skills.filter((_, i) => i !== index));
  }

  saveEmployeeDetails() {
    const emp = this.employee();
    if (!emp) return;

    this.savingDetails.set(true);
    this.saveDetailsError.set('');
    this.saveDetailsSuccess.set('');

    const payload: Partial<Employee> = {
      phone: this.editPhone(),
      avatarUrl: this.editAvatarUrl(),
      bloodGroup: this.editBloodGroup(),
      maritalStatus: this.editMaritalStatus(),
      currentAddress: this.editCurrentAddress(),
      permanentAddress: this.editPermanentAddress(),
      emergencyContactName: this.editEmergencyName(),
      emergencyContactRelation: this.editEmergencyRelation(),
      emergencyContactPhone: this.editEmergencyPhone(),
      education: this.editEducation().filter(e => e.degree && e.institution),
      skills: this.editSkills()
    };

    this.api.updateEmployee(emp.id, payload).subscribe({
      next: (res) => {
        this.savingDetails.set(false);
        if (res.success && res.employee) {
          this.employee.set(res.employee);
          this.saveDetailsSuccess.set('Your profile details were updated successfully!');
          setTimeout(() => {
            this.closeEditDetailsModal();
          }, 1000);
        } else {
          this.saveDetailsError.set('Failed to save profile changes.');
        }
      },
      error: (err) => {
        this.savingDetails.set(false);
        this.saveDetailsError.set(err.message || 'An error occurred while updating profile.');
      }
    });
  }
}
