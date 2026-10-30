import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import {
  User, Employee, AttendanceRecord, LeaveBalance,
  LeaveRequest, PayrollRun, Payslip,
  TravelExpenseRequest, SeparationRequest, NotificationItem,
  EmployeeKycDocument, CompanyIssuedDocument
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) { }

  // Auth
  login(payload: { email?: string; role?: string; password?: string }): Observable<{ success: boolean; token: string; refreshToken: string; user: User }> {
    return this.http.post<{ success: boolean; token: string; refreshToken: string; user: User }>(`${this.baseUrl}/auth/login`, payload);
  }

  changePassword(payload: { userId?: string; email?: string; currentPassword: string; newPassword: string }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/auth/change-password`, payload);
  }

  getMe(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.baseUrl}/auth/me`);
  }

  getUsers(): Observable<{ success: boolean; users: User[] }> {
    return this.http.get<{ success: boolean; users: User[] }>(`${this.baseUrl}/users`);
  }

  // Employees
  getEmployees(params?: { q?: string; department?: string; status?: string; page?: number; limit?: number }): Observable<{ success: boolean; employees: Employee[]; total: number }> {
    let httpParams = new HttpParams();
    if (params?.q) httpParams = httpParams.set('q', params.q);
    if (params?.department) httpParams = httpParams.set('department', params.department);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.page) httpParams = httpParams.set('page', String(params.page));
    if (params?.limit) httpParams = httpParams.set('limit', String(params.limit));

    return this.http.get<{ success: boolean; employees: Employee[]; total: number }>(`${this.baseUrl}/employees`, { params: httpParams });
  }

  getEmployeeById(id: string): Observable<{ success: boolean; employee: Employee }> {
    return this.http.get<{ success: boolean; employee: Employee }>(`${this.baseUrl}/employees/${id}`);
  }

  createEmployee(employee: Partial<Employee>): Observable<{ success: boolean; employee: Employee }> {
    return this.http.post<{ success: boolean; employee: Employee }>(`${this.baseUrl}/employees`, employee);
  }

  updateEmployee(id: string, data: Partial<Employee>): Observable<{ success: boolean; employee: Employee }> {
    return this.http.put<{ success: boolean; employee: Employee }>(`${this.baseUrl}/employees/${id}`, data);
  }

  deleteEmployee(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/employees/${id}`);
  }

  terminateEmployee(id: string, payload: {
    reason: string;
    remarks?: string;
    actionType?: 'terminate' | 'reactivate';
    performedBy?: string;
  }): Observable<{ success: boolean; employee: Employee; user?: User; message: string }> {
    return this.http.post<{ success: boolean; employee: Employee; user?: User; message: string }>(
      `${this.baseUrl}/employees/${id}/terminate`,
      payload
    );
  }

  restoreDefaultEmployees(): Observable<{ success: boolean; message: string; totalEmployees: number }> {
    return this.http.post<{ success: boolean; message: string; totalEmployees: number }>(
      `${this.baseUrl}/employees/restore-defaults`,
      {}
    );
  }

  // Documents
  getEmployeeDocuments(employeeId: string): Observable<{
    success: boolean;
    employeeId: string;
    employeeName: string;
    kycDocuments: EmployeeKycDocument[];
    companyDocuments: CompanyIssuedDocument[];
  }> {
    return this.http.get<{
      success: boolean;
      employeeId: string;
      employeeName: string;
      kycDocuments: EmployeeKycDocument[];
      companyDocuments: CompanyIssuedDocument[];
    }>(`${this.baseUrl}/employees/${employeeId}/documents`);
  }

  uploadEmployeeKycDocument(employeeId: string, payload: {
    category: string;
    name: string;
    documentNumber?: string;
    fileSize?: string;
    remarks?: string;
  }): Observable<{ success: boolean; document: EmployeeKycDocument }> {
    return this.http.post<{ success: boolean; document: EmployeeKycDocument }>(
      `${this.baseUrl}/employees/${employeeId}/documents/upload`,
      payload
    );
  }

  verifyEmployeeKycDocument(employeeId: string, docId: string, payload: {
    status: 'Verified' | 'Rejected';
    remarks?: string;
    reviewerName?: string;
  }): Observable<{ success: boolean; document: EmployeeKycDocument }> {
    return this.http.put<{ success: boolean; document: EmployeeKycDocument }>(
      `${this.baseUrl}/employees/${employeeId}/documents/${docId}/verify`,
      payload
    );
  }

  deleteEmployeeKycDocument(employeeId: string, docId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/employees/${employeeId}/documents/${docId}`
    );
  }

  issueCompanyDocument(employeeId: string, payload: {
    category: string;
    title: string;
    financialYear?: string;
    validUntil?: string;
    fileSize?: string;
    issuedBy?: string;
    description?: string;
  }): Observable<{ success: boolean; document: CompanyIssuedDocument }> {
    return this.http.post<{ success: boolean; document: CompanyIssuedDocument }>(
      `${this.baseUrl}/employees/${employeeId}/company-documents/issue`,
      payload
    );
  }

  deleteCompanyDocument(employeeId: string, docId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/employees/${employeeId}/company-documents/${docId}`
    );
  }

  downloadDocument(docId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/documents/download/${docId}`, { responseType: 'blob' });
  }

  // Attendance
  getAttendance(params?: { employeeId?: string; date?: string; month?: string }): Observable<{ success: boolean; attendance: AttendanceRecord[] }> {
    let httpParams = new HttpParams();
    if (params?.employeeId) httpParams = httpParams.set('employeeId', params.employeeId);
    if (params?.date) httpParams = httpParams.set('date', params.date);
    if (params?.month) httpParams = httpParams.set('month', params.month);

    return this.http.get<{ success: boolean; attendance: AttendanceRecord[] }>(`${this.baseUrl}/attendance`, { params: httpParams });
  }

  checkIn(employeeId: string): Observable<{ success: boolean; record: AttendanceRecord }> {
    return this.http.post<{ success: boolean; record: AttendanceRecord }>(`${this.baseUrl}/attendance/check-in`, { employeeId });
  }

  checkOut(employeeId: string): Observable<{ success: boolean; record: AttendanceRecord }> {
    return this.http.post<{ success: boolean; record: AttendanceRecord }>(`${this.baseUrl}/attendance/check-out`, { employeeId });
  }

  regularize(data: { employeeId?: string; date?: string; inTime?: string; outTime?: string; reason: string; attendanceId?: string; requestedInTime?: string; requestedOutTime?: string }): Observable<{ success: boolean; record: AttendanceRecord }> {
    return this.http.post<{ success: boolean; record: AttendanceRecord }>(`${this.baseUrl}/attendance/regularize`, data);
  }

  regularizeAttendance(data: { employeeId?: string; date?: string; inTime?: string; outTime?: string; reason: string; attendanceId?: string; requestedInTime?: string; requestedOutTime?: string }): Observable<{ success: boolean; record: AttendanceRecord }> {
    return this.http.post<{ success: boolean; record: AttendanceRecord }>(`${this.baseUrl}/attendance/regularize`, data);
  }

  actionRegularization(recordId: string, action: 'Approved' | 'Rejected' | 'Sent Back' | string, comment?: string): Observable<{ success: boolean; record: AttendanceRecord }> {
    return this.http.post<{ success: boolean; record: AttendanceRecord }>(`${this.baseUrl}/attendance/regularization/${recordId}/action`, { action, comment });
  }

  // Leaves
  getLeaveBalances(employeeId: string): Observable<{ success: boolean; balances: LeaveBalance[] }> {
    return this.http.get<{ success: boolean; balances: LeaveBalance[] }>(`${this.baseUrl}/leaves/balances/${employeeId}`);
  }

  getLeaveRequests(params?: { employeeId?: string; status?: string }): Observable<{ success: boolean; requests: LeaveRequest[] }> {
    let httpParams = new HttpParams();
    if (params?.employeeId) httpParams = httpParams.set('employeeId', params.employeeId);
    if (params?.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<{ success: boolean; requests: LeaveRequest[] }>(`${this.baseUrl}/leaves/requests`, { params: httpParams });
  }

  applyLeave(data: { employeeId: string; leaveType: string; startDate: string; endDate: string; reason: string; numberOfDays: number }): Observable<{ success: boolean; request: LeaveRequest }> {
    return this.http.post<{ success: boolean; request: LeaveRequest }>(`${this.baseUrl}/leaves/apply`, data);
  }

  actionLeave(id: string, payload: {
    action: 'Approved' | 'Rejected' | 'Sent Back' | string;
    comment?: string;
    stepIndex?: number;
    actorRole?: string;
    actorName?: string;
  }): Observable<{ success: boolean; request: LeaveRequest }> {
    return this.http.post<{ success: boolean; request: LeaveRequest }>(`${this.baseUrl}/leaves/requests/${id}/action`, payload);
  }

  resubmitLeave(id: string, payload: {
    startDate: string;
    endDate: string;
    leaveType: string;
    numberOfDays: number;
    reason: string;
    actorName?: string;
  }): Observable<{ success: boolean; request: LeaveRequest }> {
    return this.http.put<{ success: boolean; request: LeaveRequest }>(`${this.baseUrl}/leaves/requests/${id}/resubmit`, payload);
  }

  // Approvals Hub
  getPendingApprovals(role: string, managerId?: string): Observable<{ success: boolean; pending: { leaves: LeaveRequest[]; regularizations: AttendanceRecord[]; expenses: TravelExpenseRequest[]; separations: SeparationRequest[] } }> {
    let httpParams = new HttpParams();
    if (managerId) httpParams = httpParams.set('managerId', managerId);

    return this.http.get<{ success: boolean; pending: { leaves: LeaveRequest[]; regularizations: AttendanceRecord[]; expenses: TravelExpenseRequest[]; separations: SeparationRequest[] } }>(`${this.baseUrl}/workflows/pending/${encodeURIComponent(role)}`, { params: httpParams });
  }

  // Payroll
  getPayrollRuns(): Observable<{ success: boolean; runs: PayrollRun[] }> {
    return this.http.get<{ success: boolean; runs: PayrollRun[] }>(`${this.baseUrl}/payroll/runs`);
  }

  processPayroll(periodMonth: number, periodYear: number): Observable<{ success: boolean; run: PayrollRun }> {
    return this.http.post<{ success: boolean; run: PayrollRun }>(`${this.baseUrl}/payroll/process`, { periodMonth, periodYear });
  }

  finalizePayroll(runId: string): Observable<{ success: boolean; run: PayrollRun }> {
    return this.http.post<{ success: boolean; run: PayrollRun }>(`${this.baseUrl}/payroll/runs/${runId}/action`, { action: 'Finalize' });
  }

  getPayslipsForRun(runId: string): Observable<{ success: boolean; run: PayrollRun; payslips: Payslip[] }> {
    return this.http.get<{ success: boolean; run: PayrollRun; payslips: Payslip[] }>(`${this.baseUrl}/payroll/runs/${runId}/payslips`);
  }

  getPayslipsForEmployee(employeeId: string): Observable<{ success: boolean; payslips: Payslip[] }> {
    return this.http.get<{ success: boolean; payslips: Payslip[] }>(`${this.baseUrl}/payroll/payslips/${employeeId}`);
  }

  getPayslip(id: string): Observable<{ success: boolean; payslip: Payslip }> {
    return this.http.get<{ success: boolean; payslip: Payslip }>(`${this.baseUrl}/payroll/payslip/${id}`);
  }

  // Travel & Expenses
  getTravelExpenses(params?: { employeeId?: string }): Observable<{ success: boolean; items: TravelExpenseRequest[] }> {
    let httpParams = new HttpParams();
    if (params?.employeeId) {
      httpParams = httpParams.set('employeeId', params.employeeId);
    }
    return this.http.get<{ success: boolean; items: TravelExpenseRequest[] }>(`${this.baseUrl}/travel-expenses`, { params: httpParams });
  }

  createTravelExpense(data: Partial<TravelExpenseRequest>): Observable<{ success: boolean; item: TravelExpenseRequest }> {
    return this.http.post<{ success: boolean; item: TravelExpenseRequest }>(`${this.baseUrl}/travel-expenses`, data);
  }

  actionTravelExpense(id: string, action: 'Approve' | 'Reject'): Observable<{ success: boolean; item: TravelExpenseRequest }> {
    return this.http.post<{ success: boolean; item: TravelExpenseRequest }>(`${this.baseUrl}/travel-expenses/${id}/action`, { action });
  }

  // Separation
  getSeparations(): Observable<{ success: boolean; separations: SeparationRequest[] }> {
    return this.http.get<{ success: boolean; separations: SeparationRequest[] }>(`${this.baseUrl}/separation`);
  }

  applySeparation(data: { employeeId: string; reason: string; proposedLwd: string; comments: string }): Observable<{ success: boolean; separation: SeparationRequest }> {
    return this.http.post<{ success: boolean; separation: SeparationRequest }>(`${this.baseUrl}/separation/apply`, data);
  }

  updateClearance(id: string, data: { department: string; status: 'Cleared' | 'Pending'; remarks?: string; actorName?: string }): Observable<{ success: boolean; separation: SeparationRequest }> {
    return this.http.put<{ success: boolean; separation: SeparationRequest }>(`${this.baseUrl}/separation/${id}/clearance`, data);
  }

  finalizeSeparation(id: string, data: { actorName?: string; remarks?: string }): Observable<{ success: boolean; separation: SeparationRequest; message: string }> {
    return this.http.post<{ success: boolean; separation: SeparationRequest; message: string }>(`${this.baseUrl}/separation/${id}/finalize`, data);
  }

  // Notifications
  getNotifications(): Observable<{ success: boolean; notifications: NotificationItem[] }> {
    return this.http.get<{ success: boolean; notifications: NotificationItem[] }>(`${this.baseUrl}/notifications`);
  }

  markNotificationRead(id: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.baseUrl}/notifications/${id}/read`, {});
  }

  markAllNotificationsRead(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.baseUrl}/notifications/mark-all-read`, {});
  }

  // Reports Summary (for Dashboard KPI)
  getReportSummary(): Observable<{ success: boolean; stats: any }> {
    return this.http.get<{ success: boolean; stats: any }>(`${this.baseUrl}/reports/summary`);
  }

  getExportUrl(type: 'employees' | 'payroll' | 'attendance'): string {
    return `${this.baseUrl}/reports/export/${type}`;
  }
}
