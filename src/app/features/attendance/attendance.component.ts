import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { LeaveRequest } from '../../core/models';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideCalendarDays,
  LucideDownload,
  LucideCalendarCheck,
  LucideCalendar,
  LucideBriefcase
} from '@lucide/angular';

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'National Holiday' | 'Gazetted Holiday' | 'Festival Holiday' | 'Restricted Holiday';
  description?: string;
}

export type DayStatus = 'Present' | 'On Leave' | 'Holiday' | 'Weekly Off' | 'Scheduled';

export interface AttendanceDay {
  day: number;
  month: number; // 0-11
  year: number;
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  dayName: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  status: DayStatus;
  statusLabel: string;
  badgeClass: string;
  details: string;
  category: 'Working Day' | 'Approved Leave' | 'Official Holiday' | 'Weekly Off';
  leaveRequest?: LeaveRequest;
  holiday?: Holiday;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideChevronLeft,
    LucideChevronRight,
    LucideCalendarDays,
    LucideDownload,
    LucideCalendarCheck,
    LucideCalendar,
    LucideBriefcase
  ],
  templateUrl: './attendance.component.html'
})
export class AttendanceComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly api = inject(ApiService);
  readonly router = inject(Router);

  loading = true;

  // Calendar State
  currentYear = 2026;
  currentMonth = 9; // 0-indexed: 9 = October
  readonly todayStr = '2026-10-30';
  selectedDateStr = '2026-10-30';

  calendarGrid: AttendanceDay[] = [];
  monthDaysList: AttendanceDay[] = [];
  leaveRequests: LeaveRequest[] = [];

  // Filter for the log table
  activeFilter: 'all' | 'present' | 'leave' | 'holiday' | 'weekend' = 'all';

  // Monthly Metrics
  totalDaysInMonth = 31;
  workingDaysCount = 21;
  presentDaysCount = 19;
  leavesTakenCount = 2;
  holidaysAndOffsCount = 10;
  attendanceRate = 90.5;

  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  readonly weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  readonly allHolidays: Holiday[] = [
    { date: '2026-01-26', name: 'Republic Day', type: 'National Holiday', description: 'National Republic Day Celebration' },
    { date: '2026-03-04', name: 'Holi (Festival of Colors)', type: 'Festival Holiday', description: 'Spring festival celebration' },
    { date: '2026-03-20', name: 'Eid-ul-Fitr', type: 'Gazetted Holiday', description: 'Islamic festival marking end of Ramadan' },
    { date: '2026-04-03', name: 'Good Friday', type: 'Gazetted Holiday', description: 'Christian religious observance' },
    { date: '2026-04-14', name: 'Dr. B.R. Ambedkar Jayanti', type: 'Gazetted Holiday', description: 'Commemorating the architect of Indian constitution' },
    { date: '2026-05-01', name: 'International Workers\' Day (May Day)', type: 'National Holiday', description: 'Labour & Workforce Day' },
    { date: '2026-05-27', name: 'Bakrid / Eid al-Adha', type: 'Gazetted Holiday', description: 'Feast of the Sacrifice' },
    { date: '2026-08-15', name: 'Independence Day', type: 'National Holiday', description: '79th Indian Independence Day Celebration' },
    { date: '2026-08-28', name: 'Raksha Bandhan', type: 'Festival Holiday', description: 'Traditional sibling bond celebration' },
    { date: '2026-09-04', name: 'Janmashtami', type: 'Festival Holiday', description: 'Lord Krishna birth celebration' },
    { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'National Holiday', description: 'Birth anniversary of Mahatma Gandhi' },
    { date: '2026-10-20', name: 'Dussehra / Vijayadashami', type: 'Gazetted Holiday', description: 'Celebration of righteousness over evil' },
    { date: '2026-11-08', name: 'Diwali (Deepavali)', type: 'Festival Holiday', description: 'Festival of Lights & Prosperity' },
    { date: '2026-11-09', name: 'Govardhan Puja', type: 'Restricted Holiday', description: 'Post-Diwali devotion celebration' },
    { date: '2026-11-24', name: 'Guru Nanak Jayanti', type: 'Gazetted Holiday', description: 'Prakash Utsav of Guru Nanak Dev Ji' },
    { date: '2026-12-25', name: 'Christmas Day', type: 'Gazetted Holiday', description: 'Celebration of the Nativity of Jesus' },
    { date: '2027-01-01', name: 'New Year\'s Day', type: 'Restricted Holiday', description: 'Beginning of the calendar year' },
    { date: '2027-01-26', name: 'Republic Day', type: 'National Holiday', description: 'National Republic Day Celebration' }
  ];

  get currentMonthLabel(): string {
    return `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
  }

  get isViewingCurrentMonth(): boolean {
    return this.currentYear === 2026 && this.currentMonth === 9;
  }

  get selectedDayObj(): AttendanceDay | undefined {
    return this.calendarGrid.find(d => d.dateStr === this.selectedDateStr && d.isCurrentMonth)
      || this.monthDaysList.find(d => d.dateStr === this.selectedDateStr);
  }

  get filteredTableDays(): AttendanceDay[] {
    if (this.activeFilter === 'all') return this.monthDaysList;
    if (this.activeFilter === 'present') return this.monthDaysList.filter(d => d.status === 'Present' || d.status === 'Scheduled');
    if (this.activeFilter === 'leave') return this.monthDaysList.filter(d => d.status === 'On Leave');
    if (this.activeFilter === 'holiday') return this.monthDaysList.filter(d => d.status === 'Holiday');
    if (this.activeFilter === 'weekend') return this.monthDaysList.filter(d => d.status === 'Weekly Off');
    return this.monthDaysList;
  }

  get countAll(): number { return this.monthDaysList.length; }
  get countPresent(): number { return this.monthDaysList.filter(d => d.status === 'Present' || d.status === 'Scheduled').length; }
  get countLeave(): number { return this.monthDaysList.filter(d => d.status === 'On Leave').length; }
  get countHoliday(): number { return this.monthDaysList.filter(d => d.status === 'Holiday').length; }
  get countWeekend(): number { return this.monthDaysList.filter(d => d.status === 'Weekly Off').length; }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    const user = this.auth.currentUser();
    this.loading = true;
    try {
      if (user) {
        const res = await firstValueFrom(this.api.getLeaveRequests({ employeeId: user.employeeId }));
        if (res?.success) {
          this.leaveRequests = res.requests || [];
        }
      }
    } catch (err) {
      console.error('Failed to load leave records:', err);
    } finally {
      this.buildMonthView();
      this.loading = false;
    }
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.buildMonthView();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.buildMonthView();
  }

  goToToday(): void {
    this.currentYear = 2026;
    this.currentMonth = 9; // October 2026
    this.selectedDateStr = this.todayStr;
    this.buildMonthView();
  }

  selectDay(day: AttendanceDay): void {
    this.selectedDateStr = day.dateStr;
    if (!day.isCurrentMonth) {
      this.currentMonth = day.month;
      this.currentYear = day.year;
      this.buildMonthView();
    }
  }

  navigateToLeaves(): void {
    this.router.navigate(['/leave']);
  }

  buildMonthView(): void {
    const year = this.currentYear;
    const month = this.currentMonth;

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 for Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const grid: AttendanceDay[] = [];
    const monthDays: AttendanceDay[] = [];

    // Trailing days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      grid.push(this.createDayObj(prevY, prevM, d, false));
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayObj = this.createDayObj(year, month, d, true);
      grid.push(dayObj);
      monthDays.push(dayObj);
    }

    // Leading days from next month (grid total 35 or 42)
    const totalCells = grid.length <= 35 ? 35 : 42;
    const remaining = totalCells - grid.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      grid.push(this.createDayObj(nextY, nextM, d, false));
    }

    this.calendarGrid = grid;
    this.monthDaysList = monthDays;

    this.calculateMonthMetrics(monthDays);
  }

  private createDayObj(year: number, month: number, d: number, isCurrentMonth: boolean): AttendanceDay {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(year, month, d);
    const dayOfWeek = dateObj.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[dayOfWeek];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isToday = dateStr === this.todayStr;

    const holiday = this.allHolidays.find(h => h.date === dateStr);

    // Check for approved or pending user leave
    const leaveReq = this.leaveRequests.find(r =>
      dateStr >= r.startDate &&
      dateStr <= r.endDate &&
      (r.status === 'Approved' || r.status === 'Pending')
    );

    let status: DayStatus = 'Present';
    let statusLabel = 'Present';
    let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    let details = 'Regular Working Day';
    let category: 'Working Day' | 'Approved Leave' | 'Official Holiday' | 'Weekly Off' = 'Working Day';

    if (leaveReq) {
      status = 'On Leave';
      statusLabel = leaveReq.status === 'Approved' ? 'On Leave' : 'Leave Pending';
      badgeClass = leaveReq.status === 'Approved'
        ? 'bg-purple-50 text-purple-700 border-purple-200'
        : 'bg-amber-50 text-amber-700 border-amber-200';
      details = `${leaveReq.leaveType} (${leaveReq.status}) - ${leaveReq.reason || 'Personal leave'}`;
      category = 'Approved Leave';
    } else if (holiday) {
      status = 'Holiday';
      statusLabel = 'Holiday';
      badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
      details = `${holiday.name} (${holiday.type})`;
      category = 'Official Holiday';
    } else if (isWeekend) {
      status = 'Weekly Off';
      statusLabel = 'Weekly Off';
      badgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
      details = `Weekly Off (${dayName})`;
      category = 'Weekly Off';
    } else {
      if (dateStr > this.todayStr) {
        status = 'Scheduled';
        statusLabel = 'Scheduled';
        badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
        details = 'Scheduled Working Day';
        category = 'Working Day';
      } else {
        status = 'Present';
        statusLabel = 'Present';
        badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        details = 'Regular Working Day';
        category = 'Working Day';
      }
    }

    return {
      day: d,
      month,
      year,
      dateStr,
      dayOfWeek,
      dayName,
      isCurrentMonth,
      isToday,
      isWeekend,
      status,
      statusLabel,
      badgeClass,
      details,
      category,
      leaveRequest: leaveReq,
      holiday
    };
  }

  private calculateMonthMetrics(monthDays: AttendanceDay[]): void {
    this.totalDaysInMonth = monthDays.length;

    const weekends = monthDays.filter(d => d.isWeekend).length;
    const holidaysOnWeekdays = monthDays.filter(d => !d.isWeekend && d.status === 'Holiday').length;

    // Working days are all weekdays minus official holidays
    this.workingDaysCount = this.totalDaysInMonth - weekends - holidaysOnWeekdays;

    // Leaves taken on working days
    this.leavesTakenCount = monthDays.filter(d => !d.isWeekend && d.status === 'On Leave').length;

    // Days present
    this.presentDaysCount = Math.max(0, this.workingDaysCount - this.leavesTakenCount);

    this.holidaysAndOffsCount = weekends + holidaysOnWeekdays;

    if (this.workingDaysCount > 0) {
      this.attendanceRate = Math.round((this.presentDaysCount / this.workingDaysCount) * 1000) / 10;
    } else {
      this.attendanceRate = 100;
    }
  }
}
