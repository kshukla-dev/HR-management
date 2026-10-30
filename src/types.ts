export type UserRole = 
  | 'Super Admin'
  | 'HR Admin'
  | 'HR Executive'
  | 'Manager'
  | 'Employee'
  | 'Payroll Admin'
  | 'Finance'
  | 'Recruiter'
  | 'Training Admin'
  | 'Performance Admin';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  mustChangePassword?: boolean;
  avatarUrl?: string;
  department: string;
  designation: string;
  permissions: string[];
  isBlocked?: boolean;
  isActive?: boolean;
  statusComment?: string;
}

export type KycDocumentCategory = 
  | 'Aadhaar Card'
  | 'PAN Card'
  | 'Bank Passbook / Cheque'
  | 'Passport / Voter ID'
  | 'Degree / Educational Certificate'
  | 'Previous Relieving / Experience Letter'
  | 'Other KYC Document';

export type KycVerificationStatus = 'Pending Verification' | 'Verified' | 'Rejected';

export interface EmployeeKycDocument {
  id: string;
  employeeId?: string;
  name: string;
  type?: string;
  category?: KycDocumentCategory;
  documentNumber?: string;
  uploadDate: string;
  status: KycVerificationStatus;
  fileSize: string;
  fileUrl?: string;
  verifiedBy?: string;
  verifiedDate?: string;
  remarks?: string;
}

export type CompanyDocCategory = 
  | 'Form 16 / Tax Document'
  | 'Appointment / Contract'
  | 'Appraisal / Increment Letter'
  | 'Medical & Health Insurance'
  | 'Relieving / Experience Certificate'
  | 'Company Policy / NDA';

export interface CompanyIssuedDocument {
  id: string;
  employeeId: string;
  category: CompanyDocCategory;
  title: string;
  financialYear?: string;
  issueDate: string;
  validUntil?: string;
  fileSize: string;
  fileUrl?: string;
  issuedBy: string;
  description?: string;
}

export interface Employee {
  id: string;
  employeeCode: string; // e.g. PW-1001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  company: string;
  businessUnit: string;
  department: string;
  subDepartment: string;
  division: string;
  branch: string;
  location: string;
  designation: string;
  jobLevel: string;
  grade: string;
  band: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Probation' | 'Intern';
  employmentStatus: 'Active' | 'Probation' | 'Notice Period' | 'Separated' | 'Terminated';
  isLoginBlocked?: boolean;
  terminationDate?: string;
  terminationReason?: string;
  terminationRemarks?: string;
  joiningDate: string;
  probationEndDate?: string;
  confirmationDate?: string;
  reportingManagerId: string;
  reportingManagerName: string;
  costCenter: string;
  dateOfBirth: string;
  gender: 'Female' | 'Male' | 'Other' | 'Prefer not to say';
  bloodGroup: string;
  maritalStatus: 'Single' | 'Married' | 'Divorced';
  currentAddress: string;
  permanentAddress: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  education: {
    degree: string;
    institution: string;
    year: number;
    specialization: string;
  }[];
  skills: string[];
  documents: EmployeeKycDocument[];
  companyDocuments?: CompanyIssuedDocument[];
  salary: {
    ctcAnnual: number;
    basicMonthly: number;
    hraMonthly: number;
    specialAllowance: number;
    pfMonthly: number;
    professionalTax: number;
    effectiveDate: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    panNumber?: string;
    aadhaarNumber?: string;
    uanNumber?: string;
    paymentMode?: string;
    conveyanceMonthly?: number;
    medicalAllowanceMonthly?: number;
  };
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  inTime?: string; // HH:mm:ss
  outTime?: string; // HH:mm:ss
  status: 'Present' | 'Late' | 'Half Day' | 'Absent' | 'On Leave' | 'Holiday' | 'Weekly Off';
  workHours: number;
  breakHours: number;
  overtimeHours: number;
  isLate: boolean;
  isEarlyLeaving: boolean;
  regularization?: {
    id: string;
    reason: string;
    requestedInTime: string;
    requestedOutTime: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    submittedAt: string;
    managerComment?: string;
  };
}

export type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Maternity Leave' | 'Paternity Leave' | 'Comp Off' | 'Unpaid Leave';

export interface LeaveBalance {
  leaveType: LeaveType;
  totalQuota: number;
  used: number;
  pending: number;
  available: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Sent Back';
  revertComment?: string;
  revertedBy?: string;
  revertedAt?: string;
  appliedDate: string;
  workflowId: string;
  currentStepIndex: number;
  approverRoles: string[];
  history: {
    stepName: string;
    actorName: string;
    action: 'Submitted' | 'Approved' | 'Rejected' | 'Sent Back' | 'Cancelled';
    timestamp: string;
    comment?: string;
  }[];
}

export interface PayrollRun {
  id: string;
  periodMonth: number;
  periodYear: number;
  periodLabel: string; // e.g. "September 2026"
  totalEmployees: number;
  processedCount: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  status: 'Draft' | 'Processing' | 'Validated' | 'Approved' | 'Finalized';
  processedAt?: string;
  approvedBy?: string;
  payoutDate: string;
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation: string;
  department: string;
  bankAccount: string;
  pan: string;
  uan: string;
  period: string;
  workingDays: number;
  presentDays: number;
  paidLeaveDays: number;
  lopDays: number;
  earnings: {
    basic: number;
    hra: number;
    specialAllowance: number;
    performanceBonus: number;
    conveyance: number;
    totalGross: number;
  };
  deductions: {
    providentFund: number;
    professionalTax: number;
    incomeTaxTDS: number;
    healthInsurance: number;
    totalDeductions: number;
  };
  netSalary: number;
  status: 'Generated' | 'Paid';
}

export interface ExpenseAttachment {
  name: string;
  size: string;
  type?: string;
  fileUrl?: string;
  uploadedAt?: string;
}

export interface TravelExpenseRequest {
  id: string;
  type: 'Travel' | 'Expense';
  employeeId: string;
  employeeName: string;
  department: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  status: 'Pending' | 'Manager Approved' | 'Finance Approved' | 'Paid' | 'Rejected';
  destination?: string;
  startDate?: string;
  endDate?: string;
  receiptAttachment?: string;
  attachments?: ExpenseAttachment[];
  currentApproverRole: string;
  approvalRemarks?: string;
}

export interface SeparationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  resignationDate: string;
  proposedLwd: string;
  officialLwd: string;
  noticePeriodDays: number;
  reason: string;
  comments: string;
  status: 'Submitted' | 'Manager Approved' | 'HR Approved' | 'Clearance In Progress' | 'Settled' | 'Withdrawn';
  clearances: {
    department: 'IT Hardware' | 'HR Formalities' | 'Finance Accounts' | 'Admin & Access';
    status: 'Pending' | 'Cleared';
    clearedBy?: string;
    clearedAt?: string;
    remarks?: string;
  }[];
  finalSettlement?: {
    salaryDue: number;
    leaveEncashment: number;
    noticeRecovery: number;
    gratuity: number;
    totalPayable: number;
    isSettled: boolean;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'Leave' | 'Attendance' | 'Payroll' | 'Recruitment' | 'Workflow' | 'Helpdesk' | 'System';
  read: boolean;
  timestamp: string;
  linkUrl?: string;
}


