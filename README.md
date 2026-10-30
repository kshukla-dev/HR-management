# PeopleWorks Enterprise HRMS

A production-grade, enterprise Human Resource Management System (HRMS) built for large-scale organizational workflows inspired by platforms such as PeopleWorks, Workday, and Darwinbox.

## Features & Modules

1. **Role-Based Access Control (RBAC) & Persona Switcher**:
   - Supports 10 enterprise roles: Super Admin, HR Admin, HR Executive, Manager, Employee, Payroll Admin, Finance, Recruiter, Training Admin, Performance Admin.
   - Quick-switch persona dropdown in the top header for instant, seamless testing of every role's permissions and workflows.

2. **Core Employee Master & Directory**:
   - Complete employee profile tabs: Demographic Details, Organization & Hierarchy, Compensation (CTC & Components), Verified KYC Documents, Qualifications, Emergency Nominees.
   - Enterprise search, department and status filters, and one-click CSV export.

3. **Biometric Attendance & Regularization**:
   - Working real-time Punch In / Punch Out clock with live work timer.
   - 14-day daily punch register tracking First In, Last Out, break duration, and late arrivals.
   - Attendance regularization request flow connecting directly to the Line Manager approval queue.

4. **Leave Management & Holiday Calendar**:
   - Leave balances for Casual Leave, Sick Leave, Earned Leave, Comp Off, Maternity, and Unpaid Leave.
   - Multi-day working days calculation, conflict prevention, and multi-tier approval workflow tracking.

5. **Manager Approvals Command Hub**:
   - Unified actionable inbox for line managers and HR admins to Approve, Reject, or Send Back leave requests, regularization tickets, travel/expense vouchers, and exit clearances with required remarks.

6. **Payroll Processing & Digital Payslip Engine**:
   - Monthly batch execution aggregating attendance, statutory Employee Provident Fund (12%), Professional Tax, and Income Tax TDS.
   - Dual-gate batch disbursement authorization (Validated   Finalized).
   - Formal printable salary slip with full earnings, deductions, and net take-home pay.

7. **Talent Acquisition (ATS) & Auto-Conversion**:
   - Job requisition publishing and candidate applicant pipeline across stages (Applied   Screening   Interview   Selected   Offer   Joined).
   - Selecting "Joined" automatically provisions a new employee profile in the master database.

8. **Configurable Workflow Engine**:
   - Dynamic approval chain builder allowing HR administrators to add steps, configure SLA timeout days, and assign approver roles without touching application code.

9. **Performance Management System (PMS)**:
   - Quarterly appraisal cycles with self-evaluation ratings (1-5 stars) and manager evaluation feedback.

10. **Separation & Full and Final (F&F) Settlement**:
    - Contractual resignation notice with departmental asset clearance sign-offs (IT Hardware, HR, Finance, Admin) and terminal settlement calculation.

11. **Security Audit Trail & CSV Reports**:
    - Immutable audit logs capturing every user login, salary modification, and workflow action.
    - Server-side CSV report exports for employees, payroll, attendance, and audit records.

---

## 🌟 Master Specification Document for AI Dev Tools / Rebuilders

> **CRITICAL FILE:** For full end-to-end instructions on how to recreate this entire system from zero (DB schema, all 10 personas, 30+ REST APIs, and all 17 frontend modules with "Kya, Kaise, Kyon"), refer to:
> 
> 👉 **[`PROJECT_MASTER_BLUEPRINT.md`](file:///d:/peopleworks-enterprise-hrms_react/PROJECT_MASTER_BLUEPRINT.md)**

---

## Project Structure
```
├── PROJECT_MASTER_BLUEPRINT.md  # 🌟 The complete master specification for AI dev tools
├── server.ts                    # Full-Stack Node/Express API server (port 3000)
├── HRMS_SqlServer_Schema.sql    # Complete SQL Server 2022+ relational schema
├── DATABASE.md                  # Relational database specifications
├── ARCHITECTURE.md              # System design and modular monolithic architecture
├── API.md                       # Complete RESTful endpoint documentation
├── src/
│   ├── types.ts                 # Comprehensive TypeScript domain types
│   ├── server/
│   │   └── mockDb.ts            # In-memory relational database with pre-seeded demo data
│   └── app/
│       ├── core/
│       │   ├── guards/          # AuthGuard protecting authenticated routes
│       │   └── services/        # ApiService, AuthService (Signals store), LayoutService
│       ├── shared/
│       │   └── components/      # Header (Punch clock, Switcher, Notifs), Sidebar
│       └── features/            # 17 enterprise modules (HTML templates + Standalone TS)
│           ├── auth/            # Dual-mode login & fast persona selector
│           ├── dashboard/       # Role-contextual executive operations dashboard
│           ├── employees/       # Directory, search filters, and add employee wizard
│           ├── profile/         # Self-service bio, KYC upload, and company docs
│           ├── attendance/      # Biometric web punch, calendar, and regularization
│           ├── leave/           # Quota cards, apply leave, and workflow tracker
│           ├── approvals/       # Unified manager action hub (Approve/Reject/Send Back)
│           ├── payroll/         # Statutory batch engine (PF 12%, PT ₹200, TDS) & printable payslip
│           ├── recruitment/     # Requisitions, ATS pipeline, and auto-joining employee creation
│           ├── performance/     # OKRs, KPI weightages, and quarterly appraisal ratings
│           ├── travel-expense/  # Reimbursement vouchers and travel advances
│           ├── separation/      # Resignation, 4-dept clearance checklist, and F&F calculator
│           ├── workflows/       # Dynamic zero-code approval hierarchy engine
│           ├── organization/    # Interactive org chart and structural masters
│           ├── team/            # Line manager team roster & live attendance status
│           ├── audit/           # Tamper-evident security and data modification logs
│           └── reports/         # Workforce intelligence analytics & one-click CSV export
```

## Running the Application
- `npm run server` or `npm run dev`: Starts the Express backend on port 3000 (`tsx server.ts`).
- `npm start`: Runs the Angular 19 frontend development server on port 4200.
- `npm run build`: Compiles production assets into `dist/`.

"# HR-management" 
