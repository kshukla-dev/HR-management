-- ==========================================================================================
-- ENTERPRISE HRMS / PEOPLEWORKS PLATFORM DATABASE DDL
-- Target DBMS: Microsoft SQL Server 2022+ / Azure SQL Database
-- Normalized Relational Architecture with Audit Fields, Cascades, and High-Volume Indexes
-- ==========================================================================================

CREATE DATABASE [EnterpriseHRMS];
GO
USE [EnterpriseHRMS];
GO

-- 1. ORGANIZATION STRUCTURE MASTERS
CREATE TABLE [dbo].[Companies] (
    [CompanyId] INT IDENTITY(1,1) PRIMARY KEY,
    [CompanyCode] NVARCHAR(20) NOT NULL UNIQUE,
    [CompanyName] NVARCHAR(150) NOT NULL,
    [CIN] NVARCHAR(30) NULL,
    [RegistrationAddress] NVARCHAR(500) NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    [CreatedBy] NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    [UpdatedAt] DATETIME2 NULL,
    [UpdatedBy] NVARCHAR(100) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0
);

CREATE TABLE [dbo].[Departments] (
    [DepartmentId] INT IDENTITY(1,1) PRIMARY KEY,
    [CompanyId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Companies]([CompanyId]),
    [DepartmentCode] NVARCHAR(20) NOT NULL UNIQUE,
    [DepartmentName] NVARCHAR(100) NOT NULL,
    [ParentDepartmentId] INT NULL FOREIGN KEY REFERENCES [dbo].[Departments]([DepartmentId]),
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    [CreatedBy] NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    [UpdatedAt] DATETIME2 NULL,
    [UpdatedBy] NVARCHAR(100) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0
);

CREATE TABLE [dbo].[Designations] (
    [DesignationId] INT IDENTITY(1,1) PRIMARY KEY,
    [DesignationCode] NVARCHAR(20) NOT NULL UNIQUE,
    [DesignationTitle] NVARCHAR(100) NOT NULL,
    [Band] NVARCHAR(20) NOT NULL,
    [JobLevel] NVARCHAR(20) NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    [CreatedBy] NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    [UpdatedAt] DATETIME2 NULL,
    [UpdatedBy] NVARCHAR(100) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0
);

CREATE TABLE [dbo].[Locations] (
    [LocationId] INT IDENTITY(1,1) PRIMARY KEY,
    [LocationCode] NVARCHAR(20) NOT NULL UNIQUE,
    [City] NVARCHAR(100) NOT NULL,
    [State] NVARCHAR(100) NOT NULL,
    [Country] NVARCHAR(100) NOT NULL DEFAULT 'India',
    [PostalCode] NVARCHAR(20) NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    [CreatedBy] NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM'
);

-- 2. EMPLOYEE MASTER & PROFILES
CREATE TABLE [dbo].[Employees] (
    [EmployeeId] INT IDENTITY(1,1) PRIMARY KEY,
    [EmployeeCode] NVARCHAR(30) NOT NULL UNIQUE,
    [FirstName] NVARCHAR(100) NOT NULL,
    [LastName] NVARCHAR(100) NOT NULL,
    [OfficialEmail] NVARCHAR(150) NOT NULL UNIQUE,
    [MobilePhone] NVARCHAR(25) NOT NULL,
    [DateOfBirth] DATE NOT NULL,
    [Gender] NVARCHAR(20) NOT NULL,
    [BloodGroup] NVARCHAR(10) NULL,
    [MaritalStatus] NVARCHAR(20) NOT NULL,
    [DateOfJoining] DATE NOT NULL,
    [ConfirmationDate] DATE NULL,
    [ProbationEndDate] DATE NULL,
    [EmploymentType] NVARCHAR(30) NOT NULL DEFAULT 'Full-Time',
    [EmploymentStatus] NVARCHAR(30) NOT NULL DEFAULT 'Active', -- Active, Probation, Notice Period, Separated, Terminated
    [IsLoginBlocked] BIT NOT NULL DEFAULT 0,
    [TerminationDate] DATE NULL,
    [TerminationReason] NVARCHAR(255) NULL,
    [TerminationRemarks] NVARCHAR(MAX) NULL,
    [CompanyId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Companies]([CompanyId]),
    [DepartmentId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Departments]([DepartmentId]),
    [DesignationId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Designations]([DesignationId]),
    [LocationId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Locations]([LocationId]),
    [ReportingManagerId] INT NULL FOREIGN KEY REFERENCES [dbo].[Employees]([EmployeeId]),
    [CostCenterCode] NVARCHAR(50) NOT NULL,
    [CurrentAddress] NVARCHAR(500) NOT NULL,
    [PermanentAddress] NVARCHAR(500) NOT NULL,
    [EmergencyContactName] NVARCHAR(100) NOT NULL,
    [EmergencyContactRelation] NVARCHAR(50) NOT NULL,
    [EmergencyContactPhone] NVARCHAR(25) NOT NULL,
    [ProfilePictureUrl] NVARCHAR(500) NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    [CreatedBy] NVARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    [UpdatedAt] DATETIME2 NULL,
    [UpdatedBy] NVARCHAR(100) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0
);
CREATE NONCLUSTERED INDEX [IX_Employees_Dept_Status] ON [dbo].[Employees]([DepartmentId], [EmploymentStatus]);
CREATE NONCLUSTERED INDEX [IX_Employees_Manager] ON [dbo].[Employees]([ReportingManagerId]);

