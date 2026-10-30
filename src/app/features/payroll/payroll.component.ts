import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PayrollRun, Payslip } from '../../core/models';
import {
  LucideDownload, LucidePlay, LucideFileSpreadsheet,
  LucideDollarSign, LucideEye, LucidePrinter, LucideX,
  LucideCheckCircle2, LucideAlertTriangle, LucideSearch,
  LucideShieldCheck
} from '@lucide/angular';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideDownload,
    LucidePlay,
    LucideFileSpreadsheet,
    LucideDollarSign,
    LucideEye,
    LucidePrinter,
    LucideX,
    LucideCheckCircle2,
    LucideAlertTriangle,
    LucideSearch,
    LucideShieldCheck
  ],
  templateUrl: './payroll.component.html'
})
export class PayrollComponent implements OnInit {
  private api = inject(ApiService);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  runs = signal<PayrollRun[]>([]);
  payslips = signal<Payslip[]>([]);
  selectedPayslip = signal<Payslip | null>(null);
  showProcessModal = signal<boolean>(false);
  procMonth = 9;
  procYear = 2026;
  processing = signal<boolean>(false);
  loading = signal<boolean>(true);

  // Batch Verification & Breakdown Modal
  selectedBatch = signal<PayrollRun | null>(null);
  batchPayslips = signal<Payslip[]>([]);
  loadingBatch = signal<boolean>(false);
  batchSearch = signal<string>('');
  batchDeptFilter = signal<string>('All');

  // Finalize Confirmation Modal
  confirmingRun = signal<PayrollRun | null>(null);
  finalizing = signal<boolean>(false);
  finalizeSuccessMsg = signal<string | null>(null);

  // Generated Payslips Table, Year Filter & Bulk Download State
  selectedYear = signal<string>('2026');
  selectedSlipIds = signal<Set<string>>(new Set<string>());
  showBulkDownloadModal = signal<boolean>(false);
  bulkDownloadYear = signal<string>('2026');
  modalSelectedSlipIds = signal<Set<string>>(new Set<string>());
  bulkSuccessMsg = signal<string | null>(null);

  availableYears = computed(() => {
    const years = new Set<string>();
    this.payslips().forEach(ps => {
      const match = ps.period.match(/\d{4}/);
      if (match) years.add(match[0]);
    });
    years.add('2026');
    years.add('2025');
    const sorted = Array.from(years).sort((a, b) => Number(b) - Number(a));
    return sorted;
  });

  filteredPayslipsByYear = computed(() => {
    const year = this.selectedYear();
    if (year === 'All') return this.payslips();
    return this.payslips().filter(ps => ps.period.includes(year));
  });

  isAllSelected = computed(() => {
    const list = this.filteredPayslipsByYear();
    if (list.length === 0) return false;
    const selected = this.selectedSlipIds();
    return list.every(ps => selected.has(ps.id));
  });

  selectedCount = computed(() => {
    return this.selectedSlipIds().size;
  });

  // Modal Computed List
  modalAvailablePayslips = computed(() => {
    const year = this.bulkDownloadYear();
    if (year === 'All') return this.payslips();
    return this.payslips().filter(ps => ps.period.includes(year));
  });

  isModalAllSelected = computed(() => {
    const list = this.modalAvailablePayslips();
    if (list.length === 0) return false;
    const selected = this.modalSelectedSlipIds();
    return list.every(ps => selected.has(ps.id));
  });

  modalSelectedCount = computed(() => {
    return this.modalSelectedSlipIds().size;
  });

  filteredBatchPayslips = computed(() => {
    let list = this.batchPayslips();
    const query = this.batchSearch().trim().toLowerCase();
    const dept = this.batchDeptFilter();

    if (query) {
      list = list.filter(p =>
        p.employeeName.toLowerCase().includes(query) ||
        p.employeeCode.toLowerCase().includes(query) ||
        p.designation.toLowerCase().includes(query) ||
        p.department.toLowerCase().includes(query)
      );
    }

    if (dept !== 'All') {
      list = list.filter(p => p.department === dept);
    }

    return list;
  });

  filteredBatchTotalNet = computed(() => {
    return this.filteredBatchPayslips().reduce((sum, p) => sum + p.netSalary, 0);
  });

  canProcess() {
    const role = this.currentUser()?.role;
    return role === 'Super Admin' || role === 'Payroll Admin' || role === 'Finance';
  }

  getExportUrl() {
    return this.api.getExportUrl('payroll');
  }

