# Database Architecture & Entity Specifications

## 1. Overview
The database for the Enterprise HRMS is modeled for Microsoft SQL Server 2022 / Azure SQL Database. The schema is normalized (3NF), enforces primary keys, foreign key constraints with indexed lookup paths, check constraints, audit timestamps, and soft deletes.

## 2. Table Catalog
1. **Organization Masters**:
   - `Companies`: Top-level corporate entities with CIN, corporate registration numbers, and tax residency.
   - `Departments`: Business departments and sub-departments with hierarchical self-referencing foreign keys.
   - `Designations`: Job titles mapped to formal Grade Bands (Band 1 through Band 6) and Job Levels (L1 through L7).
   - `Locations`: Physical corporate offices and delivery campuses.

2. **Core Employee Management**:
   - `Employees`: Normalized master holding personal, contact, emergency nominee, statutory, profile picture URL, and reporting manager relationships (`ReportingManagerId` self-referential FK).
   - `SalaryStructures`: Versioned CTC structures with monthly Basic, HRA, Special Allowance, PF, and Professional Tax breakdown, plus Banking Mandate (`BankName`, `BankAccountNumber`, `IFSCCode`, `PaymentMode`) and Statutory IDs (`PANNumber`, `AadhaarNumber`, `UANNumber`).
   - `EmployeeEducation`: Academic degrees, institutions, passing year, and specializations with foreign key to `Employees`.
   - `EmployeeKYCDocuments`: Verification status metadata, file sizes, and storage URLs.

3. **Attendance & Biometric Engine**:
   - `AttendanceRecords`: Daily punch timestamps (`FirstInTime`, `LastOutTime`), total work minutes, break minutes, overtime, and late flags. Unique constraint on `(EmployeeId, AttendanceDate)`.
   - `AttendanceRegularizations`: Workflow-tracked requests submitted by employees to rectify delayed punches or biometric reader errors.

4. **Leave Management**:
   - `LeaveTypes`: Configurable quotas for Casual Leave, Sick Leave, Earned Leave, Maternity, Paternity, and Comp-Off.
   - `LeaveBalances`: Annual allocation, used balance, pending approval holds, and computed available days.
   - `LeaveRequests`: Applications linked to the Workflow Engine with date ranges, reason, and status.

5. **Configurable Workflow Engine**:
   - `WorkflowDefinitions`: Modular approval blueprints for Leave, Attendance, Expense, and Separation.
   - `WorkflowSteps`: Sequential steps, approver types (Reporting Manager, HR Admin, Finance Admin), and SLA timeouts.
   - `WorkflowInstances`: Live execution tracking for every active approval request.
   - `WorkflowActionHistory`: Immutable audit history of every Approve, Reject, or Send Back action with actor name and remarks.

6. **Payroll & Statutory Disbursements**:
   - `PayrollRuns`: Monthly batch cycles (e.g. September 2026), total gross pay, statutory deductions, net payout, and validation status.
   - `Payslips`: Line-item earnings and statutory deductions (PF 12%, Professional Tax, TDS withholding, Health Insurance) with take-home pay.

7. **Recruitment & Separation**:
   - `JobRequisitions`: Open headcount requisitions, target dates, budget salary ranges, and hiring managers.
   - `Candidates`: ATS candidate applications with stage progression: Applied   Screening   Interview   Selected   Offer   Joined.
   - `SeparationRequests`: Resignation submissions with 60-day notice periods, reasons, and Last Working Day (LWD).
   - `SeparationClearances`: Mandatory multi-department asset and financial clearance checkpoints (IT Hardware, HR, Finance, Admin).

8. **Audit Logging & Compliance**:
   - `AuditLogs`: Security and operational audit log storing user ID, action (CREATE, UPDATE, APPROVE, PROCESS), entity, old value, new value, timestamp, and client IP.

9. **Employee Documents & Company Records**:
   - `EmployeeKYCDocuments`: Mandatory identity and verification records uploaded by employees (Aadhaar Card, PAN Card, Bank Passbook / Cancelled Cheque, Passport, Educational Degrees, Previous Experience Letters) with verification status (`Pending Verification`, `Verified`, `Rejected`), reviewer remarks, and audit timestamps.
   - `CompanyIssuedDocuments`: Official corporate documents issued to employees (Form 16 Part A & B, Group Health Insurance E-Cards, Annual Appraisal / Increment Letters, Appointment Letters, Non-Disclosure Agreements) with financial year, validity dates, issuer department, and one-click employee download access.
