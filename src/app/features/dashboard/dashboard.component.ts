import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { LeaveRequest } from '../../core/models';
import { 
  LucideFileText, LucideChevronRight, 
  LucideChevronLeft, LucideCalendarDays,
  LucideUsers, LucideUserCheck
} from '@lucide/angular';

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'National Holiday' | 'Gazetted Holiday' | 'Festival Holiday' | 'Restricted Holiday';
  description?: string;
}

export interface CalendarDay {
  day: number;
  month: number; // 0-11
  year: number;
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  holiday?: Holiday;
  myApprovedLeave?: LeaveRequest;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LucideFileText,
    LucideChevronRight,
    LucideChevronLeft,
    LucideCalendarDays,
    LucideUsers,
    LucideUserCheck
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  recentRequests: LeaveRequest[] = [];
  todayOnLeave: LeaveRequest[] = [];
  myApprovedLeaves: LeaveRequest[] = [];
  summaryStats: any = null;
  loading = true;

  // Calendar State
  currentCalYear = 2026;
  currentCalMonth = 9; // 0-indexed: 9 = October
  selectedDateStr = '2026-10-30'; // Default today's date selected
  calendarDays: CalendarDay[] = [];

  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  readonly weekDayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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

  get isManager(): boolean {
    return this.auth.currentUser()?.role === 'Manager';
  }

  get isHR(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'HR Admin' || role === 'Super Admin';
  }

  get currentMonthLabel(): string {
    return `${this.monthNames[this.currentCalMonth]} ${this.currentCalYear}`;
  }

  ngOnInit(): void {
    this.generateCalendar();
    this.loadData();
  }

  prevMonth(): void {
    if (this.currentCalMonth === 0) {
      this.currentCalMonth = 11;
      this.currentCalYear--;
    } else {
      this.currentCalMonth--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    if (this.currentCalMonth === 11) {
      this.currentCalMonth = 0;
      this.currentCalYear++;
    } else {
      this.currentCalMonth++;
    }
    this.generateCalendar();
  }

  goToToday(): void {
    this.currentCalYear = 2026;
    this.currentCalMonth = 9; // October 2026
    this.selectedDateStr = '2026-10-30';
    this.generateCalendar();
  }

  selectDate(cell: CalendarDay): void {
    this.selectedDateStr = cell.dateStr;
    if (!cell.isCurrentMonth) {
      this.currentCalMonth = cell.month;
      this.currentCalYear = cell.year;
      this.generateCalendar();
    }
  }

  getDayName(cell: CalendarDay): string {
    return cell.dayOfWeek === 0 ? 'Sunday' : 'Saturday';
  }

  getTooltip(cell: CalendarDay): string {
    if (cell.myApprovedLeave) {
      return `My Approved Leave: ${cell.myApprovedLeave.leaveType} (Approved)`;
    }
    if (cell.holiday) {
      return `${cell.holiday.name} (${cell.holiday.type}) - Holiday`;
    }
    if (cell.isWeekend) {
      const day = cell.dayOfWeek === 0 ? 'Sunday' : 'Saturday';
      return `Weekly Off (${day}) - Weekend Holiday`;
    }
    return `${cell.dateStr} - Regular Working Day`;
  }

  selectHoliday(holiday: Holiday): void {
    this.selectedDateStr = holiday.date;
    const parts = holiday.date.split('-').map(Number);
    if (this.currentCalYear !== parts[0] || this.currentCalMonth !== parts[1] - 1) {
      this.currentCalYear = parts[0];
      this.currentCalMonth = parts[1] - 1;
      this.generateCalendar();
    }
  }

  generateCalendar(): void {
    const days: CalendarDay[] = [];
    const year = this.currentCalYear;
    const month = this.currentCalMonth;

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 for Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const todayStr = '2026-10-30';

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hol = this.allHolidays.find(h => h.date === dateStr);
      const myLeave = this.myApprovedLeaves.find(r => dateStr >= r.startDate && dateStr <= r.endDate);
      const dayOfWeek = new Date(prevY, prevM, d).getDay();
      days.push({
        day: d,
        month: prevM,
        year: prevY,
        dateStr,
        dayOfWeek,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        holiday: hol,
        myApprovedLeave: myLeave
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hol = this.allHolidays.find(h => h.date === dateStr);
      const myLeave = this.myApprovedLeaves.find(r => dateStr >= r.startDate && dateStr <= r.endDate);
      const dayOfWeek = new Date(year, month, d).getDay();
      days.push({
        day: d,
        month,
        year,
        dateStr,
        dayOfWeek,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        holiday: hol,
        myApprovedLeave: myLeave
      });
    }

    // Next month leading days to complete grid (total 35 or 42)
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hol = this.allHolidays.find(h => h.date === dateStr);
      const myLeave = this.myApprovedLeaves.find(r => dateStr >= r.startDate && dateStr <= r.endDate);
      const dayOfWeek = new Date(nextY, nextM, d).getDay();
      days.push({
        day: d,
        month: nextM,
        year: nextY,
        dateStr,
        dayOfWeek,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        holiday: hol,
        myApprovedLeave: myLeave
      });
    }

    this.calendarDays = days;
  }

  async loadData(): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;
    this.loading = true;
    try {
      const [myLeavesRes, allApprovedLeavesRes, statsRes] = await Promise.all([
        firstValueFrom(this.api.getLeaveRequests({ employeeId: user.employeeId })),
        firstValueFrom(this.api.getLeaveRequests({ status: 'Approved' })),
        firstValueFrom(this.api.getReportSummary())
      ]);

      if (myLeavesRes.success) {
        this.myApprovedLeaves = myLeavesRes.requests.filter(r => r.status === 'Approved');
        this.recentRequests = myLeavesRes.requests.slice(0, 3);
      }
      if (allApprovedLeavesRes.success) {
        const todayStr = '2026-10-30';
        this.todayOnLeave = allApprovedLeavesRes.requests.filter(r => 
          r.startDate <= todayStr && r.endDate >= todayStr
        );
      }
      if (statsRes.success) this.summaryStats = statsRes.stats;

      // Re-render calendar so my approved leave dates get marked
      this.generateCalendar();
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      this.loading = false;
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  navigate(tab: string): void {
    this.router.navigate([`/${tab}`]);
  }
}
