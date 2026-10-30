import {
  Employee, AttendanceRecord, LeaveBalance, LeaveRequest,
  PayrollRun, Payslip, TravelExpenseRequest,
  SeparationRequest, NotificationItem, User,
  EmployeeKycDocument, CompanyIssuedDocument
} from '../types';

export interface DatabaseState {
  users: User[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaveBalances: Record<string, LeaveBalance[]>; // employeeId -> balances
  leaveRequests: LeaveRequest[];
  payrollRuns: PayrollRun[];
  payslips: Payslip[];
  travelExpenses: TravelExpenseRequest[];
  separations: SeparationRequest[];
  notifications: NotificationItem[];
  kycDocuments: EmployeeKycDocument[];
  companyDocuments: CompanyIssuedDocument[];
}

export function createInitialDatabase(): DatabaseState {
  const users: User[] = [
    {
      id: 'usr-itadmin',
      employeeId: 'EMP-1004',
      name: 'Jackson & Frank IT Admin',
      email: 'it@jacksonandfrank.com',
      role: 'Super Admin',
      password: 'jacksonandfranc@123',
      department: 'Global Technology',
      designation: 'Lead IT Systems Administrator',
      permissions: ['*'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-admin',
      employeeId: 'EMP-1004',
      name: 'Ananya Roy',
      email: 'admin@democorp.com',
      role: 'Super Admin',
      password: 'jacksonandfranc@123',
      department: 'Human Resources',
      designation: 'VP Human Resources',
      permissions: ['*'],
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-hradmin',
      employeeId: 'EMP-1005',
      name: 'Sneha Kulkarni',
      email: 'hr@democorp.com',
      role: 'HR Admin',
      password: 'jacksonandfranc@123',
      department: 'Human Resources',
      designation: 'Senior HR Manager',
      permissions: ['Employee.*', 'Leave.*', 'Attendance.*', 'Recruitment.*', 'Onboarding.*', 'Separation.*'],
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-manager',
      employeeId: 'EMP-1001',
      name: 'Rajesh Sharma',
      email: 'manager@democorp.com',
      role: 'Manager',
      password: 'jacksonandfranc@123',
      department: 'Information Technology',
      designation: 'Director of Engineering',
      permissions: ['Employee.View', 'Team.*', 'Leave.Approve', 'Attendance.Approve', 'Performance.Approve'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-employee',
      employeeId: 'EMP-1002',
      name: 'Priya Nair',
      email: 'priya@democorp.com',
      role: 'Employee',
      password: 'jacksonandfranc@123',
      department: 'Information Technology',
      designation: 'Senior Software Engineer',
      permissions: ['Self.*'],
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-payroll',
      employeeId: 'EMP-1007',
      name: 'Deepak Verma',
      email: 'payroll@democorp.com',
      role: 'Payroll Admin',
      password: 'jacksonandfranc@123',
      department: 'Finance & Accounts',
      designation: 'Lead Payroll Specialist',
      permissions: ['Payroll.*', 'Employee.View', 'Salary.*'],
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-finance',
      employeeId: 'EMP-1006',
      name: 'Vikram Patil',
      email: 'finance@democorp.com',
      role: 'Finance',
      password: 'jacksonandfranc@123',
      department: 'Finance & Accounts',
      designation: 'Head of Financial Planning',
      permissions: ['Finance.*', 'Expense.Approve', 'Travel.Approve'],
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-recruiter',
      employeeId: 'EMP-1008',
      name: 'Kavita Sen',
      email: 'recruiter@democorp.com',
      role: 'Recruiter',
      password: 'jacksonandfranc@123',
      department: 'Talent Acquisition',
      designation: 'Lead Talent Partner',
      permissions: ['Recruitment.*', 'Onboarding.View'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  ];

  const employees: Employee[] = [
    {
      id: 'EMP-1001',
      employeeCode: 'PW-1001',
      firstName: 'Rajesh',
      lastName: 'Sharma',
      email: 'rajesh.sharma@democorp.com',
      phone: '+91 98201 44521',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      company: 'Jackson & Frank',
      businessUnit: 'Global Digital Platform',
      department: 'Information Technology',
      subDepartment: 'Enterprise Architecture',
      division: 'R&D',
      branch: 'Bangalore Tech Park',
      location: 'Bangalore',
      designation: 'Director of Engineering',
      jobLevel: 'L6',
      grade: 'M3',
      band: 'Band 5',
      employmentType: 'Full-Time',
      employmentStatus: 'Active',
      joiningDate: '2021-03-15',
      confirmationDate: '2021-09-15',
      reportingManagerId: 'EMP-1004',
      reportingManagerName: 'Ananya Roy',
      costCenter: 'CC-TECH-01',
      dateOfBirth: '1984-06-18',
      gender: 'Male',
      bloodGroup: 'O+',
      maritalStatus: 'Married',
      currentAddress: '#402 Palm Meadows, Whitefield, Bangalore 560066',
      permanentAddress: '#402 Palm Meadows, Whitefield, Bangalore 560066',
      emergencyContactName: 'Meera Sharma',
      emergencyContactRelation: 'Spouse',
      emergencyContactPhone: '+91 98201 44522',
      education: [
        { degree: 'M.Tech Computer Science', institution: 'IIT Bombay', year: 2008, specialization: 'Distributed Systems' },
        { degree: 'B.Tech IT', institution: 'NIT Trichy', year: 2006, specialization: 'Computer Engineering' }
      ],
      skills: ['System Architecture', 'Cloud Infrastructure', 'Team Leadership', 'C# / .NET', 'Kubernetes'],
      documents: [
        { id: 'DOC-1', name: 'PAN Card.pdf', type: 'Identity', uploadDate: '2021-03-15', status: 'Verified', fileSize: '1.2 MB' },
        { id: 'DOC-2', name: 'Passport.pdf', type: 'Identity', uploadDate: '2021-03-15', status: 'Verified', fileSize: '2.4 MB' },
        { id: 'DOC-3', name: 'Degree Certificate.pdf', type: 'Education', uploadDate: '2021-03-15', status: 'Verified', fileSize: '3.1 MB' }
      ],
      salary: {
        ctcAnnual: 3800000,
        basicMonthly: 140000,
        hraMonthly: 70000,
        specialAllowance: 95000,
        pfMonthly: 12000,
        professionalTax: 200,
        effectiveDate: '2026-04-01'
      },
      createdAt: '2021-03-15T09:00:00Z',
      updatedAt: '2026-04-01T10:00:00Z'
    },
    {
      id: 'EMP-1002',
      employeeCode: 'PW-1002',
      firstName: 'Priya',
      lastName: 'Nair',
      email: 'priya.nair@democorp.com',
      phone: '+91 99402 88319',
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      company: 'Jackson & Frank',
      businessUnit: 'Global Digital Platform',
      department: 'Information Technology',
      subDepartment: 'Core Products',
      division: 'R&D',
      branch: 'Bangalore Tech Park',
      location: 'Bangalore',
      designation: 'Senior Software Engineer',
      jobLevel: 'L4',
      grade: 'E3',
      band: 'Band 3',
      employmentType: 'Full-Time',
      employmentStatus: 'Active',
      joiningDate: '2023-08-01',
      confirmationDate: '2024-02-01',
      reportingManagerId: 'EMP-1001',
      reportingManagerName: 'Rajesh Sharma',
      costCenter: 'CC-TECH-01',
      dateOfBirth: '1995-11-24',
      gender: 'Female',
      bloodGroup: 'B+',
      maritalStatus: 'Single',
      currentAddress: 'A-204 Greenwood Heights, Indiranagar, Bangalore 560038',
      permanentAddress: 'Haritha House, MG Road, Cochin, Kerala 682011',
      emergencyContactName: 'K. Unnikrishnan Nair',
      emergencyContactRelation: 'Father',
      emergencyContactPhone: '+91 99402 88300',
      education: [
        { degree: 'B.Tech Computer Science', institution: 'NIT Calicut', year: 2017, specialization: 'Software Engineering' }
      ],
      skills: ['TypeScript', 'Angular', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
      documents: [
        { id: 'DOC-4', name: 'PAN_Card_Priya.pdf', type: 'Identity', uploadDate: '2023-08-01', status: 'Verified', fileSize: '980 KB' },
        { id: 'DOC-5', name: 'Aadhaar_Priya.pdf', type: 'Identity', uploadDate: '2023-08-01', status: 'Verified', fileSize: '1.4 MB' }
      ],
      salary: {
        ctcAnnual: 2200000,
        basicMonthly: 85000,
        hraMonthly: 42500,
        specialAllowance: 48000,
        pfMonthly: 7800,
        professionalTax: 200,
        effectiveDate: '2026-04-01'
      },
      createdAt: '2023-08-01T09:00:00Z',
      updatedAt: '2026-04-01T10:00:00Z'
    },
    {
      id: 'EMP-1003',
      employeeCode: 'PW-1003',
      firstName: 'Arjun',
      lastName: 'Mehta',
      email: 'arjun.mehta@democorp.com',
      phone: '+91 98112 33490',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      company: 'Jackson & Frank',
      businessUnit: 'Global Digital Platform',
      department: 'Information Technology',
      subDepartment: 'Cloud Operations',
      division: 'R&D',
      branch: 'Bangalore Tech Park',
      location: 'Bangalore',
      designation: 'Software Engineer',
      jobLevel: 'L3',
      grade: 'E2',
      band: 'Band 2',
      employmentType: 'Full-Time',
      employmentStatus: 'Active',
      joiningDate: '2024-02-15',
      confirmationDate: '2024-08-15',
      reportingManagerId: 'EMP-1001',
      reportingManagerName: 'Rajesh Sharma',
      costCenter: 'CC-TECH-01',
      dateOfBirth: '1998-04-12',
      gender: 'Male',
      bloodGroup: 'A+',
      maritalStatus: 'Single',
      currentAddress: 'Flat 101, Brigade Orchards, Devanahalli, Bangalore 562110',
      permanentAddress: 'Plot 44, Vastrapur, Ahmedabad 380015',
      emergencyContactName: 'Sanjay Mehta',
      emergencyContactRelation: 'Father',
      emergencyContactPhone: '+91 98112 33499',
      education: [
        { degree: 'B.E. Information Technology', institution: 'Nirma University', year: 2020, specialization: 'Information Systems' }
      ],
      skills: ['C#', 'SQL Server', 'REST APIs', 'Angular', 'Redis'],
      documents: [
        { id: 'DOC-6', name: 'Identity_Docs_Arjun.pdf', type: 'Identity', uploadDate: '2024-02-15', status: 'Verified', fileSize: '1.9 MB' }
      ],
      salary: {
        ctcAnnual: 1400000,
        basicMonthly: 55000,
        hraMonthly: 27500,
        specialAllowance: 29000,
        pfMonthly: 5000,
        professionalTax: 200,
        effectiveDate: '2026-04-01'
      },
      createdAt: '2024-02-15T09:00:00Z',
      updatedAt: '2026-04-01T10:00:00Z'
    },
    {
      id: 'EMP-1004',
      employeeCode: 'PW-1004',
      firstName: 'Ananya',
      lastName: 'Roy',
      email: 'ananya.roy@democorp.com',
      phone: '+91 97180 55123',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      company: 'Jackson & Frank',
      businessUnit: 'Corporate Functions',
      department: 'Human Resources',
      subDepartment: 'HR Operations',
      division: 'Corporate',
      branch: 'Corporate HQ Mumbai',
      location: 'Mumbai',
      designation: 'VP Human Resources',
      jobLevel: 'L7',
      grade: 'M4',
      band: 'Band 6',
      employmentType: 'Full-Time',
      employmentStatus: 'Active',
      joiningDate: '2019-07-01',
      confirmationDate: '2020-01-01',
      reportingManagerId: 'BOARD',
      reportingManagerName: 'Managing Director',
      costCenter: 'CC-HR-01',
      dateOfBirth: '1980-09-08',
      gender: 'Female',
      bloodGroup: 'AB+',
      maritalStatus: 'Married',
      currentAddress: 'Penthouse 18, Sea View Towers, Worli, Mumbai 400018',
      permanentAddress: 'Penthouse 18, Sea View Towers, Worli, Mumbai 400018',
      emergencyContactName: 'Dr. Debabrata Roy',
      emergencyContactRelation: 'Spouse',
      emergencyContactPhone: '+91 97180 55120',
      education: [
        { degree: 'MBA Human Resources', institution: 'XLRI Jamshedpur', year: 2004, specialization: 'HR Management' },
        { degree: 'B.A. Psychology', institution: 'St. Xaviers College', year: 2002, specialization: 'Psychology' }
      ],
      skills: ['Strategic HR', 'Talent Retention', 'Compensation & Benefits', 'Labor Law', 'Executive Coaching'],
      documents: [
        { id: 'DOC-7', name: 'Executive_Profile_Ananya.pdf', type: 'Corporate', uploadDate: '2019-07-01', status: 'Verified', fileSize: '2.8 MB' }
      ],
      salary: {
        ctcAnnual: 4500000,
        basicMonthly: 175000,
        hraMonthly: 87500,
        specialAllowance: 100000,
        pfMonthly: 12500,
        professionalTax: 200,
        effectiveDate: '2026-04-01'
      },
      createdAt: '2019-07-01T09:00:00Z',
      updatedAt: '2026-04-01T10:00:00Z'
    },
    {
      id: 'EMP-1005',
      employeeCode: 'PW-1005',
      firstName: 'Sneha',
      lastName: 'Kulkarni',
      email: 'sneha.kulkarni@democorp.com',
      phone: '+91 98230 77412',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      company: 'Jackson & Frank',
      businessUnit: 'Corporate Functions',
      department: 'Human Resources',
      subDepartment: 'Employee Relations & Benefits',
      division: 'Corporate',
      branch: 'Bangalore Tech Park',
      location: 'Bangalore',
      designation: 'Senior HR Manager',
      jobLevel: 'L5',
      grade: 'M2',
      band: 'Band 4',
      employmentType: 'Full-Time',
      employmentStatus: 'Active',
      joiningDate: '2022-01-10',
      confirmationDate: '2022-07-10',
      reportingManagerId: 'EMP-1004',
      reportingManagerName: 'Ananya Roy',
      costCenter: 'CC-HR-01',
      dateOfBirth: '1989-03-30',
      gender: 'Female',
      bloodGroup: 'O+',
      maritalStatus: 'Married',
      currentAddress: '302 Windmills of Your Mind, Whitefield, Bangalore 560066',
      permanentAddress: 'Shivajinagar, Pune 411005',
      emergencyContactName: 'Aditya Kulkarni',
      emergencyContactRelation: 'Spouse',
      emergencyContactPhone: '+91 98230 77419',
      education: [
        { degree: 'MBA HR', institution: 'Symbiosis Pune', year: 2012, specialization: 'Personnel Management' }
      ],
      skills: ['Employee Engagement', 'Workplace Policy', 'HR Audits', 'Performance Management'],
      documents: [
        { id: 'DOC-8', name: 'Sneha_Kulkarni_KYC.pdf', type: 'Identity', uploadDate: '2022-01-10', status: 'Verified', fileSize: '1.7 MB' }
      ],
      salary: {
        ctcAnnual: 2400000,
        basicMonthly: 90000,
        hraMonthly: 45000,
        specialAllowance: 60000,
        pfMonthly: 8500,
        professionalTax: 200,
        effectiveDate: '2026-04-01'
      },
      createdAt: '2022-01-10T09:00:00Z',
      updatedAt: '2026-04-01T10:00:00Z'
    },
    {
      id: 'EMP-1006',
      employeeCode: 'PW-1006',
      firstName: 'Vikram',
      lastName: 'Patil',
      email: 'vikram.patil@democorp.com',
      phone: '+91 98450 11988',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      company: 'Jackson & Frank',
      businessUnit: 'Finance',
      department: 'Finance & Accounts',
      subDepartment: 'Corporate Treasury',
      division: 'Finance',
      branch: 'Corporate HQ Mumbai',
      location: 'Mumbai',
      designation: 'Head of Financial Planning',
      jobLevel: 'L6',
      grade: 'M3',
      band: 'Band 5',
      employmentType: 'Full-Time',
      employmentStatus: 'Active',
      joiningDate: '2020-11-01',
      confirmationDate: '2021-05-01',
      reportingManagerId: 'EMP-1004',
      reportingManagerName: 'Ananya Roy',
      costCenter: 'CC-FIN-01',
      dateOfBirth: '1983-12-14',
      gender: 'Male',
      bloodGroup: 'B+',
      maritalStatus: 'Married',
      currentAddress: 'Flat 12B, Hiranandani Gardens, Powai, Mumbai 400076',
      permanentAddress: 'Flat 12B, Hiranandani Gardens, Powai, Mumbai 400076',
      emergencyContactName: 'Sunita Patil',
      emergencyContactRelation: 'Spouse',
      emergencyContactPhone: '+91 98450 11980',
      education: [
        { degree: 'Chartered Accountant (CA)', institution: 'ICAI', year: 2007, specialization: 'Financial Accounting & Taxation' },
        { degree: 'B.Com Honors', institution: 'HR College Mumbai', year: 2005, specialization: 'Accounting' }
      ],
      skills: ['Taxation', 'Financial Modeling', 'Statutory Compliance', 'Budgeting', 'Auditing'],
      documents: [
        { id: 'DOC-9', name: 'CA_Membership_Certificate.pdf', type: 'Certification', uploadDate: '2020-11-01', status: 'Verified', fileSize: '1.5 MB' }
      ],
      salary: {
        ctcAnnual: 3400000,
        basicMonthly: 125000,
        hraMonthly: 62500,
        specialAllowance: 85000,
        pfMonthly: 11000,
        professionalTax: 200,
        effectiveDate: '2026-04-01'
      },
      createdAt: '2020-11-01T09:00:00Z',
      updatedAt: '2026-04-01T10:00:00Z'
    },
    {
      id: 'EMP-1007',
      employeeCode: 'PW-1007',
      firstName: 'Deepak',
      lastName: 'Verma',
      email: 'deepak.verma@democorp.com',
      phone: '+91 98990 66231',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      company: 'Jackson & Frank',
      businessUnit: 'Finance',
      department: 'Finance & Accounts',
      subDepartment: 'Payroll & Statutory',
      division: 'Finance',
      branch: 'Corporate HQ Mumbai',
      location: 'Mumbai',
      designation: 'Lead Payroll Specialist',
      jobLevel: 'L4',
      grade: 'E3',
      band: 'Band 3',
      employmentType: 'Full-Time',
      employmentStatus: 'Active',
      joiningDate: '2022-05-18',
      confirmationDate: '2022-11-18',
      reportingManagerId: 'EMP-1006',
      reportingManagerName: 'Vikram Patil',
      costCenter: 'CC-FIN-01',
      dateOfBirth: '1992-08-22',
      gender: 'Male',
      bloodGroup: 'O-',
      maritalStatus: 'Single',
      currentAddress: 'Building 4, Lokhandwala Complex, Andheri West, Mumbai 400053',
      permanentAddress: 'Civil Lines, Nagpur 440001',
      emergencyContactName: 'Ramesh Verma',
      emergencyContactRelation: 'Father',
      emergencyContactPhone: '+91 98990 66230',
      education: [
        { degree: 'M.Com', institution: 'Mumbai University', year: 2014, specialization: 'Finance' }
      ],
      skills: ['Payroll Processing', 'TDS & Form 16', 'PF / ESI Compliance', 'Full & Final Settlement', 'Excel Macros'],
      documents: [
        { id: 'DOC-10', name: 'PAN_Deepak.pdf', type: 'Identity', uploadDate: '2022-05-18', status: 'Verified', fileSize: '1.1 MB' }
      ],
      salary: {
        ctcAnnual: 1600000,
        basicMonthly: 62000,
        hraMonthly: 31000,
        specialAllowance: 36000,
        pfMonthly: 5500,
        professionalTax: 200,
        effectiveDate: '2026-04-01'
      },
      createdAt: '2022-05-18T09:00:00Z',
      updatedAt: '2026-04-01T10:00:00Z'
    },
    {
      id: 'EMP-1008',
      employeeCode: 'PW-1008',
      firstName: 'Kavita',
      lastName: 'Sen',
      email: 'kavita.sen@democorp.com',
      phone: '+91 98300 44912',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      company: 'Jackson & Frank',
      businessUnit: 'Corporate Functions',
      department: 'Talent Acquisition',
      subDepartment: 'Technical Sourcing',
      division: 'Corporate',
      branch: 'Bangalore Tech Park',
      location: 'Bangalore',
      designation: 'Lead Talent Partner',
      jobLevel: 'L4',
      grade: 'E3',
      band: 'Band 3',
      employmentType: 'Full-Time',
      employmentStatus: 'Active',
      joiningDate: '2023-01-16',
      confirmationDate: '2023-07-16',
      reportingManagerId: 'EMP-1004',
      reportingManagerName: 'Ananya Roy',
      costCenter: 'CC-HR-01',
      dateOfBirth: '1993-01-05',
      gender: 'Female',
      bloodGroup: 'A+',
      maritalStatus: 'Single',
      currentAddress: 'C-703 Sobha Dream Acres, Panathur, Bangalore 560087',
      permanentAddress: 'Salt Lake Sector 1, Kolkata 700064',
      emergencyContactName: 'Amiya Sen',
      emergencyContactRelation: 'Mother',
      emergencyContactPhone: '+91 98300 44900',
      education: [
        { degree: 'MBA in Human Resources', institution: 'IISWBM Kolkata', year: 2016, specialization: 'Talent Acquisition' }
      ],
      skills: ['Headhunting', 'Technical Recruitment', 'Candidate Experience', 'Offer Negotiation', 'ATS Automation'],
      documents: [
        { id: 'DOC-11', name: 'Kavita_Docs.pdf', type: 'Identity', uploadDate: '2023-01-16', status: 'Verified', fileSize: '2.1 MB' }
      ],
      salary: {
        ctcAnnual: 1750000,
        basicMonthly: 68000,
        hraMonthly: 34000,
        specialAllowance: 39500,
        pfMonthly: 6000,
        professionalTax: 200,
        effectiveDate: '2026-04-01'
      },
      createdAt: '2023-01-16T09:00:00Z',
      updatedAt: '2026-04-01T10:00:00Z'
    }
  ];

  // Attendance Records for Priya Nair & others (Last 14 days)
  const attendance: AttendanceRecord[] = [
    {
      id: 'ATT-20260928-1002',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      date: '2026-09-28',
      inTime: '09:04:12',
      outTime: undefined,
      status: 'Present',
      workHours: 5.5,
      breakHours: 0.5,
      overtimeHours: 0,
      isLate: false,
      isEarlyLeaving: false
    },
    {
      id: 'ATT-20260925-1002',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      date: '2026-09-25',
      inTime: '09:12:45',
      outTime: '18:18:22',
      status: 'Present',
      workHours: 8.6,
      breakHours: 0.8,
      overtimeHours: 0.1,
      isLate: false,
      isEarlyLeaving: false
    },
    {
      id: 'ATT-20260924-1002',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      date: '2026-09-24',
      inTime: '09:42:10',
      outTime: '18:05:00',
      status: 'Late',
      workHours: 7.7,
      breakHours: 0.7,
      overtimeHours: 0,
      isLate: true,
      isEarlyLeaving: false,
      regularization: {
        id: 'REG-101',
        reason: 'Metro signaling breakdown at MG Road line',
        requestedInTime: '09:00:00',
        requestedOutTime: '18:05:00',
        status: 'Pending',
        submittedAt: '2026-09-24T18:10:00Z',
        managerComment: ''
      }
    },
    {
      id: 'ATT-20260923-1002',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      date: '2026-09-23',
      inTime: '08:58:30',
      outTime: '18:30:15',
      status: 'Present',
      workHours: 8.8,
      breakHours: 0.7,
      overtimeHours: 0.3,
      isLate: false,
      isEarlyLeaving: false
    },
    {
      id: 'ATT-20260922-1002',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      date: '2026-09-22',
      inTime: '09:01:00',
      outTime: '18:00:00',
      status: 'Present',
      workHours: 8.2,
      breakHours: 0.8,
      overtimeHours: 0,
      isLate: false,
      isEarlyLeaving: false
    },
    {
      id: 'ATT-20260921-1002',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      date: '2026-09-21',
      inTime: '08:55:00',
      outTime: '18:15:00',
      status: 'Present',
      workHours: 8.5,
      breakHours: 0.8,
      overtimeHours: 0,
      isLate: false,
      isEarlyLeaving: false
    },
    {
      id: 'ATT-20260928-1003',
      employeeId: 'EMP-1003',
      employeeName: 'Arjun Mehta',
      date: '2026-09-28',
      inTime: '09:15:00',
      outTime: undefined,
      status: 'Present',
      workHours: 5.3,
      breakHours: 0.5,
      overtimeHours: 0,
      isLate: false,
      isEarlyLeaving: false
    },
    {
      id: 'ATT-20260925-1003',
      employeeId: 'EMP-1003',
      employeeName: 'Arjun Mehta',
      date: '2026-09-25',
      inTime: '09:50:00',
      outTime: '18:00:00',
      status: 'Late',
      workHours: 7.5,
      breakHours: 0.7,
      overtimeHours: 0,
      isLate: true,
      isEarlyLeaving: false
    },
    {
      id: 'ATT-20261006-1003',
      employeeId: 'EMP-1003',
      employeeName: 'Arjun Mehta',
      date: '2026-10-06',
      inTime: '10:15:00',
      outTime: '19:15:00',
      status: 'Late',
      workHours: 8.2,
      breakHours: 0.8,
      overtimeHours: 0,
      isLate: true,
      isEarlyLeaving: false,
      regularization: {
        id: 'REG-102',
        reason: 'Client production deployment late evening support and morning transit delay',
        requestedInTime: '09:00:00',
        requestedOutTime: '19:15:00',
        status: 'Pending',
        submittedAt: '2026-10-06T19:30:00Z',
        managerComment: ''
      }
    }
  ];

  // Leave balances
  const leaveBalances: Record<string, LeaveBalance[]> = {
    'EMP-1001': [
      { leaveType: 'Casual Leave', totalQuota: 12, used: 2, pending: 0, available: 10 },
      { leaveType: 'Sick Leave', totalQuota: 10, used: 1, pending: 0, available: 9 },
      { leaveType: 'Earned Leave', totalQuota: 15, used: 3, pending: 0, available: 12 },
      { leaveType: 'Comp Off', totalQuota: 2, used: 0, pending: 0, available: 2 },
      { leaveType: 'Maternity Leave', totalQuota: 180, used: 0, pending: 0, available: 180 },
      { leaveType: 'Unpaid Leave', totalQuota: 30, used: 0, pending: 0, available: 30 }
    ],
    'EMP-1002': [
      { leaveType: 'Casual Leave', totalQuota: 12, used: 3, pending: 1, available: 8 },
      { leaveType: 'Sick Leave', totalQuota: 10, used: 2, pending: 0, available: 8 },
      { leaveType: 'Earned Leave', totalQuota: 15, used: 4, pending: 0, available: 11 },
      { leaveType: 'Comp Off', totalQuota: 3, used: 1, pending: 0, available: 2 },
      { leaveType: 'Maternity Leave', totalQuota: 180, used: 0, pending: 0, available: 180 },
      { leaveType: 'Unpaid Leave', totalQuota: 30, used: 0, pending: 0, available: 30 }
    ],
    'EMP-1003': [
      { leaveType: 'Casual Leave', totalQuota: 12, used: 4, pending: 0, available: 8 },
      { leaveType: 'Sick Leave', totalQuota: 10, used: 1, pending: 0, available: 9 },
      { leaveType: 'Earned Leave', totalQuota: 15, used: 2, pending: 0, available: 13 },
      { leaveType: 'Comp Off', totalQuota: 2, used: 0, pending: 0, available: 2 },
      { leaveType: 'Maternity Leave', totalQuota: 180, used: 0, pending: 0, available: 180 },
      { leaveType: 'Unpaid Leave', totalQuota: 30, used: 0, pending: 0, available: 30 }
    ],
    'EMP-1004': [
      { leaveType: 'Casual Leave', totalQuota: 12, used: 1, pending: 0, available: 11 },
      { leaveType: 'Sick Leave', totalQuota: 10, used: 0, pending: 0, available: 10 },
      { leaveType: 'Earned Leave', totalQuota: 15, used: 2, pending: 0, available: 13 },
      { leaveType: 'Comp Off', totalQuota: 3, used: 0, pending: 0, available: 3 },
      { leaveType: 'Maternity Leave', totalQuota: 180, used: 0, pending: 0, available: 180 },
      { leaveType: 'Unpaid Leave', totalQuota: 30, used: 0, pending: 0, available: 30 }
    ],
    'EMP-1005': [
      { leaveType: 'Casual Leave', totalQuota: 12, used: 2, pending: 0, available: 10 },
      { leaveType: 'Sick Leave', totalQuota: 10, used: 1, pending: 0, available: 9 },
      { leaveType: 'Earned Leave', totalQuota: 15, used: 1, pending: 0, available: 14 },
      { leaveType: 'Comp Off', totalQuota: 2, used: 0, pending: 0, available: 2 },
      { leaveType: 'Maternity Leave', totalQuota: 180, used: 0, pending: 0, available: 180 },
      { leaveType: 'Unpaid Leave', totalQuota: 30, used: 0, pending: 0, available: 30 }
    ]
  };

  // Leave requests
  const leaveRequests: LeaveRequest[] = [
    {
      id: 'LR-2026-089',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      department: 'Information Technology',
      reportingManagerId: 'EMP-1001',
      reportingManagerName: 'Rajesh Sharma',
      leaveType: 'Casual Leave',
      startDate: '2026-10-02',
      endDate: '2026-10-02',
      numberOfDays: 1,
      reason: 'Family festival celebration in hometown',
      status: 'Pending',
      appliedDate: '2026-09-26T14:30:00Z',
      workflowId: 'WF-LEAVE-STD',
      currentStepIndex: 1,
      approverRoles: ['Reporting Manager'],
      history: [
        {
          stepName: 'Leave Application Submission',
          actorName: 'Priya Nair',
          action: 'Submitted',
          timestamp: '2026-09-26T14:30:00Z',
          comment: 'Handled urgent code review tasks prior to leave'
        }
      ]
    },
    {
      id: 'LR-2026-085',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      department: 'Information Technology',
      reportingManagerId: 'EMP-1001',
      reportingManagerName: 'Rajesh Sharma',
      leaveType: 'Casual Leave',
      startDate: '2026-10-15',
      endDate: '2026-10-16',
      numberOfDays: 2,
      reason: 'Personal work and family commitment',
      status: 'Approved',
      appliedDate: '2026-10-05T09:00:00Z',
      workflowId: 'WF-LEAVE-STD',
      currentStepIndex: 2,
      approverRoles: ['Reporting Manager', 'HR Admin'],
      history: [
        { stepName: 'Submission', actorName: 'Priya Nair', action: 'Submitted', timestamp: '2026-10-05T09:00:00Z' },
        { stepName: 'Manager Review', actorName: 'Rajesh Sharma', action: 'Approved', timestamp: '2026-10-06T11:00:00Z' },
        { stepName: 'HR Endorsement', actorName: 'Sneha Kulkarni', action: 'Approved', timestamp: '2026-10-07T10:00:00Z' }
      ]
    },
    {
      id: 'LR-2026-101',
      employeeId: 'EMP-1003',
      employeeName: 'Arjun Mehta',
      employeeCode: 'PW-1003',
      department: 'Information Technology',
      reportingManagerId: 'EMP-1001',
      reportingManagerName: 'Rajesh Sharma',
      leaveType: 'Sick Leave',
      startDate: '2026-10-30',
      endDate: '2026-10-30',
      numberOfDays: 1,
      reason: 'Physician visit and seasonal fever rest',
      status: 'Approved',
      appliedDate: '2026-10-29T09:00:00Z',
      workflowId: 'WF-LEAVE-STD',
      currentStepIndex: 2,
      approverRoles: ['Reporting Manager'],
      history: [
        { stepName: 'Submission', actorName: 'Arjun Mehta', action: 'Submitted', timestamp: '2026-10-29T09:00:00Z' },
        { stepName: 'Manager Approval', actorName: 'Rajesh Sharma', action: 'Approved', timestamp: '2026-10-29T10:30:00Z' }
      ]
    },
    {
      id: 'LR-2026-102',
      employeeId: 'EMP-1005',
      employeeName: 'Sneha Kulkarni',
      employeeCode: 'PW-1005',
      department: 'Human Resources',
      reportingManagerId: 'EMP-1004',
      reportingManagerName: 'Ananya Roy',
      leaveType: 'Casual Leave',
      startDate: '2026-10-30',
      endDate: '2026-10-31',
      numberOfDays: 2,
      reason: 'Out of town for family function',
      status: 'Approved',
      appliedDate: '2026-10-25T11:00:00Z',
      workflowId: 'WF-LEAVE-STD',
      currentStepIndex: 2,
      approverRoles: ['Reporting Manager'],
      history: [
        { stepName: 'Submission', actorName: 'Sneha Kulkarni', action: 'Submitted', timestamp: '2026-10-25T11:00:00Z' },
        { stepName: 'Manager Approval', actorName: 'Ananya Roy', action: 'Approved', timestamp: '2026-10-26T09:15:00Z' }
      ]
    },
    {
      id: 'LR-2026-088',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      department: 'Information Technology',
      reportingManagerId: 'EMP-1001',
      reportingManagerName: 'Rajesh Sharma',
      leaveType: 'Earned Leave',
      startDate: '2026-10-20',
      endDate: '2026-10-22',
      numberOfDays: 3,
      reason: 'Personal travel and family function',
      status: 'Sent Back',
      revertComment: 'Please adjust dates to avoid sprint release day, or arrange peer coverage.',
      revertedBy: 'Rajesh Sharma',
      revertedAt: '2026-09-27T10:00:00Z',
      appliedDate: '2026-09-25T11:20:00Z',
      workflowId: 'WF-LEAVE-STD',
      currentStepIndex: 1,
      approverRoles: ['Reporting Manager'],
      history: [
        {
          stepName: 'Leave Application Submission',
          actorName: 'Priya Nair',
          action: 'Submitted',
          timestamp: '2026-09-25T11:20:00Z',
          comment: 'Applying for family function'
        },
        {
          stepName: 'Manager Review',
          actorName: 'Rajesh Sharma',
          action: 'Sent Back',
          timestamp: '2026-09-27T10:00:00Z',
          comment: 'Please adjust dates to avoid sprint release day, or arrange peer coverage.'
        }
      ]
    },
    {
      id: 'LR-2026-072',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      department: 'Information Technology',
      reportingManagerId: 'EMP-1001',
      reportingManagerName: 'Rajesh Sharma',
      leaveType: 'Earned Leave',
      startDate: '2026-08-14',
      endDate: '2026-08-18',
      numberOfDays: 3,
      reason: 'Annual family road trip',
      status: 'Approved',
      appliedDate: '2026-08-01T10:15:00Z',
      workflowId: 'WF-LEAVE-STD',
      currentStepIndex: 2,
      approverRoles: ['HR Admin'],
      history: [
        { stepName: 'Submission', actorName: 'Priya Nair', action: 'Submitted', timestamp: '2026-08-01T10:15:00Z' },
        { stepName: 'Manager Review', actorName: 'Rajesh Sharma', action: 'Approved', timestamp: '2026-08-02T11:00:00Z', comment: 'Approved. Backfill arranged with Arjun.' },
        { stepName: 'HR Endorsement', actorName: 'Sneha Kulkarni', action: 'Approved', timestamp: '2026-08-03T09:30:00Z', comment: 'Leave quota balance verified.' }
      ]
    },
    {
      id: 'LR-2026-091',
      employeeId: 'EMP-1003',
      employeeName: 'Arjun Mehta',
      employeeCode: 'PW-1003',
      department: 'Information Technology',
      reportingManagerId: 'EMP-1001',
      reportingManagerName: 'Rajesh Sharma',
      leaveType: 'Sick Leave',
      startDate: '2026-09-29',
      endDate: '2026-09-30',
      numberOfDays: 2,
      reason: 'Viral fever rest as advised by physician',
      status: 'Pending',
      appliedDate: '2026-09-28T08:00:00Z',
      workflowId: 'WF-LEAVE-STD',
      currentStepIndex: 1,
      approverRoles: ['Reporting Manager'],
      history: [
        { stepName: 'Submission', actorName: 'Arjun Mehta', action: 'Submitted', timestamp: '2026-09-28T08:00:00Z' }
      ]
    },
    {
      id: 'LR-2026-095',
      employeeId: 'EMP-1005',
      employeeName: 'Sneha Kulkarni',
      employeeCode: 'PW-1005',
      department: 'Human Resources',
      reportingManagerId: 'EMP-1004',
      reportingManagerName: 'Ananya Roy',
      leaveType: 'Casual Leave',
      startDate: '2026-10-05',
      endDate: '2026-10-06',
      numberOfDays: 2,
      reason: 'Attending HR Leadership symposium in Mumbai',
      status: 'Pending',
      appliedDate: '2026-09-28T09:00:00Z',
      workflowId: 'WF-LEAVE-STD',
      currentStepIndex: 1,
      approverRoles: ['Reporting Manager'],
      history: [
        { stepName: 'Submission', actorName: 'Sneha Kulkarni', action: 'Submitted', timestamp: '2026-09-28T09:00:00Z' }
      ]
    }
  ];

  // Payroll Runs
  const payrollRuns: PayrollRun[] = [
    {
      id: 'PAY-2026-08',
      periodMonth: 8,
      periodYear: 2026,
      periodLabel: 'August 2026',
      totalEmployees: 8,
      processedCount: 8,
      totalGrossPay: 1530000,
      totalDeductions: 198400,
      totalNetPay: 1331600,
      status: 'Finalized',
      processedAt: '2026-08-30T18:00:00Z',
      approvedBy: 'Ananya Roy',
      payoutDate: '2026-08-31'
    },
    {
      id: 'PAY-2026-09',
      periodMonth: 9,
      periodYear: 2026,
      periodLabel: 'September 2026',
      totalEmployees: 8,
      processedCount: 8,
      totalGrossPay: 1530000,
      totalDeductions: 198400,
      totalNetPay: 1331600,
      status: 'Validated',
      processedAt: '2026-09-27T16:30:00Z',
      approvedBy: undefined,
      payoutDate: '2026-09-30'
    }
  ];

  // Payslips
  const payslips: Payslip[] = [
    {
      id: 'PS-202609-1002',
      payrollRunId: 'PAY-2026-09',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      designation: 'Senior Software Engineer',
      department: 'Information Technology',
      bankAccount: 'HDFC-XXXX-8912',
      pan: 'ABCDE1234F',
      uan: '100984512903',
      period: 'September 2026',
      workingDays: 22,
      presentDays: 22,
      paidLeaveDays: 0,
      lopDays: 0,
      earnings: {
        basic: 85000,
        hra: 42500,
        specialAllowance: 48000,
        performanceBonus: 5000,
        conveyance: 1600,
        totalGross: 182100
      },
      deductions: {
        providentFund: 7800,
        professionalTax: 200,
        incomeTaxTDS: 15200,
        healthInsurance: 1500,
        totalDeductions: 24700
      },
      netSalary: 157400,
      status: 'Paid'
    },
    {
      id: 'PS-202608-1002',
      payrollRunId: 'PAY-2026-08',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      designation: 'Senior Software Engineer',
      department: 'Information Technology',
      bankAccount: 'HDFC-XXXX-8912',
      pan: 'ABCDE1234F',
      uan: '100984512903',
      period: 'August 2026',
      workingDays: 22,
      presentDays: 19,
      paidLeaveDays: 3,
      lopDays: 0,
      earnings: {
        basic: 85000,
        hra: 42500,
        specialAllowance: 48000,
        performanceBonus: 0,
        conveyance: 1600,
        totalGross: 177100
      },
      deductions: {
        providentFund: 7800,
        professionalTax: 200,
        incomeTaxTDS: 14500,
        healthInsurance: 1500,
        totalDeductions: 24000
      },
      netSalary: 153100,
      status: 'Paid'
    },
    {
      id: 'PS-202607-1002',
      payrollRunId: 'PAY-2026-07',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      designation: 'Senior Software Engineer',
      department: 'Information Technology',
      bankAccount: 'HDFC-XXXX-8912',
      pan: 'ABCDE1234F',
      uan: '100984512903',
      period: 'July 2026',
      workingDays: 23,
      presentDays: 23,
      paidLeaveDays: 0,
      lopDays: 0,
      earnings: { basic: 85000, hra: 42500, specialAllowance: 48000, performanceBonus: 0, conveyance: 1600, totalGross: 177100 },
      deductions: { providentFund: 7800, professionalTax: 200, incomeTaxTDS: 14500, healthInsurance: 1500, totalDeductions: 24000 },
      netSalary: 153100,
      status: 'Paid'
    },
    {
      id: 'PS-202606-1002',
      payrollRunId: 'PAY-2026-06',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      designation: 'Senior Software Engineer',
      department: 'Information Technology',
      bankAccount: 'HDFC-XXXX-8912',
      pan: 'ABCDE1234F',
      uan: '100984512903',
      period: 'June 2026',
      workingDays: 22,
      presentDays: 21,
      paidLeaveDays: 1,
      lopDays: 0,
      earnings: { basic: 85000, hra: 42500, specialAllowance: 48000, performanceBonus: 0, conveyance: 1600, totalGross: 177100 },
      deductions: { providentFund: 7800, professionalTax: 200, incomeTaxTDS: 14500, healthInsurance: 1500, totalDeductions: 24000 },
      netSalary: 153100,
      status: 'Paid'
    },
    {
      id: 'PS-202605-1002',
      payrollRunId: 'PAY-2026-05',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      designation: 'Senior Software Engineer',
      department: 'Information Technology',
      bankAccount: 'HDFC-XXXX-8912',
      pan: 'ABCDE1234F',
      uan: '100984512903',
      period: 'May 2026',
      workingDays: 21,
      presentDays: 21,
      paidLeaveDays: 0,
      lopDays: 0,
      earnings: { basic: 85000, hra: 42500, specialAllowance: 48000, performanceBonus: 0, conveyance: 1600, totalGross: 177100 },
      deductions: { providentFund: 7800, professionalTax: 200, incomeTaxTDS: 14500, healthInsurance: 1500, totalDeductions: 24000 },
      netSalary: 153100,
      status: 'Paid'
    },
    {
      id: 'PS-202604-1002',
      payrollRunId: 'PAY-2026-04',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      designation: 'Senior Software Engineer',
      department: 'Information Technology',
      bankAccount: 'HDFC-XXXX-8912',
      pan: 'ABCDE1234F',
      uan: '100984512903',
      period: 'April 2026',
      workingDays: 22,
      presentDays: 22,
      paidLeaveDays: 0,
      lopDays: 0,
      earnings: { basic: 85000, hra: 42500, specialAllowance: 48000, performanceBonus: 0, conveyance: 1600, totalGross: 177100 },
      deductions: { providentFund: 7800, professionalTax: 200, incomeTaxTDS: 14500, healthInsurance: 1500, totalDeductions: 24000 },
      netSalary: 153100,
      status: 'Paid'
    },
    {
      id: 'PS-202603-1002',
      payrollRunId: 'PAY-2026-03',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      designation: 'Senior Software Engineer',
      department: 'Information Technology',
      bankAccount: 'HDFC-XXXX-8912',
      pan: 'ABCDE1234F',
      uan: '100984512903',
      period: 'March 2026',
      workingDays: 22,
      presentDays: 22,
      paidLeaveDays: 0,
      lopDays: 0,
      earnings: { basic: 80000, hra: 40000, specialAllowance: 45000, performanceBonus: 0, conveyance: 1600, totalGross: 166600 },
      deductions: { providentFund: 7500, professionalTax: 200, incomeTaxTDS: 13500, healthInsurance: 1500, totalDeductions: 22700 },
      netSalary: 143900,
      status: 'Paid'
    },
    {
      id: 'PS-202602-1002',
      payrollRunId: 'PAY-2026-02',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      designation: 'Senior Software Engineer',
      department: 'Information Technology',
      bankAccount: 'HDFC-XXXX-8912',
      pan: 'ABCDE1234F',
      uan: '100984512903',
      period: 'February 2026',
      workingDays: 20,
      presentDays: 20,
      paidLeaveDays: 0,
      lopDays: 0,
      earnings: { basic: 80000, hra: 40000, specialAllowance: 45000, performanceBonus: 0, conveyance: 1600, totalGross: 166600 },
      deductions: { providentFund: 7500, professionalTax: 200, incomeTaxTDS: 13500, healthInsurance: 1500, totalDeductions: 22700 },
      netSalary: 143900,
      status: 'Paid'
    },
    {
      id: 'PS-202601-1002',
      payrollRunId: 'PAY-2026-01',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      designation: 'Senior Software Engineer',
      department: 'Information Technology',
      bankAccount: 'HDFC-XXXX-8912',
      pan: 'ABCDE1234F',
      uan: '100984512903',
      period: 'January 2026',
      workingDays: 22,
      presentDays: 21,
      paidLeaveDays: 1,
      lopDays: 0,
      earnings: { basic: 80000, hra: 40000, specialAllowance: 45000, performanceBonus: 0, conveyance: 1600, totalGross: 166600 },
      deductions: { providentFund: 7500, professionalTax: 200, incomeTaxTDS: 13500, healthInsurance: 1500, totalDeductions: 22700 },
      netSalary: 143900,
      status: 'Paid'
    },
    {
      id: 'PS-202512-1002',
      payrollRunId: 'PAY-2025-12',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      designation: 'Senior Software Engineer',
      department: 'Information Technology',
      bankAccount: 'HDFC-XXXX-8912',
      pan: 'ABCDE1234F',
      uan: '100984512903',
      period: 'December 2025',
      workingDays: 22,
      presentDays: 22,
      paidLeaveDays: 0,
      lopDays: 0,
      earnings: { basic: 80000, hra: 40000, specialAllowance: 45000, performanceBonus: 0, conveyance: 1600, totalGross: 166600 },
      deductions: { providentFund: 7500, professionalTax: 200, incomeTaxTDS: 13500, healthInsurance: 1500, totalDeductions: 22700 },
      netSalary: 143900,
      status: 'Paid'
    },
    {
      id: 'PS-202511-1002',
      payrollRunId: 'PAY-2025-11',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      designation: 'Senior Software Engineer',
      department: 'Information Technology',
      bankAccount: 'HDFC-XXXX-8912',
      pan: 'ABCDE1234F',
      uan: '100984512903',
      period: 'November 2025',
      workingDays: 21,
      presentDays: 20,
      paidLeaveDays: 1,
      lopDays: 0,
      earnings: { basic: 80000, hra: 40000, specialAllowance: 45000, performanceBonus: 0, conveyance: 1600, totalGross: 166600 },
      deductions: { providentFund: 7500, professionalTax: 200, incomeTaxTDS: 13500, healthInsurance: 1500, totalDeductions: 22700 },
      netSalary: 143900,
      status: 'Paid'
    },
    {
      id: 'PS-202510-1002',
      payrollRunId: 'PAY-2025-10',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      employeeCode: 'PW-1002',
      designation: 'Senior Software Engineer',
      department: 'Information Technology',
      bankAccount: 'HDFC-XXXX-8912',
      pan: 'ABCDE1234F',
      uan: '100984512903',
      period: 'October 2025',
      workingDays: 22,
      presentDays: 22,
      paidLeaveDays: 0,
      lopDays: 0,
      earnings: { basic: 80000, hra: 40000, specialAllowance: 45000, performanceBonus: 0, conveyance: 1600, totalGross: 166600 },
      deductions: { providentFund: 7500, professionalTax: 200, incomeTaxTDS: 13500, healthInsurance: 1500, totalDeductions: 22700 },
      netSalary: 143900,
      status: 'Paid'
    }
  ];

  // Travel & Expenses
  const travelExpenses: TravelExpenseRequest[] = [
    {
      id: 'EXP-881',
      type: 'Expense',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      department: 'Information Technology',
      title: 'AWS Certified Solutions Architect Exam Fee',
      amount: 12500,
      date: '2026-09-15',
      category: 'Professional Certification & Training',
      description: 'Certification reimbursement per company continuing education policy',
      status: 'Manager Approved',
      receiptAttachment: 'AWS_Exam_Receipt_PN.pdf',
      attachments: [
        { name: 'AWS_Exam_Score_Receipt.pdf', size: '1.4 MB', type: 'application/pdf', uploadedAt: '2026-09-15' },
        { name: 'GST_Invoice_PearsonVUE.pdf', size: '820 KB', type: 'application/pdf', uploadedAt: '2026-09-15' }
      ],
      currentApproverRole: 'Finance Admin'
    },
    {
      id: 'EXP-824',
      type: 'Expense',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      department: 'Information Technology',
      title: 'High-Speed Broadband & Remote Setup Allowance',
      amount: 3500,
      date: '2026-08-20',
      category: 'Internet & Remote Work',
      description: 'Monthly high-speed fiber internet and ergonomic setup reimbursement',
      status: 'Paid',
      receiptAttachment: 'Airtel_Fiber_August_Receipt.pdf',
      attachments: [
        { name: 'Airtel_Fiber_Invoice_Aug2026.pdf', size: '450 KB', type: 'application/pdf', uploadedAt: '2026-08-20' }
      ],
      currentApproverRole: 'Finance Admin'
    },
    {
      id: 'TRV-395',
      type: 'Travel',
      employeeId: 'EMP-1002',
      employeeName: 'Priya Nair',
      department: 'Information Technology',
      title: 'Client Office Technical Consultation & Cab',
      amount: 2850,
      date: '2026-07-18',
      category: 'Local Conveyance & Travel',
      description: 'On-site system integration visit to client office in Whitefield',
      status: 'Paid',
      receiptAttachment: 'Uber_Corporate_Trip_Receipt.pdf',
      attachments: [
        { name: 'Uber_Business_Ride_TaxInvoice.pdf', size: '310 KB', type: 'application/pdf', uploadedAt: '2026-07-18' }
      ],
      currentApproverRole: 'Line Manager'
    },
    {
      id: 'TRV-412',
      type: 'Travel',
      employeeId: 'EMP-1001',
      employeeName: 'Rajesh Sharma',
      department: 'Information Technology',
      title: 'Executive Architecture Summit Mumbai',
      amount: 42000,
      date: '2026-10-10',
      category: 'Client & Industry Summit',
      description: 'Keynote presentation on Enterprise HR Modernization at Mumbai Tech Expo',
      destination: 'Mumbai HQ & Grand Hyatt',
      startDate: '2026-10-10',
      endDate: '2026-10-12',
      status: 'Pending',
      attachments: [
        { name: 'IndiGo_RoundTrip_Ticket.pdf', size: '1.8 MB', type: 'application/pdf', uploadedAt: '2026-10-09' },
        { name: 'Grand_Hyatt_Hotel_Booking.pdf', size: '2.1 MB', type: 'application/pdf', uploadedAt: '2026-10-09' },
        { name: 'Airport_Cab_Uber_Invoice.pdf', size: '340 KB', type: 'application/pdf', uploadedAt: '2026-10-10' }
      ],
      currentApproverRole: 'VP Human Resources'
    }
  ];

  // Separations
  const separations: SeparationRequest[] = [
    {
      id: 'SEP-2026-01',
      employeeId: 'EMP-1003',
      employeeName: 'Arjun Mehta',
      department: 'Information Technology',
      designation: 'Software Engineer',
      resignationDate: '2026-09-20',
      proposedLwd: '2026-11-20',
      officialLwd: '2026-11-20',
      noticePeriodDays: 60,
      reason: 'Pursuing higher studies (Master of Science abroad)',
      comments: 'Wish to complete all deliverables and project handover smoothly before departure.',
      status: 'Manager Approved',
      clearances: [
        { department: 'IT Hardware', status: 'Pending', remarks: 'MacBook Pro & YubiKey to be returned on LWD' },
        { department: 'HR Formalities', status: 'Cleared', clearedBy: 'Sneha Kulkarni', clearedAt: '2026-09-22T11:00:00Z', remarks: 'Exit interview scheduled' },
        { department: 'Finance Accounts', status: 'Pending', remarks: 'Awaiting final attendance closing' },
        { department: 'Admin & Access', status: 'Pending', remarks: 'ID badge and parking tag recovery' }
      ],
      finalSettlement: {
        salaryDue: 110000,
        leaveEncashment: 28000,
        noticeRecovery: 0,
        gratuity: 0,
        totalPayable: 138000,
        isSettled: false
      }
    }
  ];

  // Notifications
  const notifications: NotificationItem[] = [
    {
      id: 'NOTIF-1',
      userId: 'usr-employee',
      title: 'Payslip Available',
      message: 'Your payslip for August 2026 is finalized and ready for download.',
      category: 'Payroll',
      read: false,
      timestamp: '2026-09-28T04:10:00Z',
      linkUrl: '/payroll'
    },
    {
      id: 'NOTIF-2',
      userId: 'usr-manager',
      title: 'Pending Leave Request',
      message: 'Priya Nair has applied for Casual Leave on 2026-10-02.',
      category: 'Leave',
      read: false,
      timestamp: '2026-09-26T14:31:00Z',
      linkUrl: '/leave'
    },
    {
      id: 'NOTIF-3',
      userId: 'usr-manager',
      title: 'Attendance Regularization Request',
      message: 'Priya Nair requested regularization for 2026-09-24 (Metro signaling breakdown).',
      category: 'Attendance',
      read: false,
      timestamp: '2026-09-24T18:11:00Z',
      linkUrl: '/attendance'
    },
    {
      id: 'NOTIF-4',
      userId: 'usr-admin',
      title: 'Payroll Processing Completed',
      message: 'September 2026 payroll batch has been processed and awaits executive final approval.',
      category: 'Payroll',
      read: true,
      timestamp: '2026-09-27T16:35:00Z',
      linkUrl: '/payroll'
    }
  ];

  const kycDocuments: EmployeeKycDocument[] = [
    // EMP-1004 (Ananya Roy - VP HR)
    {
      id: 'KYC-1004-1',
      employeeId: 'EMP-1004',
      category: 'Aadhaar Card',
      name: 'Aadhaar_Card_Ananya.pdf',
      documentNumber: 'XXXX-XXXX-8921',
      uploadDate: '2020-01-15',
      status: 'Verified',
      fileSize: '1.4 MB',
      verifiedBy: 'Corporate Compliance Officer',
      verifiedDate: '2020-01-18',
      remarks: 'Biometric QR code successfully authenticated.'
    },
    {
      id: 'KYC-1004-2',
      employeeId: 'EMP-1004',
      category: 'PAN Card',
      name: 'PAN_Card_Ananya_Roy.pdf',
      documentNumber: 'BKRPY9021M',
      uploadDate: '2020-01-15',
      status: 'Verified',
      fileSize: '820 KB',
      verifiedBy: 'Corporate Compliance Officer',
      verifiedDate: '2020-01-18',
      remarks: 'NSDL Income Tax verification matched with legal records.'
    },
    {
      id: 'KYC-1004-3',
      employeeId: 'EMP-1004',
      category: 'Bank Passbook / Cheque',
      name: 'HDFC_Bank_Cancelled_Cheque.pdf',
      documentNumber: 'HDFC000104 - A/C XXXXXX4481',
      uploadDate: '2020-01-16',
      status: 'Verified',
      fileSize: '950 KB',
      verifiedBy: 'Payroll Operations Lead',
      verifiedDate: '2020-01-19',
      remarks: 'Salary account mandate configured.'
    },
    {
      id: 'KYC-1004-4',
      employeeId: 'EMP-1004',
      category: 'Degree / Educational Certificate',
      name: 'XLRI_MBA_Degree_Certificate.pdf',
      documentNumber: 'DEG-XLRI-2012-HR',
      uploadDate: '2020-01-16',
      status: 'Verified',
      fileSize: '2.1 MB',
      verifiedBy: 'Background Verification Agency',
      verifiedDate: '2020-01-25',
      remarks: 'Academic degree credentials verified with XLRI records.'
    },
    {
      id: 'KYC-1004-5',
      employeeId: 'EMP-1004',
      category: 'Passport / Voter ID',
      name: 'Passport_Scan_Copy.pdf',
      documentNumber: 'Z8920194',
      uploadDate: '2026-02-10',
      status: 'Verified',
      fileSize: '1.9 MB',
      verifiedBy: 'Corporate Compliance Officer',
      verifiedDate: '2026-02-14',
      remarks: 'Overseas corporate business travel passport verified.'
    },

    // EMP-1001 (Rajesh Sharma - Director of Engineering)
    {
      id: 'KYC-1001-1',
      employeeId: 'EMP-1001',
      category: 'Aadhaar Card',
      name: 'Aadhaar_Card_Rajesh.pdf',
      documentNumber: 'XXXX-XXXX-3419',
      uploadDate: '2021-03-15',
      status: 'Verified',
      fileSize: '1.2 MB',
      verifiedBy: 'HR Onboarding Team',
      verifiedDate: '2021-03-18',
      remarks: 'UIDAI official e-Aadhaar validated.'
    },
    {
      id: 'KYC-1001-2',
      employeeId: 'EMP-1001',
      category: 'PAN Card',
      name: 'PAN_Card_Rajesh_Sharma.pdf',
      documentNumber: 'AAFPS1092Q',
      uploadDate: '2021-03-15',
      status: 'Verified',
      fileSize: '890 KB',
      verifiedBy: 'HR Onboarding Team',
      verifiedDate: '2021-03-18',
      remarks: 'Verified.'
    },
    {
      id: 'KYC-1001-3',
      employeeId: 'EMP-1001',
      category: 'Bank Passbook / Cheque',
      name: 'ICICI_Bank_Passbook_FirstPage.pdf',
      documentNumber: 'ICIC000021 - A/C XXXXXX9910',
      uploadDate: '2021-03-16',
      status: 'Verified',
      fileSize: '1.1 MB',
      verifiedBy: 'Payroll Operations',
      verifiedDate: '2021-03-20',
      remarks: 'Bank account active and verified.'
    },
    {
      id: 'KYC-1001-4',
      employeeId: 'EMP-1001',
      category: 'Previous Relieving / Experience Letter',
      name: 'Previous_Employer_Relieving_Letter.pdf',
      documentNumber: 'EXP-TECH-9912',
      uploadDate: '2021-03-16',
      status: 'Verified',
      fileSize: '1.6 MB',
      verifiedBy: 'HR Onboarding Team',
      verifiedDate: '2021-03-22',
      remarks: 'Clean exit confirmed from prior organization.'
    },

    // EMP-1002 (Priya Nair - Senior Software Engineer)
    {
      id: 'KYC-1002-1',
      employeeId: 'EMP-1002',
      category: 'Aadhaar Card',
      name: 'Aadhaar_Priya_Nair.pdf',
      documentNumber: 'XXXX-XXXX-6112',
      uploadDate: '2023-08-01',
      status: 'Verified',
      fileSize: '1.4 MB',
      verifiedBy: 'HR Operations',
      verifiedDate: '2023-08-04',
      remarks: 'UIDAI verified.'
    },
    {
      id: 'KYC-1002-2',
      employeeId: 'EMP-1002',
      category: 'PAN Card',
      name: 'PAN_Priya_Nair.pdf',
      documentNumber: 'BNVPN8821K',
      uploadDate: '2023-08-01',
      status: 'Verified',
      fileSize: '980 KB',
      verifiedBy: 'HR Operations',
      verifiedDate: '2023-08-04',
      remarks: 'PAN active and linked with Aadhaar.'
    },
    {
      id: 'KYC-1002-3',
      employeeId: 'EMP-1002',
      category: 'Bank Passbook / Cheque',
      name: 'Bank_Passbook_Scan.pdf',
      documentNumber: 'HDFC000049 - A/C XXXXXX7731',
      uploadDate: '2023-08-02',
      status: 'Verified',
      fileSize: '1.3 MB',
      verifiedBy: 'Payroll Operations',
      verifiedDate: '2023-08-05',
      remarks: 'Verified for monthly salary credit.'
    },
    {
      id: 'KYC-1002-4',
      employeeId: 'EMP-1002',
      category: 'Degree / Educational Certificate',
      name: 'NIT_Calicut_BTech_Degree.pdf',
      documentNumber: 'DEG-NITC-2017-CS',
      uploadDate: '2023-08-02',
      status: 'Verified',
      fileSize: '2.4 MB',
      verifiedBy: 'HR Operations',
      verifiedDate: '2023-08-10',
      remarks: 'Verified.'
    },

    // EMP-1007 (Amit Patel - Software Engineer) - with Pending & Rejected for realistic testing!
    {
      id: 'KYC-1007-1',
      employeeId: 'EMP-1007',
      category: 'Aadhaar Card',
      name: 'Amit_Aadhaar_Front_Back.pdf',
      documentNumber: 'XXXX-XXXX-1944',
      uploadDate: '2024-06-15',
      status: 'Verified',
      fileSize: '1.1 MB',
      verifiedBy: 'HR Operations',
      verifiedDate: '2024-06-18',
      remarks: 'Verified.'
    },
    {
      id: 'KYC-1007-2',
      employeeId: 'EMP-1007',
      category: 'PAN Card',
      name: 'PAN_Card_Amit.pdf',
      documentNumber: 'CKAPP4921N',
      uploadDate: '2024-06-15',
      status: 'Verified',
      fileSize: '840 KB',
      verifiedBy: 'HR Operations',
      verifiedDate: '2024-06-18',
      remarks: 'Verified.'
    },
    {
      id: 'KYC-1007-3',
      employeeId: 'EMP-1007',
      category: 'Bank Passbook / Cheque',
      name: 'Kotak_Bank_Passbook_Blurred.pdf',
      documentNumber: 'KKBK000012 - A/C XXXXXX8102',
      uploadDate: '2026-10-01',
      status: 'Rejected',
      fileSize: '750 KB',
      verifiedBy: 'Sneha Deshmukh (Payroll)',
      verifiedDate: '2026-10-03',
      remarks: 'Account number and IFSC code are blurred on the scanned passbook copy. Please upload a clear original PDF or cancelled cheque.'
    },
    {
      id: 'KYC-1007-4',
      employeeId: 'EMP-1007',
      category: 'Passport / Voter ID',
      name: 'Passport_Copy_Renewal.pdf',
      documentNumber: 'M9920141',
      uploadDate: '2026-10-10',
      status: 'Pending Verification',
      fileSize: '1.8 MB',
      remarks: 'Uploaded recently. Pending verification by HR administrator.'
    }
  ];

  const companyDocuments: CompanyIssuedDocument[] = [
    // EMP-1004 (Ananya Roy)
    {
      id: 'COM-1004-1',
      employeeId: 'EMP-1004',
      category: 'Form 16 / Tax Document',
      title: 'Form 16 (Part A & Part B) - Assessment Year 2025-26',
      financialYear: '2024-2025',
      issueDate: '2025-06-10',
      validUntil: 'Permanent',
      fileSize: '1.8 MB',
      issuedBy: 'Finance & Payroll Department',
      description: 'Annual tax withholding certificate under Section 203 of Income Tax Act 1961 detailing gross salary, deductions (80C/80D), and TDS deposited with Central Govt.'
    },
    {
      id: 'COM-1004-2',
      employeeId: 'EMP-1004',
      category: 'Form 16 / Tax Document',
      title: 'Form 16 (Part A & Part B) - Assessment Year 2024-25',
      financialYear: '2023-2024',
      issueDate: '2024-06-12',
      validUntil: 'Permanent',
      fileSize: '1.7 MB',
      issuedBy: 'Finance & Payroll Department',
      description: 'Annual income tax TDS certificate for FY 2023-2024.'
    },
    {
      id: 'COM-1004-3',
      employeeId: 'EMP-1004',
      category: 'Medical & Health Insurance',
      title: 'Group Health Insurance E-Card & Policy Schedule',
      financialYear: '2025-2026',
      issueDate: '2025-04-01',
      validUntil: '31-Mar-2026',
      fileSize: '1.1 MB',
      issuedBy: 'Corporate HR Operations & Care Health',
      description: 'Comprehensive cashless health insurance coverage of ₹10,00,000 for employee, spouse, and dependent children. Policy No: CARE-GH-2025-9941.'
    },
    {
      id: 'COM-1004-4',
      employeeId: 'EMP-1004',
      category: 'Appraisal / Increment Letter',
      title: 'Annual Compensation Revision & Performance Increment Letter 2025',
      financialYear: '2025-2026',
      issueDate: '2025-04-05',
      validUntil: '31-Mar-2026',
      fileSize: '420 KB',
      issuedBy: 'Board Compensation & Leadership Committee',
      description: 'Official letter confirming revised compensation structure, retention incentives, and senior leadership performance band.'
    },
    {
      id: 'COM-1004-5',
      employeeId: 'EMP-1004',
      category: 'Appointment / Contract',
      title: 'Executive Appointment Letter & Service Agreement',
      issueDate: '2020-01-15',
      validUntil: 'Permanent',
      fileSize: '1.4 MB',
      issuedBy: 'Jackson & Frank Global People Office',
      description: 'Formal appointment letter defining terms of employment, leadership responsibilities, confidentiality, and organizational policies.'
    },
    {
      id: 'COM-1004-6',
      employeeId: 'EMP-1004',
      category: 'Company Policy / NDA',
      title: 'Enterprise Code of Conduct & Intellectual Property Agreement',
      issueDate: '2020-01-15',
      validUntil: 'Permanent',
      fileSize: '650 KB',
      issuedBy: 'Legal & Compliance Division',
      description: 'Information security, conflict of interest, and intellectual property agreement countersigned by management.'
    },

    // EMP-1001 (Rajesh Sharma)
    {
      id: 'COM-1001-1',
      employeeId: 'EMP-1001',
      category: 'Form 16 / Tax Document',
      title: 'Form 16 (Part A & Part B) - AY 2025-26',
      financialYear: '2024-2025',
      issueDate: '2025-06-10',
      validUntil: 'Permanent',
      fileSize: '1.6 MB',
      issuedBy: 'Finance & Payroll Division',
      description: 'Tax deducted at source certificate under IT Act Section 203.'
    },
    {
      id: 'COM-1001-2',
      employeeId: 'EMP-1001',
      category: 'Medical & Health Insurance',
      title: 'Group Medical Insurance Cashless Card',
      financialYear: '2025-2026',
      issueDate: '2025-04-01',
      validUntil: '31-Mar-2026',
      fileSize: '1.2 MB',
      issuedBy: 'Corporate HR Operations',
      description: 'Policy Number: CARE-GH-2025-8812. Floater cover of ₹7,50,000 across network hospitals.'
    },
    {
      id: 'COM-1001-3',
      employeeId: 'EMP-1001',
      category: 'Appraisal / Increment Letter',
      title: 'Annual CTC Increment & Band Reclassification Letter 2025',
      financialYear: '2025-2026',
      issueDate: '2025-04-05',
      validUntil: '31-Mar-2026',
      fileSize: '390 KB',
      issuedBy: 'Human Resources & Executive Management',
      description: 'Revision to Director Grade Band 5 with revised basic and variable performance pay.'
    },
    {
      id: 'COM-1001-4',
      employeeId: 'EMP-1001',
      category: 'Appointment / Contract',
      title: 'Official Employment Contract & Offer Letter',
      issueDate: '2021-03-15',
      validUntil: 'Permanent',
      fileSize: '1.3 MB',
      issuedBy: 'Corporate HR Department',
      description: 'Director of Engineering employment appointment contract.'
    },

    // EMP-1002 (Priya Nair)
    {
      id: 'COM-1002-1',
      employeeId: 'EMP-1002',
      category: 'Form 16 / Tax Document',
      title: 'Form 16 (Part A & Part B) - AY 2025-26',
      financialYear: '2024-2025',
      issueDate: '2025-06-10',
      validUntil: 'Permanent',
      fileSize: '1.5 MB',
      issuedBy: 'Finance & Payroll Division',
      description: 'Tax certificate for Assessment Year 2025-26.'
    },
    {
      id: 'COM-1002-2',
      employeeId: 'EMP-1002',
      category: 'Medical & Health Insurance',
      title: 'Health Insurance E-Card - Care Health Insurance',
      financialYear: '2025-2026',
      issueDate: '2025-04-01',
      validUntil: '31-Mar-2026',
      fileSize: '950 KB',
      issuedBy: 'Corporate HR Operations',
      description: 'Individual and family floater cashless medical card. TPA Card No: TPA-99210-CR.'
    },
    {
      id: 'COM-1002-3',
      employeeId: 'EMP-1002',
      category: 'Appraisal / Increment Letter',
      title: 'Promotion & Salary Revision Letter - Senior Software Engineer',
      financialYear: '2025-2026',
      issueDate: '2025-04-05',
      validUntil: '31-Mar-2026',
      fileSize: '410 KB',
      issuedBy: 'Human Resources & Engineering Leadership',
      description: 'Promotion letter to L4 Senior Software Engineer with revised CTC of ₹22,00,000.'
    },
    {
      id: 'COM-1002-4',
      employeeId: 'EMP-1002',
      category: 'Appointment / Contract',
      title: 'Offer Letter & Employment Terms',
      issueDate: '2023-08-01',
      validUntil: 'Permanent',
      fileSize: '1.1 MB',
      issuedBy: 'Talent Acquisition Team',
      description: 'Official offer letter and service confirmation.'
    },

    // EMP-1007 (Amit Patel)
    {
      id: 'COM-1007-1',
      employeeId: 'EMP-1007',
      category: 'Form 16 / Tax Document',
      title: 'Form 16 (Part A & Part B) - AY 2025-26',
      financialYear: '2024-2025',
      issueDate: '2025-06-10',
      validUntil: 'Permanent',
      fileSize: '1.4 MB',
      issuedBy: 'Finance & Payroll Division',
      description: 'Annual tax withholding certificate.'
    },
    {
      id: 'COM-1007-2',
      employeeId: 'EMP-1007',
      category: 'Medical & Health Insurance',
      title: 'Group Health Insurance Card',
      financialYear: '2025-2026',
      issueDate: '2025-04-01',
      validUntil: '31-Mar-2026',
      fileSize: '880 KB',
      issuedBy: 'Corporate HR Operations',
      description: 'Cashless medical insurance coverage of ₹5,00,000.'
    },
    {
      id: 'COM-1007-3',
      employeeId: 'EMP-1007',
      category: 'Appointment / Contract',
      title: 'Software Engineer Appointment Letter',
      issueDate: '2024-06-15',
      validUntil: 'Permanent',
      fileSize: '1.2 MB',
      issuedBy: 'Human Resources',
      description: 'Employment appointment and job responsibilities agreement.'
    }
  ];

  // Sync employee.documents and employee.companyDocuments with the master lists
  employees.forEach(emp => {
    emp.documents = kycDocuments.filter(d => d.employeeId === emp.id);
    emp.companyDocuments = companyDocuments.filter(d => d.employeeId === emp.id);
  });

  return {
    users,
    employees,
    attendance,
    leaveBalances,
    leaveRequests,
    payrollRuns,
    payslips,
    travelExpenses,
    separations,
    notifications,
    kycDocuments,
    companyDocuments
  };
}

// In-memory persistent database instance
export const db = createInitialDatabase();
