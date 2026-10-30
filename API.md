# RESTful API Documentation

## Base URL
`/api`

## Authentication & Authorization
All authenticated endpoints require an Authorization bearer token.
- `POST /api/auth/login`: Authenticates with email or role persona switch.
- `GET /api/auth/me`: Retrieves currently authenticated user profile and permissions.
- `GET /api/users`: Lists all active enterprise personas for seamless role switching.

## Employee Management
- `GET /api/employees`: Query employees with filters (`q`, `department`, `status`, `page`, `limit`).
- `GET /api/employees/:id`: Retrieve detailed employee profile including salary, documents, and education.
- `POST /api/employees`: Create new employee with auto-assigned `EMP-xxxx` and `PW-xxxx` codes.
- `PUT /api/employees/:id`: Update employee details and log audit trail changes.

## Attendance & Regularization
- `GET /api/attendance`: Query attendance logs by `employeeId`, `date`, or `month`.
- `POST /api/attendance/check-in`: Register biometric web in-punch with live time tracking.
- `POST /api/attendance/check-out`: Register out-punch and calculate total hours worked.
- `POST /api/attendance/regularize`: Submit regularization for missing punches or delays.
- `POST /api/attendance/regularize/:id/action`: Manager approval or rejection of regularization.

## Leave Management
- `GET /api/leaves/balances/:employeeId`: Fetch available quotas for Casual, Sick, Earned, and Comp-Off leaves.
- `GET /api/leaves/requests`: List leave requests filtered by status and employee ID.
- `POST /api/leaves/apply`: Apply for leave with auto working days calculation.
- `POST /api/leaves/requests/:id/action`: Multi-step approval action (Approved, Rejected, Sent Back).

## Workflow Engine
- `GET /api/workflows/definitions`: Retrieve all active approval workflow definitions.
- `PUT /api/workflows/definitions/:id`: Update steps, approver types, and SLA timeouts.
- `GET /api/workflows/pending/:role`: Get count and items awaiting action for a specific role.

## Payroll Processing
- `GET /api/payroll/runs`: List historical and current monthly payroll batches.
- `POST /api/payroll/process`: Execute payroll batch computation for specified month and year.
- `POST /api/payroll/runs/:id/action`: Authorize payout disbursement.
- `GET /api/payroll/payslips/:employeeId`: List payslips for an employee.
- `GET /api/payroll/payslip/:id`: Get formal printable payslip breakdown.

## Recruitment & ATS
- `GET /api/recruitment/jobs`: List open job requisitions.
- `POST /api/recruitment/jobs`: Publish new job requisition.
- `GET /api/recruitment/candidates`: List candidate applications across all stages.
- `PUT /api/recruitment/candidates/:id/stage`: Advance candidate stage (auto-converts to employee on 'Joined').

## Travel & Expenses
- `GET /api/travel-expenses`: List claims and advances.
- `POST /api/travel-expenses`: Submit reimbursement request.
- `POST /api/travel-expenses/:id/action`: Line manager or Finance sign-off.

## Separation & F&F
- `GET /api/separation`: List active resignation and exit cases.
- `POST /api/separation/apply`: Submit resignation notice.
- `PUT /api/separation/:id/clearance`: Departmental sign-off for IT, HR, Finance, or Admin.

## Audit Logs & Export
- `GET /api/audit-logs`: Query tamper-evident security and operations audit records.
- `GET /api/reports/summary`: Aggregate statistics on headcount, attrition, and requisition status.
- `GET /api/reports/export/:type`: Download real CSV exports for `employees`, `payroll`, `attendance`, and `audit`.
