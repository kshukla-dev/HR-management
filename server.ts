import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, createInitialDatabase } from './src/server/mockDb';
import {
  Employee, AttendanceRecord, LeaveRequest, Payslip,
  TravelExpenseRequest, SeparationRequest, NotificationItem,
  PayrollRun, EmployeeKycDocument, CompanyIssuedDocument
} from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function logAudit(
  _userId: string,
  _userName: string,
  _module: string,
  _action: string,
  _entity: string,
  _entityId: string,
  _newValue?: string,
  _oldValue?: string
) {
  // Audit logging removed
}

function addNotification(
  userId: string,
  title: string,
  message: string,
  category: NotificationItem['category'],
  linkUrl?: string
) {
  const notif: NotificationItem = {
    id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    title,
    message,
    category,
    read: false,
    timestamp: new Date().toISOString(),
    linkUrl
  };
  db.notifications.unshift(notif);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Enable CORS for Angular frontend (localhost:4200)
  app.use((req: Request, res: Response, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ---------------- AUTHENTICATION & SESSIONS ----------------
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, role, password } = req.body;
    let user: any = undefined;

    if (email) {
      user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: `No account found with email "${email}"` });
      }

      if (user.isBlocked || user.isActive === false) {
        return res.status(403).json({
          success: false,
          message: 'Account Access Revoked: This employee account has been terminated/deactivated by HR or System Administrator. You can no longer log in.'
        });
      }

      const emp = db.employees.find(e => e.id === user.employeeId || e.email.toLowerCase() === user.email.toLowerCase());
      if (emp && (emp.employmentStatus === 'Terminated' || emp.isLoginBlocked)) {
        return res.status(403).json({
          success: false,
          message: `Account Access Revoked: Employee status is marked as "${emp.employmentStatus}". Login access has been revoked by HR/Admin.`
        });
      }

      if (password) {
        const expectedPassword = user.password || 'jacksonandfranc@123';
        if (password !== expectedPassword) {
          return res.status(401).json({ success: false, message: 'Invalid password. (Default password: jacksonandfranc@123)' });
        }
      }
    } else if (role) {
      user = db.users.find(u => u.role.toLowerCase() === role.toLowerCase() && !u.isBlocked);
      if (!user) {
        user = db.users.find(u => u.role.toLowerCase() === role.toLowerCase());
      }
      if (user && (user.isBlocked || user.isActive === false)) {
        return res.status(403).json({
          success: false,
          message: 'Account Access Revoked: This role account has been deactivated.'
        });
      }
    }

    if (!user) {
      user = db.users[0]; // fallback
    }

    logAudit(user.id, user.name, 'Auth', 'LOGIN', 'UserSession', user.id, `User logged in with role: ${user.role}`);

    const token = `jwt_mock_${user.id}_${Date.now()}`;
    const refreshToken = `ref_${user.id}_${Date.now()}`;

    res.json({
      success: true,
      token,
      refreshToken,
      user
    });
  });

  app.post('/api/auth/change-password', (req: Request, res: Response) => {
    const { userId, email, currentPassword, newPassword } = req.body;
    const user = db.users.find(u => (userId && u.id === userId) || (email && u.email.toLowerCase() === email.toLowerCase()));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    const expectedPassword = user.password || 'jacksonandfranc@123';
    if (currentPassword !== expectedPassword) {
      return res.status(400).json({ success: false, message: 'Current password does not match' });
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    user.password = newPassword.trim();
    user.mustChangePassword = false;

    logAudit(user.id, user.name, 'Auth', 'UPDATE', 'UserCredential', user.id, 'User changed account password successfully');
    res.json({ success: true, message: 'Password updated successfully' });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.includes('usr-')) {
      const match = authHeader.match(/usr-[a-z0-9-]+/);
      if (match) {
        const u = db.users.find(x => x.id === match[0]);
        if (u) return res.json({ success: true, user: u });
      }
    }
    res.json({ success: true, user: db.users[0] });
  });

  app.get('/api/users', (req: Request, res: Response) => {
    res.json({ success: true, users: db.users });
  });

  // ---------------- EMPLOYEES ----------------
  app.get('/api/employees', (req: Request, res: Response) => {
    const { q, department, status, page = 1, limit = 50 } = req.query;
    let result = db.employees.filter(e => !e.isDeleted);

    if (q) {
      const query = (q as string).toLowerCase();
      result = result.filter(e =>
        e.firstName.toLowerCase().includes(query) ||
        e.lastName.toLowerCase().includes(query) ||
        e.email.toLowerCase().includes(query) ||
        e.employeeCode.toLowerCase().includes(query) ||
        e.designation.toLowerCase().includes(query)
      );
    }

    if (department && department !== 'All') {
      result = result.filter(e => e.department === department);
    }

    if (status && status !== 'All') {
      result = result.filter(e => e.employmentStatus === status);
    }

    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = result.slice(startIndex, startIndex + Number(limit));

    res.json({
      success: true,
      total: result.length,
      page: Number(page),
      limit: Number(limit),
      employees: paginated
    });
  });

  app.get('/api/employees/:id', (req: Request, res: Response) => {
    const emp = db.employees.find(e => e.id === req.params.id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, employee: emp });
  });

  app.post('/api/employees', (req: Request, res: Response) => {
    const payload = req.body;
    const nextNum = 1000 + db.employees.length + 1;
    const newEmpId = `EMP-${nextNum}`;
    const newEmpCode = `PW-${nextNum}`;

    let managerName = payload.reportingManagerName || '';
    if (payload.reportingManagerId) {
      const mgr = db.employees.find(e => e.id === payload.reportingManagerId);
      if (mgr) {
        managerName = `${mgr.firstName} ${mgr.lastName}`;
      }
    }

    const newEmp: Employee = {
      ...payload,
      id: newEmpId,
      employeeCode: newEmpCode,
      reportingManagerId: payload.reportingManagerId || '',
      reportingManagerName: managerName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.employees.unshift(newEmp);

    // Initialize default leave balances
    db.leaveBalances[newEmpId] = [
      { leaveType: 'Casual Leave', totalQuota: 12, used: 0, pending: 0, available: 12 },
      { leaveType: 'Sick Leave', totalQuota: 10, used: 0, pending: 0, available: 10 },
      { leaveType: 'Earned Leave', totalQuota: 15, used: 0, pending: 0, available: 15 },
      { leaveType: 'Comp Off', totalQuota: 0, used: 0, pending: 0, available: 0 }
    ];

    // Automatically create or sync user login credentials
    const defaultPassword = 'jacksonandfranc@123';
    const newUserId = `usr-${newEmpId.toLowerCase()}`;
    const userRole = (newEmp.designation?.toLowerCase().includes('director') || newEmp.designation?.toLowerCase().includes('lead') || newEmp.designation?.toLowerCase().includes('manager')) ? 'Manager' : 'Employee';
    const existingUserIdx = db.users.findIndex(u => u.email.toLowerCase() === newEmp.email.toLowerCase());

    if (existingUserIdx !== -1) {
      db.users[existingUserIdx] = {
        ...db.users[existingUserIdx],
        employeeId: newEmpId,
        name: `${newEmp.firstName} ${newEmp.lastName}`.trim(),
        role: userRole,
        department: newEmp.department,
        designation: newEmp.designation,
        password: db.users[existingUserIdx].password || defaultPassword
      };
    } else {
      db.users.push({
        id: newUserId,
        employeeId: newEmpId,
        name: `${newEmp.firstName} ${newEmp.lastName}`.trim(),
        email: newEmp.email,
        role: userRole,
        password: defaultPassword,
        mustChangePassword: true,
        department: newEmp.department,
        designation: newEmp.designation,
        permissions: ['Self.*'],
        avatarUrl: newEmp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
    }

    logAudit('SYSTEM', 'HR Admin', 'Employee', 'CREATE', 'Employee', newEmpId, `Created employee ${newEmp.firstName} ${newEmp.lastName} (${newEmpCode}) assigned to Reporting Manager ${newEmp.reportingManagerName || 'None'}`);
    logAudit('SYSTEM', 'HR Admin', 'Auth', 'CREATE', 'UserCredential', newUserId, `Generated employee login for ${newEmp.email} with default initial password.`);

    addNotification('usr-admin', 'New Employee Onboarded', `${newEmp.firstName} ${newEmp.lastName} (${newEmpCode}) added with login credentials.`, 'Employee', '/employees');

    res.status(201).json({ success: true, employee: newEmp });
  });

  app.put('/api/employees/:id', (req: Request, res: Response) => {
    const index = db.employees.findIndex(e => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const old = db.employees[index];
    const payload = req.body;

    let managerName = payload.reportingManagerName || old.reportingManagerName || '';
    if (payload.reportingManagerId) {
      const mgr = db.employees.find(e => e.id === payload.reportingManagerId);
      if (mgr) {
        managerName = `${mgr.firstName} ${mgr.lastName}`;
      }
    }

    const updated: Employee = {
      ...old,
      ...payload,
      reportingManagerName: managerName,
      updatedAt: new Date().toISOString()
    };
    db.employees[index] = updated;

    logAudit('usr-admin', 'Administrator', 'Employee', 'UPDATE', 'Employee', updated.id, `Updated master profile for ${updated.firstName} ${updated.lastName} (${updated.employeeCode})`);

    res.json({ success: true, employee: updated });
  });

  app.delete('/api/employees/:id', (req: Request, res: Response) => {
    const index = db.employees.findIndex(e => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const emp = db.employees[index];
    emp.isDeleted = true;
    db.employees.splice(index, 1);

    logAudit('usr-admin', 'Administrator', 'Employee', 'DELETE', 'Employee', emp.id, `Deleted employee master record: ${emp.firstName} ${emp.lastName} (${emp.employeeCode})`);
    addNotification('usr-admin', 'Employee Record Deleted', `Employee ${emp.firstName} ${emp.lastName} (${emp.employeeCode}) was permanently removed from organizational directory.`, 'System');

    res.json({ success: true, message: `Employee ${emp.firstName} ${emp.lastName} (${emp.employeeCode}) removed successfully` });
  });

  app.post('/api/employees/:id/terminate', (req: Request, res: Response) => {
    const index = db.employees.findIndex(e => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const { reason, remarks, performedBy, actionType = 'terminate' } = req.body;
    const isReactivate = actionType === 'reactivate';
    const emp = db.employees[index];

    emp.employmentStatus = isReactivate ? 'Active' : 'Terminated';
    emp.isLoginBlocked = !isReactivate;
    emp.terminationReason = isReactivate ? undefined : (reason || 'Terminated / Resigned');
    emp.terminationDate = isReactivate ? undefined : new Date().toISOString().split('T')[0];
    emp.terminationRemarks = remarks || '';
    emp.updatedAt = new Date().toISOString();

    // Block or restore corresponding user login credential
    const user = db.users.find(u => u.employeeId === emp.id || u.email.toLowerCase() === emp.email.toLowerCase());
    if (user) {
      user.isBlocked = !isReactivate;
      user.isActive = isReactivate;
      user.statusComment = isReactivate ? 'Active' : (remarks || reason || 'Terminated: Login access revoked');
    }

    logAudit(
      'usr-admin',
      performedBy || 'HR Admin',
      'Employee',
      isReactivate ? 'UPDATE' : 'DELETE',
      'EmployeeStatus',
      emp.id,
      `${isReactivate ? 'Restored login access and reactivated employee' : 'Terminated employee and permanently revoked login access for'} ${emp.firstName} ${emp.lastName} (${emp.employeeCode}). Reason: ${reason || 'N/A'}`
    );

    addNotification(
      'usr-admin',
      isReactivate ? 'Employee Access Restored' : 'Employee Terminated / Login Revoked',
      `Login access for ${emp.firstName} ${emp.lastName} (${emp.employeeCode}) was ${isReactivate ? 'restored' : 'permanently blocked'}.`,
      'System',
      '/employees'
    );

    res.json({
      success: true,
      employee: emp,
      user,
      message: `Employee ${emp.firstName} ${emp.lastName} (${emp.employeeCode}) has been ${isReactivate ? 'reactivated with login access restored' : 'terminated and login access has been permanently revoked'}.`
    });
  });

  app.post('/api/employees/restore-defaults', (req: Request, res: Response) => {
    const initial = createInitialDatabase();
    let restoredCount = 0;

    initial.employees.forEach(initEmp => {
      const idx = db.employees.findIndex(e => e.id === initEmp.id || e.email.toLowerCase() === initEmp.email.toLowerCase());
      if (idx === -1) {
        db.employees.push({ ...initEmp });
        restoredCount++;
      } else {
        db.employees[idx].isDeleted = false;
        db.employees[idx].isLoginBlocked = false;
        db.employees[idx].employmentStatus = initEmp.employmentStatus;
      }
    });

    initial.users.forEach(initUser => {
      const uIdx = db.users.findIndex(u => u.id === initUser.id || u.email.toLowerCase() === initUser.email.toLowerCase());
      if (uIdx === -1) {
        db.users.push({ ...initUser });
      } else {
        db.users[uIdx].isBlocked = false;
        db.users[uIdx].isActive = true;
      }
    });

    logAudit('usr-admin', 'HR Admin', 'Employee', 'UPDATE', 'DatabaseSync', 'SYSTEM', 'Restored default master profiles including Priya Nair (EMP-1002)');

    res.json({
      success: true,
      message: 'Default employee profiles (including Priya Nair) restored successfully.',
      restoredCount,
      totalEmployees: db.employees.length
    });
  });

  // ---------------- EMPLOYEE DOCUMENTS & COMPANY RECORDS ----------------
  app.get('/api/employees/:id/documents', (req: Request, res: Response) => {
    const emp = db.employees.find(e => e.id === req.params.id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    const kycDocuments = db.kycDocuments.filter(d => d.employeeId === req.params.id);
    const companyDocuments = db.companyDocuments.filter(d => d.employeeId === req.params.id);
    res.json({
      success: true,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      kycDocuments,
      companyDocuments
    });
  });

  app.post('/api/employees/:id/documents/upload', (req: Request, res: Response) => {
    const emp = db.employees.find(e => e.id === req.params.id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    const { category, name, documentNumber, fileSize, remarks } = req.body;
    if (!category || !name) {
      return res.status(400).json({ success: false, message: 'Category and document name are required' });
    }

    const docId = `KYC-${emp.id}-${Date.now().toString().slice(-4)}`;
    const newDoc: EmployeeKycDocument = {
      id: docId,
      employeeId: emp.id,
      category,
      name,
      documentNumber: documentNumber || '',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Pending Verification',
      fileSize: fileSize || '1.2 MB',
      remarks: remarks || 'Uploaded by employee. Awaiting HR verification.'
    };

    db.kycDocuments.unshift(newDoc);
    emp.documents = db.kycDocuments.filter(d => d.employeeId === emp.id);

    logAudit('usr-admin', `${emp.firstName} ${emp.lastName}`, 'Documents', 'CREATE', 'EmployeeKYCDocument', docId, `Uploaded ${category} (${name})`);
    addNotification('usr-admin', 'KYC Document Uploaded', `${emp.firstName} ${emp.lastName} uploaded ${category} for verification.`, 'System', `/employees`);

    res.json({ success: true, document: newDoc });
  });

  app.put('/api/employees/:id/documents/:docId/verify', (req: Request, res: Response) => {
    const { id, docId } = req.params;
    const { status, remarks, reviewerName } = req.body;

    const doc = db.kycDocuments.find(d => d.id === docId && d.employeeId === id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const oldStatus = doc.status;
    doc.status = status || 'Verified';
    doc.remarks = remarks || (doc.status === 'Verified' ? 'Document verified and approved by HR.' : 'Rejected by HR. Please re-upload clear copy.');
    doc.verifiedDate = new Date().toISOString().split('T')[0];
    doc.verifiedBy = reviewerName || 'HR Administrator';

    const emp = db.employees.find(e => e.id === id);
    if (emp) {
      emp.documents = db.kycDocuments.filter(d => d.employeeId === emp.id);
      const empUser = db.users.find(u => u.employeeId === emp.id);
      if (empUser) {
        addNotification(
          empUser.id,
          doc.status === 'Verified' ? 'KYC Document Verified' : 'KYC Document Action Required',
          `Your ${doc.category} has been ${doc.status.toLowerCase()}${remarks ? `: ${remarks}` : '.'}`,
          'System',
          '/profile'
        );
      }
    }

    logAudit('usr-admin', reviewerName || 'HR Admin', 'Documents', 'APPROVE', 'EmployeeKYCDocument', docId, `${status} status for ${doc.category}. Remarks: ${doc.remarks}`, oldStatus);

    res.json({ success: true, document: doc });
  });

  app.delete('/api/employees/:id/documents/:docId', (req: Request, res: Response) => {
    const { id, docId } = req.params;
    const idx = db.kycDocuments.findIndex(d => d.id === docId && d.employeeId === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    const removed = db.kycDocuments.splice(idx, 1)[0];
    const emp = db.employees.find(e => e.id === id);
    if (emp) {
      emp.documents = db.kycDocuments.filter(d => d.employeeId === emp.id);
    }

    logAudit('usr-admin', 'HR Admin', 'Documents', 'DELETE', 'EmployeeKYCDocument', docId, `Deleted KYC document ${removed.name}`);
    res.json({ success: true, message: 'Document deleted successfully' });
  });

  app.post('/api/employees/:id/company-documents/issue', (req: Request, res: Response) => {
    const emp = db.employees.find(e => e.id === req.params.id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const { category, title, financialYear, validUntil, fileSize, issuedBy, description } = req.body;
    if (!category || !title) {
      return res.status(400).json({ success: false, message: 'Category and document title are required' });
    }

    const docId = `COM-${emp.id}-${Date.now().toString().slice(-4)}`;
    const newDoc: CompanyIssuedDocument = {
      id: docId,
      employeeId: emp.id,
      category,
      title,
      financialYear: financialYear || '2025-2026',
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: validUntil || 'Permanent',
      fileSize: fileSize || '1.1 MB',
      issuedBy: issuedBy || 'Corporate Human Resources',
      description: description || 'Official company document issued to employee.'
    };

    db.companyDocuments.unshift(newDoc);
    emp.companyDocuments = db.companyDocuments.filter(d => d.employeeId === emp.id);

    const empUser = db.users.find(u => u.employeeId === emp.id);
    if (empUser) {
      addNotification(empUser.id, 'New Company Document Available', `HR has issued "${title}". You can download it anytime from My Documents.`, 'System', '/profile');
    }

    logAudit('usr-admin', issuedBy || 'HR Admin', 'Documents', 'CREATE', 'CompanyIssuedDocument', docId, `Issued "${title}" (${category}) to ${emp.firstName} ${emp.lastName}`);

    res.json({ success: true, document: newDoc });
  });

  app.delete('/api/employees/:id/company-documents/:docId', (req: Request, res: Response) => {
    const { id, docId } = req.params;
    const idx = db.companyDocuments.findIndex(d => d.id === docId && d.employeeId === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    const removed = db.companyDocuments.splice(idx, 1)[0];
    const emp = db.employees.find(e => e.id === id);
    if (emp) {
      emp.companyDocuments = db.companyDocuments.filter(d => d.employeeId === emp.id);
    }

    logAudit('usr-admin', 'HR Admin', 'Documents', 'DELETE', 'CompanyIssuedDocument', docId, `Removed company issued document "${removed.title}"`);
    res.json({ success: true, message: 'Document removed successfully' });
  });

  app.get('/api/documents/download/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const kycDoc = db.kycDocuments.find(d => d.id === id);
    const comDoc = db.companyDocuments.find(d => d.id === id);

    const filename = kycDoc ? kycDoc.name : comDoc ? `${comDoc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf` : `document_${id}.pdf`;
    const docTitle = kycDoc ? `${kycDoc.category} - ${kycDoc.name}` : comDoc ? `${comDoc.title} (${comDoc.category})` : 'Enterprise Document';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(`%PDF-1.4\n%PeopleWorks Enterprise HRMS Authenticated Record\nDocument ID: ${id}\nTitle: ${docTitle}\nGenerated: ${new Date().toISOString()}\nStatus: Digitally Verified Record\n%%EOF`);
  });

  // ---------------- ATTENDANCE ----------------
  app.get('/api/attendance', (req: Request, res: Response) => {
    const { employeeId, date, month } = req.query;
    let list = [...db.attendance];

    if (employeeId) {
      list = list.filter(a => a.employeeId === employeeId);
    }
    if (date) {
      list = list.filter(a => a.date === date);
    }
    if (month) {
      list = list.filter(a => a.date.startsWith(month as string));
    }

    res.json({ success: true, attendance: list });
  });

  app.post('/api/attendance/check-in', (req: Request, res: Response) => {
    const { employeeId } = req.body;
    const emp = db.employees.find(e => e.id === employeeId);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];

    let record = db.attendance.find(a => a.employeeId === employeeId && a.date === today);
    if (!record) {
      record = {
        id: `ATT-${Date.now()}`,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        date: today,
        inTime: nowTime,
        status: nowTime > '09:30:00' ? 'Late' : 'Present',
        workHours: 0,
        breakHours: 0,
        overtimeHours: 0,
        isLate: nowTime > '09:30:00',
        isEarlyLeaving: false
      };
      db.attendance.unshift(record);
    } else {
      record.inTime = nowTime;
    }

    logAudit(emp.id, `${emp.firstName} ${emp.lastName}`, 'Attendance', 'CREATE', 'AttendanceRecord', record.id, `Checked in at ${nowTime}`);

    res.json({ success: true, record });
  });

  app.post('/api/attendance/check-out', (req: Request, res: Response) => {
    const { employeeId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];

    const record = db.attendance.find(a => a.employeeId === employeeId && a.date === today);
    if (!record) {
      return res.status(400).json({ success: false, message: 'Check-in record not found for today' });
    }

    record.outTime = nowTime;
    if (record.inTime) {
      const inParts = record.inTime.split(':').map(Number);
      const outParts = nowTime.split(':').map(Number);
      const diffHrs = (outParts[0] + outParts[1] / 60) - (inParts[0] + inParts[1] / 60);
      record.workHours = Math.max(0, Number(diffHrs.toFixed(1)));
    }

    logAudit(employeeId, record.employeeName, 'Attendance', 'UPDATE', 'AttendanceRecord', record.id, `Checked out at ${nowTime}, total hours: ${record.workHours}`);

    res.json({ success: true, record });
  });

  app.post('/api/attendance/regularize', (req: Request, res: Response) => {
    const { attendanceId, reason, requestedInTime, requestedOutTime } = req.body;
    const record = db.attendance.find(a => a.id === attendanceId);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    record.regularization = {
      id: `REG-${Date.now()}`,
      reason,
      requestedInTime,
      requestedOutTime,
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };

    logAudit(record.employeeId, record.employeeName, 'Attendance', 'CREATE', 'AttendanceRegularization', record.regularization.id, `Requested regularization: ${reason}`);

    addNotification('usr-manager', 'Attendance Regularization Request', `${record.employeeName} submitted a regularization request for ${record.date}`, 'Attendance', '/attendance');

    res.json({ success: true, record });
  });

  app.post('/api/attendance/regularize/:id/action', (req: Request, res: Response) => {
    const { action, comment } = req.body; // 'Approved' | 'Rejected'
    const record = db.attendance.find(a => a.regularization && a.regularization.id === req.params.id);
    if (!record || !record.regularization) {
      return res.status(404).json({ success: false, message: 'Regularization request not found' });
    }

    record.regularization.status = action;
    record.regularization.managerComment = comment;

    if (action === 'Approved') {
      record.inTime = record.regularization.requestedInTime || record.inTime;
      record.outTime = record.regularization.requestedOutTime || record.outTime;
      record.status = 'Present';
      record.isLate = false;
    }

    logAudit('usr-manager', 'Rajesh Sharma', 'Attendance', action === 'Approved' ? 'APPROVE' : 'REJECT', 'AttendanceRegularization', record.regularization.id, `${action} regularization with comment: ${comment || 'N/A'}`);

    addNotification(record.employeeId, `Attendance Regularization ${action}`, `Your regularization request for ${record.date} was ${action.toLowerCase()}.`, 'Attendance', '/attendance');

    res.json({ success: true, record });
  });

  // ---------------- LEAVES ----------------
  app.get('/api/leaves/balances/:employeeId', (req: Request, res: Response) => {
    if (!db.leaveBalances[req.params.employeeId]) {
      db.leaveBalances[req.params.employeeId] = [
        { leaveType: 'Casual Leave', totalQuota: 12, used: 2, pending: 0, available: 10 },
        { leaveType: 'Sick Leave', totalQuota: 10, used: 1, pending: 0, available: 9 },
        { leaveType: 'Earned Leave', totalQuota: 15, used: 3, pending: 0, available: 12 },
        { leaveType: 'Comp Off', totalQuota: 2, used: 0, pending: 0, available: 2 },
        { leaveType: 'Maternity Leave', totalQuota: 180, used: 0, pending: 0, available: 180 },
        { leaveType: 'Unpaid Leave', totalQuota: 30, used: 0, pending: 0, available: 30 }
      ];
    }
    const balances = db.leaveBalances[req.params.employeeId];
    res.json({ success: true, balances });
  });

  app.get('/api/leaves/requests', (req: Request, res: Response) => {
    const { employeeId, status } = req.query;
    let list = [...db.leaveRequests];
    if (employeeId) {
      list = list.filter(r => r.employeeId === employeeId);
    }
    if (status && status !== 'All') {
      list = list.filter(r => r.status === status);
    }
    res.json({ success: true, requests: list });
  });

  app.post('/api/leaves/apply', (req: Request, res: Response) => {
    const { employeeId, leaveType, startDate, endDate, numberOfDays, reason } = req.body;
    const emp = db.employees.find(e => e.id === employeeId);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

    if (!db.leaveBalances[emp.id]) {
      db.leaveBalances[emp.id] = [
        { leaveType: 'Casual Leave', totalQuota: 12, used: 2, pending: 0, available: 10 },
        { leaveType: 'Sick Leave', totalQuota: 10, used: 1, pending: 0, available: 9 },
        { leaveType: 'Earned Leave', totalQuota: 15, used: 3, pending: 0, available: 12 },
        { leaveType: 'Comp Off', totalQuota: 2, used: 0, pending: 0, available: 2 },
        { leaveType: 'Maternity Leave', totalQuota: 180, used: 0, pending: 0, available: 180 },
        { leaveType: 'Unpaid Leave', totalQuota: 30, used: 0, pending: 0, available: 30 }
      ];
    }

    const balances = db.leaveBalances[emp.id];
    const b = balances.find(x => x.leaveType === leaveType);
    const reqDays = Number(numberOfDays);

    if (b) {
      if (b.available <= 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot apply: 0 leave balance available for ${leaveType}. Available: 0 days.`
        });
      }
      if (reqDays > b.available) {
        return res.status(400).json({
          success: false,
          message: `Insufficient leave balance! Requested: ${reqDays} days, but only ${b.available} days are available for ${leaveType}.`
        });
      }
      // Deduct from available and add to pending
      b.pending += reqDays;
      b.available = Math.max(0, b.totalQuota - b.used - b.pending);
    }

    const newRequest: LeaveRequest = {
      id: `LR-2026-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeCode,
      department: emp.department,
      reportingManagerId: emp.reportingManagerId,
      reportingManagerName: emp.reportingManagerName,
      leaveType,
      startDate,
      endDate,
      numberOfDays: Number(numberOfDays),
      reason,
      status: 'Pending',
      appliedDate: new Date().toISOString(),
      workflowId: 'WF-LEAVE-STD',
      currentStepIndex: 1,
      approverRoles: ['Reporting Manager'],
      history: [
        {
          stepName: 'Leave Submission',
          actorName: `${emp.firstName} ${emp.lastName}`,
          action: 'Submitted',
          timestamp: new Date().toISOString(),
          comment: reason
        }
      ]
    };

    db.leaveRequests.unshift(newRequest);

    logAudit(emp.id, `${emp.firstName} ${emp.lastName}`, 'Leave', 'CREATE', 'LeaveRequest', newRequest.id, `Applied ${leaveType} from ${startDate} to ${endDate} (${numberOfDays} days) - routed to Manager ${emp.reportingManagerName}`);

    // Notify the assigned reporting manager
    const managerUser = db.users.find(u => u.employeeId === emp.reportingManagerId) || db.users.find(u => u.role === 'Manager');
    if (managerUser) {
      addNotification(managerUser.id, 'New Team Leave Request', `${emp.firstName} ${emp.lastName} submitted a request for ${leaveType} (${numberOfDays} days) awaiting your approval`, 'Leave', '/approvals');
    }

    res.status(201).json({ success: true, request: newRequest });
  });

  app.post('/api/leaves/requests/:id/action', (req: Request, res: Response) => {
    const { action, comment, actorName = 'Approver' } = req.body; // 'Approved' | 'Rejected' | 'Sent Back'
    const request = db.leaveRequests.find(r => r.id === req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Leave request not found' });

    request.history.push({
      stepName: request.currentStepIndex === 1 ? 'Manager Review' : 'HR Review',
      actorName,
      action,
      timestamp: new Date().toISOString(),
      comment
    });

    if (action === 'Approved') {
      if (request.currentStepIndex === 1) {
        // Move to step 2 (HR)
        request.currentStepIndex = 2;
        request.approverRoles = ['HR Admin'];
        addNotification('usr-hradmin', 'Leave Escalated to HR', `${request.employeeName}'s leave approved by manager, pending HR authorization`, 'Leave', '/leave');
      } else {
        // Fully approved
        request.status = 'Approved';
        const balances = db.leaveBalances[request.employeeId];
        if (balances) {
          const b = balances.find(x => x.leaveType === request.leaveType);
          if (b) {
            b.pending = Math.max(0, b.pending - request.numberOfDays);
            b.used += request.numberOfDays;
            b.available = Math.max(0, b.totalQuota - b.used - b.pending);
          }
        }
        addNotification(request.employeeId, 'Leave Approved!', `Your leave from ${request.startDate} to ${request.endDate} has been approved.`, 'Leave', '/leave');
      }
    } else if (action === 'Rejected') {
      request.status = 'Rejected';
      const balances = db.leaveBalances[request.employeeId];
      if (balances) {
        const b = balances.find(x => x.leaveType === request.leaveType);
        if (b) {
          b.pending = Math.max(0, b.pending - request.numberOfDays);
          b.available = Math.max(0, b.totalQuota - b.used - b.pending);
        }
      }
      addNotification(request.employeeId, 'Leave Request Rejected', `Your leave from ${request.startDate} was rejected: ${comment || 'No reason provided'}`, 'Leave', '/leave');
    } else if (action === 'Sent Back') {
      request.status = 'Sent Back';
      request.revertComment = comment || 'Clarification / modification required by manager';
      request.revertedBy = actorName;
      request.revertedAt = new Date().toISOString();
      const balances = db.leaveBalances[request.employeeId];
      if (balances) {
        const b = balances.find(x => x.leaveType === request.leaveType);
        if (b) {
          b.pending = Math.max(0, b.pending - request.numberOfDays);
          b.available = Math.max(0, b.totalQuota - b.used - b.pending);
        }
      }
      addNotification(request.employeeId, 'Leave Request Reverted (Sent Back)', `Your leave from ${request.startDate} was sent back for correction: ${comment || 'Please update and resubmit'}`, 'Leave', '/leave');
    }

    logAudit('usr-manager', actorName, 'Leave', action === 'Approved' ? 'APPROVE' : (action === 'Sent Back' ? 'REVERT' : 'REJECT'), 'LeaveRequest', request.id, `${action} leave request for ${request.employeeName} with remarks: ${comment || 'N/A'}`);

    res.json({ success: true, request });
  });

  app.put('/api/leaves/requests/:id/resubmit', (req: Request, res: Response) => {
    const { startDate, endDate, leaveType, numberOfDays, reason, actorName } = req.body;
    const request = db.leaveRequests.find(r => r.id === req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Leave request not found' });
    if (request.status !== 'Sent Back') {
      return res.status(400).json({ success: false, message: 'Only reverted (Sent Back) leave requests can be edited and resubmitted' });
    }

    const effectiveDays = Number(numberOfDays) || request.numberOfDays;
    const effectiveType = (leaveType as LeaveType) || request.leaveType;

    const balances = db.leaveBalances[request.employeeId];
    if (balances) {
      const b = balances.find(x => x.leaveType === effectiveType);
      if (b && effectiveDays > b.available) {
        return res.status(400).json({ success: false, message: `Insufficient leave balance for ${effectiveType}. Available: ${b.available} days` });
      }
    }

    if (startDate) request.startDate = startDate;
    if (endDate) request.endDate = endDate;
    if (leaveType) request.leaveType = effectiveType;
    if (numberOfDays) request.numberOfDays = effectiveDays;
    if (reason) request.reason = reason;

    // Reset status to Pending and return to Manager Review step
    request.status = 'Pending';
    request.currentStepIndex = 1;
    request.approverRoles = ['Reporting Manager', 'Team Lead'];
    delete request.revertComment;
    delete request.revertedBy;
    delete request.revertedAt;

    // Put quota back into pending
    if (balances) {
      const b = balances.find(x => x.leaveType === request.leaveType);
      if (b) {
        b.pending += request.numberOfDays;
        b.available = Math.max(0, b.totalQuota - b.used - b.pending);
      }
    }

    request.history.push({
      stepName: 'Resubmitted after Revert',
      actorName: actorName || request.employeeName,
      action: 'Submitted',
      timestamp: new Date().toISOString(),
      comment: `Corrected and resubmitted. Dates: ${request.startDate} to ${request.endDate} (${request.numberOfDays} days). Reason: ${request.reason}`
    });

    const managerId = request.reportingManagerId || 'usr-manager';
    addNotification(managerId, 'Leave Request Resubmitted', `${request.employeeName} corrected and resubmitted leave application (${request.numberOfDays} days)`, 'Leave', '/approvals');

    logAudit(request.employeeId, actorName || request.employeeName, 'Leave', 'UPDATE', 'LeaveRequest', request.id, `Corrected and resubmitted leave request (${request.startDate} to ${request.endDate})`);

    res.json({ success: true, request });
  });

  // Approvals Hub (Pending items for manager / HR / Finance)
  app.get('/api/workflows/pending/:role', (req: Request, res: Response) => {
    const { role } = req.params;
    const { managerId } = req.query;

    let pendingLeaves = db.leaveRequests.filter(r => r.status === 'Pending' && r.approverRoles.includes(role));
    let pendingRegs = db.attendance.filter(a => a.regularization && a.regularization.status === 'Pending');
    let pendingExpenses = db.travelExpenses.filter(e => e.status === 'Pending' || (role === 'Finance Admin' && e.status === 'Manager Approved'));
    let pendingSeparations = db.separations.filter(s => s.status === 'Submitted' || s.status === 'Manager Approved');

    // Filter by assigned manager if role is Reporting Manager and managerId is provided
    if (role === 'Reporting Manager' && managerId) {
      pendingLeaves = pendingLeaves.filter(r => {
        if (r.reportingManagerId) return r.reportingManagerId === managerId;
        const emp = db.employees.find(e => e.id === r.employeeId);
        return emp?.reportingManagerId === managerId;
      });
      pendingRegs = pendingRegs.filter(a => {
        const emp = db.employees.find(e => e.id === a.employeeId);
        return emp?.reportingManagerId === managerId;
      });
      pendingExpenses = pendingExpenses.filter(e => {
        const emp = db.employees.find(x => x.id === e.employeeId);
        return emp?.reportingManagerId === managerId;
      });
      pendingSeparations = pendingSeparations.filter(s => {
        const emp = db.employees.find(x => x.id === s.employeeId);
        return emp?.reportingManagerId === managerId;
      });
    }

    res.json({
      success: true,
      pending: {
        leaves: pendingLeaves,
        regularizations: pendingRegs,
        expenses: pendingExpenses,
        separations: pendingSeparations,
        total: pendingLeaves.length + pendingRegs.length + pendingExpenses.length + pendingSeparations.length
      }
    });
  });

  // ---------------- PAYROLL ----------------
  app.get('/api/payroll/runs', (req: Request, res: Response) => {
    res.json({ success: true, runs: db.payrollRuns });
  });

  app.post('/api/payroll/process', (req: Request, res: Response) => {
    const { periodMonth, periodYear } = req.body;
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const label = `${months[periodMonth - 1]} ${periodYear}`;

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    // Generate payslips for all active employees
    const generatedPayslips: Payslip[] = db.employees.map(emp => {
      const basic = emp.salary?.basicMonthly || 60000;
      const hra = emp.salary?.hraMonthly || 30000;
      const special = emp.salary?.specialAllowance || 25000;
      const conveyance = 1600;
      const gross = basic + hra + special + conveyance;

      const pf = emp.salary?.pfMonthly || 6000;
      const pt = emp.salary?.professionalTax || 200;
      const tds = Math.round(gross * 0.08); // simple statutory estimate
      const insurance = 1500;
      const ded = pf + pt + tds + insurance;
      const net = gross - ded;

      totalGross += gross;
      totalDeductions += ded;
      totalNet += net;

      return {
        id: `PS-${periodYear}${String(periodMonth).padStart(2, '0')}-${emp.id.replace('EMP-', '')}`,
        payrollRunId: `PAY-${periodYear}-${String(periodMonth).padStart(2, '0')}`,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeCode: emp.employeeCode,
        designation: emp.designation,
        department: emp.department,
        bankAccount: 'HDFC-XXXX-7721',
        pan: 'ABCDE5678G',
        uan: '100889922110',
        period: label,
        workingDays: 22,
        presentDays: 22,
        paidLeaveDays: 0,
        lopDays: 0,
        earnings: {
          basic,
          hra,
          specialAllowance: special,
          performanceBonus: 0,
          conveyance,
          totalGross: gross
        },
        deductions: {
          providentFund: pf,
          professionalTax: pt,
          incomeTaxTDS: tds,
          healthInsurance: insurance,
          totalDeductions: ded
        },
        netSalary: net,
        status: 'Generated'
      };
    });

    const runId = `PAY-${periodYear}-${String(periodMonth).padStart(2, '0')}`;
    const existingIdx = db.payrollRuns.findIndex(r => r.id === runId);

    const newRun: PayrollRun = {
      id: runId,
      periodMonth,
      periodYear,
      periodLabel: label,
      totalEmployees: db.employees.length,
      processedCount: db.employees.length,
      totalGrossPay: totalGross,
      totalDeductions: totalDeductions,
      totalNetPay: totalNet,
      status: 'Validated',
      processedAt: new Date().toISOString(),
      payoutDate: `${periodYear}-${String(periodMonth).padStart(2, '0')}-30`
    };

    if (existingIdx !== -1) {
      db.payrollRuns[existingIdx] = newRun;
    } else {
      db.payrollRuns.unshift(newRun);
    }

    // Replace payslips for this run
    db.payslips = db.payslips.filter(p => p.payrollRunId !== runId).concat(generatedPayslips);

    logAudit('usr-payroll', 'Deepak Verma', 'Payroll', 'PROCESS', 'PayrollRun', runId, `Processed batch payroll for ${label}: ₹${totalGross.toLocaleString('en-IN')} Gross`);

    addNotification('usr-admin', 'Payroll Batch Ready for Finalization', `Payroll run for ${label} is validated and ready for disbursement authorization`, 'Payroll', '/payroll');

    res.json({ success: true, run: newRun, payslipsCount: generatedPayslips.length });
  });

  app.post('/api/payroll/runs/:id/action', (req: Request, res: Response) => {
    const { action } = req.body; // 'Finalize'
    const run = db.payrollRuns.find(r => r.id === req.params.id);
    if (!run) return res.status(404).json({ success: false, message: 'Payroll run not found' });

    run.status = 'Finalized';
    run.approvedBy = 'Ananya Roy';

    db.payslips.filter(p => p.payrollRunId === run.id).forEach(p => {
      p.status = 'Paid';
    });

    logAudit('usr-admin', 'Ananya Roy', 'Payroll', 'APPROVE', 'PayrollRun', run.id, `Finalized and authorized disbursement for ${run.periodLabel}`);

    res.json({ success: true, run });
  });

  app.get('/api/payroll/runs/:id/payslips', (req: Request, res: Response) => {
    const run = db.payrollRuns.find(r => r.id === req.params.id);
    if (!run) return res.status(404).json({ success: false, message: 'Payroll run not found' });

    let slips = db.payslips.filter(p => p.payrollRunId === run.id);

    // If payslips for some employees are missing, generate them dynamically from active employees
    if (slips.length < db.employees.length) {
      const existingEmpIds = new Set(slips.map(s => s.employeeId));
      const missingEmps = db.employees.filter(e => !existingEmpIds.has(e.id));

      const newSlips: Payslip[] = missingEmps.map(emp => {
        const basic = emp.salary?.basicMonthly || 60000;
        const hra = emp.salary?.hraMonthly || 30000;
        const special = emp.salary?.specialAllowance || 25000;
        const conveyance = 1600;
        const gross = basic + hra + special + conveyance;

        const pf = emp.salary?.pfMonthly || 6000;
        const pt = emp.salary?.professionalTax || 200;
        const tds = Math.round(gross * 0.08);
        const insurance = 1500;
        const ded = pf + pt + tds + insurance;
        const net = gross - ded;

        return {
          id: `PS-${run.periodYear}${String(run.periodMonth).padStart(2, '0')}-${emp.id.replace('EMP-', '')}`,
          payrollRunId: run.id,
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          employeeCode: emp.employeeCode,
          designation: emp.designation,
          department: emp.department,
          bankAccount: 'HDFC-XXXX-7721',
          pan: 'ABCDE5678G',
          uan: '100889922110',
          period: run.periodLabel,
          workingDays: 22,
          presentDays: 22,
          paidLeaveDays: 0,
          lopDays: 0,
          earnings: {
            basic,
            hra,
            specialAllowance: special,
            performanceBonus: 0,
            conveyance,
            totalGross: gross
          },
          deductions: {
            providentFund: pf,
            professionalTax: pt,
            incomeTaxTDS: tds,
            healthInsurance: insurance,
            totalDeductions: ded
          },
          netSalary: net,
          status: run.status === 'Finalized' ? 'Paid' : 'Generated'
        };
      });

      db.payslips = db.payslips.concat(newSlips);
      slips = db.payslips.filter(p => p.payrollRunId === run.id);
    }

    res.json({ success: true, run, payslips: slips });
  });


  app.get('/api/payroll/payslips/:employeeId', (req: Request, res: Response) => {
    const slips = db.payslips.filter(p => p.employeeId === req.params.employeeId);
    res.json({ success: true, payslips: slips });
  });

  app.get('/api/payroll/payslip/:id', (req: Request, res: Response) => {
    const slip = db.payslips.find(p => p.id === req.params.id);
    if (!slip) return res.status(404).json({ success: false, message: 'Payslip not found' });
    res.json({ success: true, payslip: slip });
  });

  // ---------------- TRAVEL & EXPENSES ----------------
  app.get('/api/travel-expenses', (req: Request, res: Response) => {
    const employeeId = req.query.employeeId as string;
    if (employeeId) {
      const items = db.travelExpenses.filter(t => t.employeeId === employeeId);
      return res.json({ success: true, items });
    }
    res.json({ success: true, items: db.travelExpenses });
  });

  app.post('/api/travel-expenses', (req: Request, res: Response) => {
    const attachments = req.body.attachments || [];
    const item: TravelExpenseRequest = {
      ...req.body,
      id: `${req.body.type === 'Travel' ? 'TRV' : 'EXP'}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Pending',
      attachments,
      receiptAttachment: attachments.length > 0 ? attachments[0].name : (req.body.receiptAttachment || 'Invoice_Receipt.pdf'),
      currentApproverRole: 'Reporting Manager'
    };
    db.travelExpenses.unshift(item);
    logAudit(item.employeeId, item.employeeName, 'Employee', 'CREATE', 'TravelExpense', item.id, `Submitted ${item.type} request for ₹${item.amount.toLocaleString('en-IN')} with ${attachments.length} attached bills`);
    res.status(201).json({ success: true, item });
  });

  app.post('/api/travel-expenses/:id/action', (req: Request, res: Response) => {
    const { action } = req.body; // 'Approve' | 'Reject'
    const item = db.travelExpenses.find(t => t.id === req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (action === 'Approve') {
      if (item.status === 'Pending') {
        item.status = 'Manager Approved';
        item.currentApproverRole = 'Finance Admin';
      } else if (item.status === 'Manager Approved') {
        item.status = 'Paid';
      }
    } else {
      item.status = 'Rejected';
    }

    logAudit('usr-manager', 'Approver', 'Employee', 'APPROVE', 'TravelExpense', item.id, `${action}d ${item.type} request ${item.id}`);
    res.json({ success: true, item });
  });

  // ---------------- SEPARATION ----------------
  app.get('/api/separation', (req: Request, res: Response) => {
    res.json({ success: true, separations: db.separations });
  });

  app.post('/api/separation/apply', (req: Request, res: Response) => {
    const { employeeId, reason, proposedLwd, comments } = req.body;
    const emp = db.employees.find(e => e.id === employeeId);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

    const sep: SeparationRequest = {
      id: `SEP-${Date.now()}`,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      designation: emp.designation,
      resignationDate: new Date().toISOString().split('T')[0],
      proposedLwd,
      officialLwd: proposedLwd,
      noticePeriodDays: 60,
      reason,
      comments,
      status: 'Submitted',
      clearances: [
        { department: 'IT Hardware', status: 'Pending' },
        { department: 'HR Formalities', status: 'Pending' },
        { department: 'Finance Accounts', status: 'Pending' },
        { department: 'Admin & Access', status: 'Pending' }
      ],
      finalSettlement: {
        salaryDue: Math.round(emp.salary.basicMonthly * 1.5),
        leaveEncashment: 24000,
        noticeRecovery: 0,
        gratuity: 0,
        totalPayable: Math.round(emp.salary.basicMonthly * 1.5) + 24000,
        isSettled: false
      }
    };

    emp.employmentStatus = 'Notice Period';
    db.separations.unshift(sep);

    logAudit(emp.id, `${emp.firstName} ${emp.lastName}`, 'Separation', 'CREATE', 'SeparationRequest', sep.id, `Submitted resignation. LWD: ${proposedLwd}`);
    addNotification('usr-manager', 'Resignation Submitted', `${emp.firstName} ${emp.lastName} has submitted a resignation request.`, 'System', '/separation');

    res.status(201).json({ success: true, separation: sep });
  });

  app.put('/api/separation/:id/clearance', (req: Request, res: Response) => {
    const sep = db.separations.find(s => s.id === req.params.id);
    if (!sep) return res.status(404).json({ success: false, message: 'Separation request not found' });

    const { department, status, remarks, actorName = 'Approver' } = req.body;
    const clearance = sep.clearances.find(c => c.department === department);
    if (clearance) {
      clearance.status = status;
      clearance.remarks = remarks;
      clearance.clearedBy = actorName;
      clearance.clearedAt = new Date().toISOString();
    }

    const allCleared = sep.clearances.every(c => c.status === 'Cleared');
    if (allCleared) {
      sep.status = 'Clearance In Progress';
    }

    logAudit('usr-admin', actorName, 'Separation', 'APPROVE', 'SeparationClearance', sep.id, `Cleared ${department} for ${sep.employeeName}`);
    res.json({ success: true, separation: sep });
  });

  app.post('/api/separation/:id/finalize', (req: Request, res: Response) => {
    const sep = db.separations.find(s => s.id === req.params.id);
    if (!sep) return res.status(404).json({ success: false, message: 'Separation request not found' });

    const { actorName = 'HR Administrator', remarks } = req.body;
    sep.status = 'Settled';
    if (sep.finalSettlement) {
      sep.finalSettlement.isSettled = true;
    }

    const emp = db.employees.find(e => e.id === sep.employeeId);
    if (emp) {
      emp.employmentStatus = 'Terminated';
      emp.isLoginBlocked = true;
      emp.terminationDate = sep.officialLwd || new Date().toISOString().split('T')[0];
      emp.terminationReason = `Resignation / Separation: ${sep.reason}`;
      emp.terminationRemarks = remarks || 'Exit formalities completed and login access permanently revoked.';
      emp.updatedAt = new Date().toISOString();
    }

    const user = db.users.find(u => u.employeeId === sep.employeeId);
    if (user) {
      user.isBlocked = true;
      user.isActive = false;
      user.statusComment = `Separated & Relieved: ${sep.reason}`;
    }

    logAudit('usr-admin', actorName, 'Separation', 'UPDATE', 'SeparationRequest', sep.id, `Completed exit formalities and revoked login access for ${sep.employeeName}`);
    addNotification('usr-admin', 'Exit Completed & Access Revoked', `Full and final settlement signed off for ${sep.employeeName}. Login access has been revoked.`, 'System', '/separation');

    res.json({ success: true, separation: sep, message: `Exit finalized and login access permanently revoked for ${sep.employeeName}.` });
  });

  // ---------------- NOTIFICATIONS ----------------
  app.get('/api/notifications', (req: Request, res: Response) => {
    res.json({ success: true, notifications: db.notifications });
  });

  app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
    const n = db.notifications.find(x => x.id === req.params.id);
    if (n) n.read = true;
    res.json({ success: true, notification: n });
  });

  app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
    db.notifications.forEach(n => { n.read = true; });
    res.json({ success: true });
  });

  // ---------------- REPORTS & EXPORT ----------------
  app.get('/api/reports/summary', (req: Request, res: Response) => {
    const totalEmployees = db.employees.length;
    const activeEmployees = db.employees.filter(e => e.employmentStatus === 'Active').length;
    const noticePeriod = db.employees.filter(e => e.employmentStatus === 'Notice Period').length;
    const onLeaveToday = db.leaveRequests.filter(l => l.status === 'Approved').length;
    const pendingApprovalsCount = db.leaveRequests.filter(r => r.status === 'Pending').length +
      db.attendance.filter(a => a.regularization?.status === 'Pending').length;

    res.json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        noticePeriod,
        onLeaveToday,
        pendingApprovalsCount,
        headcountByDept: {
          'Information Technology': 3,
          'Human Resources': 2,
          'Finance & Accounts': 2,
          'Talent Acquisition': 1
        },
        attritionRate: '4.2%'
      }
    });
  });

  app.get('/api/reports/export/:type', (req: Request, res: Response) => {
    const { type } = req.params;
    let csv = '';
    let filename = `${type}_report_${Date.now()}.csv`;

    if (type === 'employees') {
      csv = 'Employee Code,First Name,Last Name,Email,Department,Designation,Status,Location,CTC Annual\n';
      db.employees.forEach(e => {
        csv += `"${e.employeeCode}","${e.firstName}","${e.lastName}","${e.email}","${e.department}","${e.designation}","${e.employmentStatus}","${e.location}",${e.salary.ctcAnnual}\n`;
      });
    } else if (type === 'payroll') {
      csv = 'Slip ID,Employee Code,Employee Name,Department,Gross Salary,Total Deductions,Net Salary,Status\n';
      db.payslips.forEach(p => {
        csv += `"${p.id}","${p.employeeCode}","${p.employeeName}","${p.department}",${p.earnings.totalGross},${p.deductions.totalDeductions},${p.netSalary},"${p.status}"\n`;
      });
    } else if (type === 'attendance') {
      csv = 'Date,Employee ID,Employee Name,In Time,Out Time,Work Hours,Status,Is Late\n';
      db.attendance.forEach(a => {
        csv += `"${a.date}","${a.employeeId}","${a.employeeName}","${a.inTime || ''}","${a.outTime || ''}",${a.workHours},"${a.status}",${a.isLate}\n`;
      });
    } else {
      csv = 'No data available\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  });

  // ---------------- ANGULAR SPA SERVING ----------------
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const distBrowser = path.resolve(__dirname, 'dist', 'browser');
  const distPath = fs.existsSync(distBrowser) ? distBrowser : path.resolve(__dirname, 'dist');

  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.resolve(distPath, 'index.html'));
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`Enterprise HRMS server active at http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start HRMS server:', err);
  process.exit(1);
});