-- 3. SALARY STRUCTURES & CTC
CREATE TABLE [dbo].[SalaryStructures] (
    [SalaryStructureId] INT IDENTITY(1,1) PRIMARY KEY,
    [EmployeeId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Employees]([EmployeeId]),
    [CTCAnnual] DECIMAL(18,2) NOT NULL,
    [BasicMonthly] DECIMAL(18,2) NOT NULL,
    [HRAMonthly] DECIMAL(18,2) NOT NULL,
    [SpecialAllowanceMonthly] DECIMAL(18,2) NOT NULL,
    [PFMonthly] DECIMAL(18,2) NOT NULL,
    [ProfessionalTax] DECIMAL(18,2) NOT NULL,
    [BankName] NVARCHAR(100) NULL,
    [BankAccountNumber] NVARCHAR(50) NULL,
    [IFSCCode] NVARCHAR(20) NULL,
    [PANNumber] NVARCHAR(20) NULL,
    [AadhaarNumber] NVARCHAR(20) NULL,
    [UANNumber] NVARCHAR(30) NULL,
    [PaymentMode] NVARCHAR(30) NOT NULL DEFAULT 'Bank Transfer',
    [EffectiveFrom] DATE NOT NULL,
    [EffectiveTo] DATE NULL,
    [RevisionReason] NVARCHAR(200) NULL,
    [IsCurrent] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    [CreatedBy] NVARCHAR(100) NOT NULL
);

