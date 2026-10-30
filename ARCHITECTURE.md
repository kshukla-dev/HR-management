# System Architecture & Technical Design

## 1. Architectural Philosophy
The application follows a clean Modular Monolith architecture inspired by enterprise HR systems like PeopleWorks. It is structured into high-cohesion functional modules designed for enterprise scalability:

```
Angular 20 / React Enterprise SPA
           ↓
ASP.NET Core / Express REST API Layer
           ↓
Application Services & Workflow Engine
           ↓
Domain Aggregates & EF Core Entities
           ↓
Microsoft SQL Server Relational Database
```

## 2. Core Modules
1. **Identity & Role-Based Access Control (RBAC)**:
   - Configurable permission matrix supporting granular permissions (e.g., `Employee.View`, `Salary.*`, `Leave.Approve`).
   - Supports 10 enterprise personas: Super Admin, HR Admin, HR Executive, Manager, Employee, Payroll Admin, Finance, Recruiter, Training Admin, Performance Admin.

2. **Configurable Workflow Engine**:
   - Zero-code approval chain configuration.
   - Dynamic step execution:
     - Reporting Manager   HR Admin   Finance Admin   Approved.
   - Every action records state transitions into `WorkflowActionHistory`.
   - Supports sequential approvals, delegation, timeout escalation, and send-back loops.

3. **Attendance & Biometric Processing**:
   - High-throughput daily punch aggregation.
   - Automatic determination of Late Arrival, Early Departure, Half Day, and Absenteeism.
   - Line manager regularization workflow with audit logging.

4. **Payroll Processing & Statutory Calculation**:
   - Configurable compensation components: Basic Salary (40-50%), House Rent Allowance (50% of Basic), Special Allowance.
   - Automated statutory withholding:
     - Employee Provident Fund (12% of Basic capped at statutory limits).
     - Professional Tax (State-specific slab, standard ₹200).
     - Income Tax TDS deduction.
   - Dual-gate payroll batch authorization: Validation   Executive Authorization   Disbursement.

5. **Talent Acquisition (ATS) & Conversion**:
   - Multi-stage candidate funnel.
   - Automatic Candidate-to-Employee transformation when candidate status reaches `Joined`.

6. **Separation & Terminal Settlement (F&F)**:
   - Multi-department clearance protocol (IT Hardware, HR, Finance, Admin).
   - Real-time Full and Final settlement computation factoring unpaid salary, accrued leave encashment, and notice recovery.
