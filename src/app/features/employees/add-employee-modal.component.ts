import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Employee } from '../../core/models';
import { 
  LucideX, LucideUserCheck, LucideShieldAlert,
  LucideCamera, LucideUpload, LucideCheck 
} from '@lucide/angular';

interface EducationItem {
  degree: string;
  institution: string;
  year: number;
  specialization: string;
}

@Component({
  selector: 'app-add-employee-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideX,
    LucideUserCheck,
    LucideShieldAlert,
    LucideCamera,
    LucideUpload,
    LucideCheck
  ],
  templateUrl: './add-employee-modal.component.html'
})
export class AddEmployeeModalComponent implements OnInit {
  @Input() employeeToEdit: Employee | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<Employee>();

  private readonly api = inject(ApiService);

  activeTab: 'basic' | 'job' | 'salary' | 'address' = 'basic';

  get isEditMode(): boolean {
    return !!this.employeeToEdit;
  }

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

  formData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Information Technology',
    designation: 'Software Engineer',
    location: 'Bangalore',
    employmentType: 'Full-Time' as 'Full-Time' | 'Part-Time' | 'Contract' | 'Probation' | 'Intern',
    employmentStatus: 'Active' as 'Active' | 'Probation' | 'Notice Period' | 'Separated' | 'Terminated',
    joiningDate: new Date().toISOString().split('T')[0],
    reportingManagerId: '',
    reportingManagerName: '',
    costCenter: 'CC-TECH-01',
    company: 'Jackson & Frank',
    businessUnit: 'Global Digital Platform',
    subDepartment: 'Core Products',
    division: 'R&D',
    branch: 'Bangalore Tech Park',
    jobLevel: 'L3',
    grade: 'E2',
    band: 'Band 2',
    dateOfBirth: '1998-05-20',
    gender: 'Male' as 'Female' | 'Male' | 'Other' | 'Prefer not to say',
    bloodGroup: 'B+',
    maritalStatus: 'Single' as 'Single' | 'Married' | 'Divorced',
    currentAddress: 'Bangalore, Karnataka',
    permanentAddress: 'India',
    emergencyContactName: 'Family Contact',
    emergencyContactRelation: 'Parent',
    emergencyContactPhone: '+91 99999 88888',
    // Compensation & Banking
    ctcAnnual: 1500000,
    basicMonthly: 50000,
    hraMonthly: 25000,
    specialAllowance: 50000,
    pfMonthly: 6000,
    professionalTax: 200,
    bankName: 'HDFC Bank',
    accountNumber: '',
    ifscCode: 'HDFC0001042',
    paymentMode: 'Bank Transfer',
    panNumber: '',
    aadhaarNumber: '',
    uanNumber: ''
  };

  educationList: EducationItem[] = [
    { degree: 'B.Tech / B.E.', institution: 'State Engineering College', year: 2020, specialization: 'Information Technology' }
  ];

  skillsList: string[] = ['TypeScript', 'Angular', 'SQL', 'Git'];
  newSkillInput = '';

  managerList: Employee[] = [];
  loadingManagers = true;
  isSubmitting = false;
  error = '';

  ngOnInit(): void {
    if (this.employeeToEdit) {
      const emp = this.employeeToEdit;
      this.formData = {
        firstName: emp.firstName || '',
        lastName: emp.lastName || '',
        email: emp.email || '',
        phone: emp.phone || '',
        avatarUrl: emp.avatarUrl || this.presetAvatars[0].url,
        department: emp.department || 'Information Technology',
        designation: emp.designation || 'Software Engineer',
        location: emp.location || 'Bangalore',
        employmentType: emp.employmentType || 'Full-Time',
        employmentStatus: emp.employmentStatus || 'Active',
        joiningDate: emp.joiningDate || new Date().toISOString().split('T')[0],
        reportingManagerId: emp.reportingManagerId || '',
        reportingManagerName: emp.reportingManagerName || '',
        costCenter: emp.costCenter || 'CC-TECH-01',
        company: emp.company || 'Jackson & Frank',
        businessUnit: emp.businessUnit || 'Global Digital Platform',
        subDepartment: emp.subDepartment || 'Core Products',
        division: emp.division || 'R&D',
        branch: emp.branch || 'Bangalore Tech Park',
        jobLevel: emp.jobLevel || 'L3',
        grade: emp.grade || 'E2',
        band: emp.band || 'Band 2',
        dateOfBirth: emp.dateOfBirth || '1998-05-20',
        gender: emp.gender || 'Male',
        bloodGroup: emp.bloodGroup || 'B+',
        maritalStatus: emp.maritalStatus || 'Single',
        currentAddress: emp.currentAddress || '',
        permanentAddress: emp.permanentAddress || '',
        emergencyContactName: emp.emergencyContactName || '',
        emergencyContactRelation: emp.emergencyContactRelation || '',
        emergencyContactPhone: emp.emergencyContactPhone || '',
        // Compensation & Banking
        ctcAnnual: emp.salary?.ctcAnnual || 1500000,
        basicMonthly: emp.salary?.basicMonthly || 50000,
        hraMonthly: emp.salary?.hraMonthly || 25000,
        specialAllowance: emp.salary?.specialAllowance || 50000,
        pfMonthly: emp.salary?.pfMonthly || 6000,
        professionalTax: emp.salary?.professionalTax || 200,
        bankName: emp.salary?.bankName || 'HDFC Bank',
        accountNumber: emp.salary?.accountNumber || '',
        ifscCode: emp.salary?.ifscCode || 'HDFC0001042',
        paymentMode: emp.salary?.paymentMode || 'Bank Transfer',
        panNumber: emp.salary?.panNumber || '',
        aadhaarNumber: emp.salary?.aadhaarNumber || '',
        uanNumber: emp.salary?.uanNumber || ''
      };

      if (emp.education && emp.education.length > 0) {
        this.educationList = emp.education.map(e => ({ ...e }));
      }
      if (emp.skills && emp.skills.length > 0) {
        this.skillsList = [...emp.skills];
      }
    } else {
      this.autoCalculateBreakdown();
    }

    this.loadManagers();
  }

  async loadManagers(): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.getEmployees({ limit: 100 }));
      if (res.success && res.employees) {
        // Exclude current employee from manager list if in edit mode
        this.managerList = this.employeeToEdit
          ? res.employees.filter(m => m.id !== this.employeeToEdit!.id)
          : res.employees;

        if (!this.formData.reportingManagerId && this.managerList.length > 0) {
          const defaultMgr = this.managerList.find(e =>
            e.designation.toLowerCase().includes('director') ||
            e.designation.toLowerCase().includes('manager') ||
            e.designation.toLowerCase().includes('vp') ||
            e.designation.toLowerCase().includes('lead')
          ) || this.managerList[0];

          if (defaultMgr) {
            this.formData.reportingManagerId = defaultMgr.id;
            this.formData.reportingManagerName = `${defaultMgr.firstName} ${defaultMgr.lastName}`;
          }
        }
      }
    } catch (err) {
      console.error('Failed to load manager list:', err);
    } finally {
      this.loadingManagers = false;
    }
  }

  onManagerChange(id: string): void {
    const sel = this.managerList.find(m => m.id === id);
    this.formData.reportingManagerId = id;
    this.formData.reportingManagerName = sel ? `${sel.firstName} ${sel.lastName}` : '';
  }

  // --- Photo Handling ---
  onPhotoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Image size should be less than 5 MB.';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.formData.avatarUrl = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  selectPresetAvatar(url: string): void {
    this.formData.avatarUrl = url;
  }

  // --- Education Management ---
  addEducationRow(): void {
    this.educationList.push({
      degree: 'B.Tech / B.E.',
      institution: '',
      year: new Date().getFullYear(),
      specialization: ''
    });
  }

  removeEducationRow(index: number): void {
    if (this.educationList.length <= 1) {
      this.educationList = [{ degree: '', institution: '', year: new Date().getFullYear(), specialization: '' }];
      return;
    }
    this.educationList.splice(index, 1);
  }

  // --- Skills Management ---
  addSkill(): void {
    const val = this.newSkillInput.trim();
    if (val && !this.skillsList.includes(val)) {
      this.skillsList.push(val);
      this.newSkillInput = '';
    }
  }

  removeSkill(index: number): void {
    this.skillsList.splice(index, 1);
  }

  // --- Salary Breakdown Auto Calculation ---
  autoCalculateBreakdown(): void {
    const annual = Number(this.formData.ctcAnnual) || 0;
    const monthlyGross = Math.round(annual / 12);
    this.formData.basicMonthly = Math.round(monthlyGross * 0.4); // 40%
    this.formData.hraMonthly = Math.round(this.formData.basicMonthly * 0.5); // 50% of Basic
    this.formData.pfMonthly = Math.min(1800, Math.round(this.formData.basicMonthly * 0.12));
    this.formData.professionalTax = 200;
    this.formData.specialAllowance = Math.max(0, monthlyGross - this.formData.basicMonthly - this.formData.hraMonthly);
  }

  // --- Submission ---
  async handleSubmit(): Promise<void> {
    if (!this.formData.firstName || !this.formData.lastName || !this.formData.email) {
      this.activeTab = 'basic';
      this.error = 'Please provide first name, last name, and official email.';
      return;
    }
    if (!this.formData.reportingManagerId) {
      this.activeTab = 'job';
      this.error = 'Please assign a Reporting Manager who will review and approve leaves.';
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    const payload: Partial<Employee> = {
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      email: this.formData.email,
      phone: this.formData.phone,
      avatarUrl: this.formData.avatarUrl,
      company: this.formData.company,
      businessUnit: this.formData.businessUnit,
      department: this.formData.department,
      subDepartment: this.formData.subDepartment,
      division: this.formData.division,
      branch: this.formData.branch,
      location: this.formData.location,
      designation: this.formData.designation,
      jobLevel: this.formData.jobLevel,
      grade: this.formData.grade,
      band: this.formData.band,
      employmentType: this.formData.employmentType,
      employmentStatus: this.formData.employmentStatus,
      joiningDate: this.formData.joiningDate,
      reportingManagerId: this.formData.reportingManagerId,
      reportingManagerName: this.formData.reportingManagerName,
      costCenter: this.formData.costCenter,
      dateOfBirth: this.formData.dateOfBirth,
      gender: this.formData.gender,
      bloodGroup: this.formData.bloodGroup,
      maritalStatus: this.formData.maritalStatus,
      currentAddress: this.formData.currentAddress,
      permanentAddress: this.formData.permanentAddress,
      emergencyContactName: this.formData.emergencyContactName,
      emergencyContactRelation: this.formData.emergencyContactRelation,
      emergencyContactPhone: this.formData.emergencyContactPhone,
      education: this.educationList.filter(e => e.degree && e.institution),
      skills: this.skillsList,
      salary: {
        ctcAnnual: Number(this.formData.ctcAnnual),
        basicMonthly: Number(this.formData.basicMonthly),
        hraMonthly: Number(this.formData.hraMonthly),
        specialAllowance: Number(this.formData.specialAllowance),
        pfMonthly: Number(this.formData.pfMonthly),
        professionalTax: Number(this.formData.professionalTax),
        effectiveDate: this.formData.joiningDate,
        bankName: this.formData.bankName,
        accountNumber: this.formData.accountNumber,
        ifscCode: this.formData.ifscCode,
        paymentMode: this.formData.paymentMode,
        panNumber: this.formData.panNumber,
        aadhaarNumber: this.formData.aadhaarNumber,
        uanNumber: this.formData.uanNumber
      }
    };

    try {
      if (this.isEditMode && this.employeeToEdit) {
        const res = await firstValueFrom(this.api.updateEmployee(this.employeeToEdit.id, payload));
        if (res.success && res.employee) {
          this.success.emit(res.employee);
        } else {
          this.error = 'Failed to update employee master record';
        }
      } else {
        const res = await firstValueFrom(this.api.createEmployee(payload));
        if (res.success && res.employee) {
          this.success.emit(res.employee);
        } else {
          this.error = 'Failed to create employee record';
        }
      }
    } catch (err: any) {
      this.error = err.message || 'An error occurred during submission';
    } finally {
      this.isSubmitting = false;
    }
  }
}