  printPayslip() {
    window.print();
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.api.getPayrollRuns().subscribe({
      next: (runsRes) => {
        if (runsRes.success) {
          this.runs.set(runsRes.runs);
        }
      }
    });

    const targetEmpId = this.canProcess() ? 'EMP-1002' : (this.currentUser()?.employeeId || 'EMP-1002');
    this.api.getPayslipsForEmployee(targetEmpId).subscribe({
      next: (slipsRes) => {
        if (slipsRes.success) {
          this.payslips.set(slipsRes.payslips);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  handleProcessPayroll() {
    this.processing.set(true);
    this.api.processPayroll(this.procMonth, this.procYear).subscribe({
      next: (res) => {
        if (res.success && res.run) {
          this.runs.update(prev => [res.run, ...prev]);
          this.showProcessModal.set(false);
          this.loadData();
        }
        this.processing.set(false);
      },
      error: (err) => {
        console.error('Failed to process payroll:', err);
        this.processing.set(false);
      }
    });
  }

  openBatchVerification(run: PayrollRun) {
    this.selectedBatch.set(run);
    this.loadingBatch.set(true);
    this.batchSearch.set('');
    this.batchDeptFilter.set('All');
    this.api.getPayslipsForRun(run.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.batchPayslips.set(res.payslips);
        }
        this.loadingBatch.set(false);
      },
      error: (err) => {
        console.error('Failed to load batch payslips:', err);
        this.loadingBatch.set(false);
      }
    });
  }

  promptFinalize(run: PayrollRun) {
    this.confirmingRun.set(run);
  }

  confirmFinalize() {
    const run = this.confirmingRun();
    if (!run) return;

    this.finalizing.set(true);
    this.api.finalizePayroll(run.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.runs.update(prev => prev.map(r => r.id === run.id ? res.run : r));
          if (this.selectedBatch()?.id === run.id) {
            this.selectedBatch.set(res.run);
            this.batchPayslips.update(slips => slips.map(s => ({ ...s, status: 'Paid' })));
          }
          this.finalizeSuccessMsg.set(`Payroll batch for ${res.run.periodLabel} finalized and disbursed successfully!`);
          setTimeout(() => this.finalizeSuccessMsg.set(null), 4000);
        }
        this.finalizing.set(false);
        this.confirmingRun.set(null);
      },
      error: (err) => {
        console.error('Failed to finalize payroll:', err);
        this.finalizing.set(false);
      }
    });
  }

  previewPayslipFromBatch(ps: Payslip) {
    this.selectedPayslip.set(ps);
  }

  // Payslip Table Selection & Bulk Actions
  toggleSelectAll(): void {
    const list = this.filteredPayslipsByYear();
    this.selectedSlipIds.update(prev => {
      const next = new Set(prev);
      const allSelected = list.every(ps => next.has(ps.id));
      if (allSelected) {
        list.forEach(ps => next.delete(ps.id));
      } else {
        list.forEach(ps => next.add(ps.id));
      }
      return next;
    });
  }

  toggleSelect(id: string): void {
    this.selectedSlipIds.update(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  isSelected(id: string): boolean {
    return this.selectedSlipIds().has(id);
  }

  clearSelection(): void {
    this.selectedSlipIds.set(new Set());
  }

  // Bulk Download Modal Management
  openBulkDownloadModal(year?: string): void {
    const yr = year || this.selectedYear();
    this.bulkDownloadYear.set(yr === 'All' ? '2026' : yr);
    const slipsForYear = this.payslips().filter(ps => ps.period.includes(this.bulkDownloadYear()));
    const initialSet = new Set(slipsForYear.map(ps => ps.id));
    this.modalSelectedSlipIds.set(initialSet);
    this.showBulkDownloadModal.set(true);
  }

  closeBulkDownloadModal(): void {
    this.showBulkDownloadModal.set(false);
  }

  onModalYearChange(newYear: string): void {
    this.bulkDownloadYear.set(newYear);
    const slipsForYear = this.payslips().filter(ps => ps.period.includes(newYear));
    this.modalSelectedSlipIds.set(new Set(slipsForYear.map(ps => ps.id)));
  }

  toggleModalSelectAll(): void {
    const list = this.modalAvailablePayslips();
    this.modalSelectedSlipIds.update(prev => {
      const next = new Set(prev);
      const allSelected = list.every(ps => next.has(ps.id));
      if (allSelected) {
        list.forEach(ps => next.delete(ps.id));
      } else {
        list.forEach(ps => next.add(ps.id));
      }
      return next;
    });
  }

  toggleModalMonth(id: string): void {
    this.modalSelectedSlipIds.update(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  isModalSelected(id: string): boolean {
    return this.modalSelectedSlipIds().has(id);
  }

  // Single Payslip Download
  downloadSinglePayslip(ps: Payslip): void {
    const content = `
================================================================================
                         PEOPLEWORKS HRMS - OFFICIAL PAYSLIP
================================================================================
Reference ID  : ${ps.id}
Period        : ${ps.period}
Employee Name : ${ps.employeeName} (${ps.employeeCode})
Designation   : ${ps.designation}
Department    : ${ps.department}
PAN           : ${ps.pan}
Bank Account  : ${ps.bankAccount}
UAN           : ${ps.uan}
--------------------------------------------------------------------------------
ATTENDANCE SUMMARY:
Working Days  : ${ps.workingDays}
Days Present  : ${ps.presentDays}
Paid Leaves   : ${ps.paidLeaveDays}
LOP Days      : ${ps.lopDays}
--------------------------------------------------------------------------------
EARNINGS (INR):
Basic Salary         : ₹${ps.earnings.basic.toLocaleString('en-IN')}
HRA                  : ₹${ps.earnings.hra.toLocaleString('en-IN')}
Special Allowance    : ₹${ps.earnings.specialAllowance.toLocaleString('en-IN')}
Bonus / Incentives   : ₹${(ps.earnings.performanceBonus || 0).toLocaleString('en-IN')}
Conveyance           : ₹${(ps.earnings.conveyance || 0).toLocaleString('en-IN')}
TOTAL GROSS SALARY   : ₹${ps.earnings.totalGross.toLocaleString('en-IN')}
--------------------------------------------------------------------------------
DEDUCTIONS (INR):
Provident Fund (PF)  : ₹${ps.deductions.providentFund.toLocaleString('en-IN')}
Professional Tax (PT): ₹${ps.deductions.professionalTax.toLocaleString('en-IN')}
Income Tax (TDS)     : ₹${ps.deductions.incomeTaxTDS.toLocaleString('en-IN')}
Health Insurance     : ₹${ps.deductions.healthInsurance.toLocaleString('en-IN')}
TOTAL DEDUCTIONS     : ₹${ps.deductions.totalDeductions.toLocaleString('en-IN')}
--------------------------------------------------------------------------------
NET TAKE-HOME SALARY : ₹${ps.netSalary.toLocaleString('en-IN')}
Payment Status       : ${ps.status}
================================================================================
Generated electronically via PeopleWorks Enterprise HRMS Payroll Engine.
`;
    const blob = new Blob([content.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payslip_${ps.employeeCode}_${ps.period.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadSelectedFromTable(): void {
    const selectedIds = this.selectedSlipIds();
    const slips = this.payslips().filter(ps => selectedIds.has(ps.id));
    this.executeBundleDownload(slips, this.selectedYear());
  }

  downloadModalSelected(): void {
    const selectedIds = this.modalSelectedSlipIds();
    const slips = this.payslips().filter(ps => selectedIds.has(ps.id));
    this.executeBundleDownload(slips, this.bulkDownloadYear());
    this.showBulkDownloadModal.set(false);
  }

  private executeBundleDownload(slips: Payslip[], yearLabel: string): void {
    if (slips.length === 0) return;

    let content = `================================================================================\n`;
    content += `         PEOPLEWORKS HRMS - CONSOLIDATED PAYSLIPS STATEMENT (${yearLabel})\n`;
    content += `================================================================================\n`;
    content += `Employee Name : ${slips[0].employeeName} (${slips[0].employeeCode})\n`;
    content += `Designation   : ${slips[0].designation} · Department: ${slips[0].department}\n`;
    content += `Generated On  : ${new Date().toLocaleDateString()}\n`;
    content += `Total Months  : ${slips.length} Payslips Included\n`;
    content += `================================================================================\n\n`;

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    slips.forEach((ps, idx) => {
      totalGross += ps.earnings.totalGross;
      totalDeductions += ps.deductions.totalDeductions;
      totalNet += ps.netSalary;

      content += `[${idx + 1}] PAYSLIP FOR ${ps.period.toUpperCase()} (Ref: ${ps.id})\n`;
      content += `    Attendance      : ${ps.presentDays} Present / ${ps.workingDays} Working Days\n`;
      content += `    Gross Earnings  : ₹${ps.earnings.totalGross.toLocaleString('en-IN')}\n`;
      content += `    Total Deductions: ₹${ps.deductions.totalDeductions.toLocaleString('en-IN')}\n`;
      content += `    Net Take-Home   : ₹${ps.netSalary.toLocaleString('en-IN')}\n`;
      content += `    Payment Status  : ${ps.status}\n`;
      content += `--------------------------------------------------------------------------------\n\n`;
    });

    content += `================================================================================\n`;
    content += `ANNUAL / PERIOD SUMMARY TOTALS (${slips.length} Months):\n`;
    content += `Total Gross Salary Paid : ₹${totalGross.toLocaleString('en-IN')}\n`;
    content += `Total Deductions Made   : ₹${totalDeductions.toLocaleString('en-IN')}\n`;
    content += `Total Net Disbursed     : ₹${totalNet.toLocaleString('en-IN')}\n`;
    content += `================================================================================\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payslips_Bundle_${yearLabel}_${slips[0].employeeCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    this.bulkSuccessMsg.set(`Successfully downloaded ${slips.length} payslip(s) for ${yearLabel}!`);
    setTimeout(() => this.bulkSuccessMsg.set(null), 4000);
  }
}