-- 3.1 EMPLOYEE ACADEMIC & PROFESSIONAL EDUCATION
CREATE TABLE [dbo].[EmployeeEducation] (
    [EducationId] INT IDENTITY(1,1) PRIMARY KEY,
    [EmployeeId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Employees]([EmployeeId]) ON DELETE CASCADE,
    [Degree] NVARCHAR(150) NOT NULL,
    [Institution] NVARCHAR(200) NOT NULL,
    [PassingYear] INT NOT NULL,
    [Specialization] NVARCHAR(150) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE NONCLUSTERED INDEX [IX_EmployeeEducation_EmployeeId] ON [dbo].[EmployeeEducation]([EmployeeId]);

-- 4. ATTENDANCE & BIOMETRIC PUNCHES
CREATE TABLE [dbo].[AttendanceRecords] (
    [AttendanceId] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [EmployeeId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Employees]([EmployeeId]),
    [AttendanceDate] DATE NOT NULL,
    [FirstInTime] TIME(0) NULL,
    [LastOutTime] TIME(0) NULL,
    [TotalWorkMinutes] INT NOT NULL DEFAULT 0,
    [BreakMinutes] INT NOT NULL DEFAULT 0,
    [OvertimeMinutes] INT NOT NULL DEFAULT 0,
    [Status] NVARCHAR(20) NOT NULL, -- Present, Late, Half Day, Absent, On Leave, Holiday
    [IsLate] BIT NOT NULL DEFAULT 0,
    [IsEarlyLeaving] BIT NOT NULL DEFAULT 0,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [UQ_Employee_AttendanceDate] UNIQUE ([EmployeeId], [AttendanceDate])
);
CREATE NONCLUSTERED INDEX [IX_Attendance_Date_Emp] ON [dbo].[AttendanceRecords]([AttendanceDate], [EmployeeId]);

CREATE TABLE [dbo].[AttendanceRegularizations] (
    [RegularizationId] INT IDENTITY(1,1) PRIMARY KEY,
    [AttendanceId] BIGINT NOT NULL FOREIGN KEY REFERENCES [dbo].[AttendanceRecords]([AttendanceId]),
    [EmployeeId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Employees]([EmployeeId]),
    [RequestedInTime] TIME(0) NOT NULL,
    [RequestedOutTime] TIME(0) NOT NULL,
    [ReasonCategory] NVARCHAR(100) NOT NULL,
    [EmployeeRemarks] NVARCHAR(500) NOT NULL,
    [Status] NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected
    [ApprovedByEmployeeId] INT NULL FOREIGN KEY REFERENCES [dbo].[Employees]([EmployeeId]),
    [ApprovedAt] DATETIME2 NULL,
    [ManagerRemarks] NVARCHAR(500) NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 5. CONFIGURABLE WORKFLOW ENGINE
CREATE TABLE [dbo].[WorkflowDefinitions] (
    [WorkflowId] INT IDENTITY(1,1) PRIMARY KEY,
    [WorkflowCode] NVARCHAR(50) NOT NULL UNIQUE,
    [WorkflowName] NVARCHAR(150) NOT NULL,
    [Module] NVARCHAR(50) NOT NULL, -- Leave, Attendance, Expense, Separation
    [Description] NVARCHAR(500) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE [dbo].[WorkflowSteps] (
    [WorkflowStepId] INT IDENTITY(1,1) PRIMARY KEY,
    [WorkflowId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[WorkflowDefinitions]([WorkflowId]),
    [StepNumber] INT NOT NULL,
    [StepName] NVARCHAR(100) NOT NULL,
    [ApproverType] NVARCHAR(50) NOT NULL, -- Reporting Manager, Department Head, HR Admin, Finance Admin
    [SlaDays] INT NOT NULL DEFAULT 3,
    CONSTRAINT [UQ_Workflow_Step] UNIQUE ([WorkflowId], [StepNumber])
);

CREATE TABLE [dbo].[WorkflowInstances] (
    [InstanceId] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [WorkflowId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[WorkflowDefinitions]([WorkflowId]),
    [EntityName] NVARCHAR(50) NOT NULL,
    [EntityId] NVARCHAR(50) NOT NULL,
    [InitiatedByEmployeeId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Employees]([EmployeeId]),
    [CurrentStepNumber] INT NOT NULL DEFAULT 1,
    [Status] NVARCHAR(30) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected, Cancelled
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    [CompletedAt] DATETIME2 NULL
);

CREATE TABLE [dbo].[WorkflowActionHistory] (
    [ActionId] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [InstanceId] BIGINT NOT NULL FOREIGN KEY REFERENCES [dbo].[WorkflowInstances]([InstanceId]),
    [StepNumber] INT NOT NULL,
    [ActorEmployeeId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Employees]([EmployeeId]),
    [Action] NVARCHAR(30) NOT NULL, -- Submitted, Approved, Rejected, Sent Back
    [Remarks] NVARCHAR(1000) NULL,
    [ActionTimestamp] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 6. LEAVE MANAGEMENT
CREATE TABLE [dbo].[LeaveTypes] (
    [LeaveTypeId] INT IDENTITY(1,1) PRIMARY KEY,
    [LeaveTypeCode] NVARCHAR(20) NOT NULL UNIQUE,
    [LeaveTypeName] NVARCHAR(50) NOT NULL,
    [AnnualQuota] DECIMAL(5,2) NOT NULL,
    [IsCarryForwardAllowed] BIT NOT NULL DEFAULT 0,
    [IsPaidLeave] BIT NOT NULL DEFAULT 1,
    [IsActive] BIT NOT NULL DEFAULT 1
);

CREATE TABLE [dbo].[LeaveBalances] (
    [BalanceId] INT IDENTITY(1,1) PRIMARY KEY,
    [EmployeeId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Employees]([EmployeeId]),
    [LeaveTypeId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[LeaveTypes]([LeaveTypeId]),
    [FiscalYear] INT NOT NULL,
    [TotalQuota] DECIMAL(5,2) NOT NULL,
    [Used] DECIMAL(5,2) NOT NULL DEFAULT 0,
    [PendingApproval] DECIMAL(5,2) NOT NULL DEFAULT 0,
    [Available] AS ([TotalQuota] - [Used] - [PendingApproval]),
    CONSTRAINT [UQ_Employee_Leave_Year] UNIQUE ([EmployeeId], [LeaveTypeId], [FiscalYear])
);

CREATE TABLE [dbo].[LeaveRequests] (
    [LeaveRequestId] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [RequestCode] NVARCHAR(30) NOT NULL UNIQUE,
    [EmployeeId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Employees]([EmployeeId]),
    [LeaveTypeId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[LeaveTypes]([LeaveTypeId]),
    [StartDate] DATE NOT NULL,
    [EndDate] DATE NOT NULL,
    [NumberOfDays] DECIMAL(5,2) NOT NULL,
    [Reason] NVARCHAR(500) NOT NULL,
    [Status] NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected, Cancelled
    [WorkflowInstanceId] BIGINT NULL FOREIGN KEY REFERENCES [dbo].[WorkflowInstances]([InstanceId]),
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 7. PAYROLL & STATUTORY DISBURSEMENTS
CREATE TABLE [dbo].[PayrollRuns] (
    [PayrollRunId] INT IDENTITY(1,1) PRIMARY KEY,
    [BatchCode] NVARCHAR(30) NOT NULL UNIQUE,
    [PeriodMonth] INT NOT NULL CHECK ([PeriodMonth] BETWEEN 1 AND 12),
    [PeriodYear] INT NOT NULL,
    [PeriodLabel] NVARCHAR(50) NOT NULL,
    [TotalEmployees] INT NOT NULL,
    [TotalGrossPay] DECIMAL(18,2) NOT NULL,
    [TotalDeductions] DECIMAL(18,2) NOT NULL,
    [TotalNetPay] DECIMAL(18,2) NOT NULL,
    [Status] NVARCHAR(30) NOT NULL DEFAULT 'Draft', -- Draft, Validated, Approved, Finalized
    [ProcessedAt] DATETIME2 NULL,
    [FinalizedBy] NVARCHAR(100) NULL,
    [PayoutDate] DATE NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE [dbo].[Payslips] (
    [PayslipId] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [PayrollRunId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[PayrollRuns]([PayrollRunId]),
    [EmployeeId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Employees]([EmployeeId]),
    [WorkingDays] INT NOT NULL,
    [PresentDays] INT NOT NULL,
    [PaidLeaveDays] INT NOT NULL,
    [LOPDays] INT NOT NULL,
    [BasicPay] DECIMAL(18,2) NOT NULL,
    [HRAPay] DECIMAL(18,2) NOT NULL,
    [SpecialAllowance] DECIMAL(18,2) NOT NULL,
    [BonusPay] DECIMAL(18,2) NOT NULL DEFAULT 0,
    [TotalGrossPay] DECIMAL(18,2) NOT NULL,
    [PFDeduction] DECIMAL(18,2) NOT NULL,
    [PTDeduction] DECIMAL(18,2) NOT NULL,
    [TDSDeduction] DECIMAL(18,2) NOT NULL,
    [TotalDeductions] DECIMAL(18,2) NOT NULL,
    [NetSalary] DECIMAL(18,2) NOT NULL,
    [Status] NVARCHAR(20) NOT NULL DEFAULT 'Generated',
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE NONCLUSTERED INDEX [IX_Payslips_Run_Emp] ON [dbo].[Payslips]([PayrollRunId], [EmployeeId]);

-- 8. AUDIT LOGGING & COMPLIANCE
CREATE TABLE [dbo].[AuditLogs] (
    [AuditLogId] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [UserId] NVARCHAR(100) NOT NULL,
    [UserName] NVARCHAR(150) NOT NULL,
    [Module] NVARCHAR(50) NOT NULL,
    [Action] NVARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, APPROVE, REJECT, LOGIN
    [EntityName] NVARCHAR(100) NOT NULL,
    [EntityId] NVARCHAR(100) NOT NULL,
    [OldValue] NVARCHAR(MAX) NULL,
    [NewValue] NVARCHAR(MAX) NULL,
    [IpAddress] NVARCHAR(50) NOT NULL,
    [Timestamp] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE NONCLUSTERED INDEX [IX_AuditLogs_Module_Timestamp] ON [dbo].[AuditLogs]([Module], [Timestamp] DESC);
GO

-- 9. EMPLOYEE DOCUMENTS & COMPANY ISSUED RECORDS
CREATE TABLE [dbo].[EmployeeKYCDocuments] (
    [DocumentId] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [EmployeeId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Employees]([EmployeeId]),
    [Category] NVARCHAR(100) NOT NULL, -- 'Aadhaar Card', 'PAN Card', 'Bank Passbook / Cheque', 'Passport / Voter ID', 'Degree / Educational Certificate'
    [DocumentName] NVARCHAR(255) NOT NULL,
    [DocumentNumber] NVARCHAR(100) NULL, -- Masked Aadhaar, PAN Number, Bank Account #
    [FilePath] NVARCHAR(500) NOT NULL,
    [FileSizeBytes] BIGINT NOT NULL,
    [MimeType] NVARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'Pending Verification', -- 'Pending Verification', 'Verified', 'Rejected'
    [VerifiedBy] INT NULL FOREIGN KEY REFERENCES [dbo].[Employees]([EmployeeId]),
    [VerifiedAt] DATETIME2 NULL,
    [VerificationRemarks] NVARCHAR(500) NULL,
    [UploadedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    [IsActive] BIT NOT NULL DEFAULT 1
);
CREATE NONCLUSTERED INDEX [IX_EmployeeKYCDocuments_Emp_Status] ON [dbo].[EmployeeKYCDocuments]([EmployeeId], [Status]);

CREATE TABLE [dbo].[CompanyIssuedDocuments] (
    [IssuedDocId] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [EmployeeId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Employees]([EmployeeId]),
    [Category] NVARCHAR(100) NOT NULL, -- 'Form 16 / Tax Document', 'Medical & Health Insurance', 'Appraisal / Increment Letter', 'Appointment / Contract'
    [Title] NVARCHAR(255) NOT NULL,
    [FinancialYear] NVARCHAR(20) NULL, -- '2024-2025'
    [IssueDate] DATE NOT NULL,
    [ValidUntil] DATE NULL,
    [FilePath] NVARCHAR(500) NOT NULL,
    [FileSizeBytes] BIGINT NOT NULL,
    [MimeType] NVARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    [IssuedBy] NVARCHAR(150) NOT NULL,
    [Description] NVARCHAR(500) NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    [IsActive] BIT NOT NULL DEFAULT 1
);
CREATE NONCLUSTERED INDEX [IX_CompanyIssuedDocuments_Emp] ON [dbo].[CompanyIssuedDocuments]([EmployeeId]);
GO

-- 10. EMPLOYEE HELPDESK & SUPPORT QUERIES
CREATE TABLE [dbo].[SupportQueries] (
    [QueryId] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [TicketNumber] NVARCHAR(30) NOT NULL UNIQUE, -- e.g. TKT-2026-1001
    [EmployeeId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Employees]([EmployeeId]),
    [Category] NVARCHAR(100) NOT NULL, -- 'Stationery & Office Supplies', 'IT Support & Hardware', 'HR Policies & Queries', 'Payroll & Reimbursements', 'Facilities & Infrastructure', 'Other General Issue'
    [Priority] NVARCHAR(20) NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Urgent'
    [Subject] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(MAX) NOT NULL,
    [Status] NVARCHAR(30) NOT NULL DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved', 'Closed'
    [AssignedTo] NVARCHAR(150) NULL,
    [ResolutionRemarks] NVARCHAR(MAX) NULL,
    [ResolvedBy] NVARCHAR(150) NULL,
    [ResolvedAt] DATETIME2 NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE NONCLUSTERED INDEX [IX_SupportQueries_Emp_Status] ON [dbo].[SupportQueries]([EmployeeId], [Status]);
CREATE NONCLUSTERED INDEX [IX_SupportQueries_Category] ON [dbo].[SupportQueries]([Category]);
GO

