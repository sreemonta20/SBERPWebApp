import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  CommonService, LoaderService, NotificationService, HumanResourcesService,
} from '@app/core/services';
import { AttendanceService } from '@app/core/services/attendance.service';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';

/** Read-only monthly attendance summary. Pick a month (+ optional department). */
@Component({
  selector: 'app-attendance-summary',
  standalone: false,
  templateUrl: './attendance-summary.component.html',
  styleUrls: ['./attendance-summary.component.css'],
})
export class AttendanceSummaryComponent implements OnInit {
  public isView = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public month = '';            // 'yyyy-MM'
  public departmentId = '';
  public departments: any[] = [];
  public rows: any[] = [];
  public error_message: any;

  constructor(
    public router: Router,
    private attendanceService: AttendanceService,
    private hrService: HumanResourcesService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    const p = this.commonService.getMenuPermission(this.router.url);
    this.isView = p.IsView;
    const now = new Date();
    this.month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.loadDepartments();
    this.load();
  }

  loadDepartments(): void {
    this.hrService.getAllDepartments?.().subscribe?.({
      next: (r: any) => { if (r?.success && Array.isArray(r.result)) this.departments = r.result; }, error: () => {},
    });
  }

  load(): void {
    if (!this.month) return;
    const monthDate = `${this.month}-01`;     // first of the month; backend uses EOMONTH
    this.loadingService.setLoading(true);
    this.attendanceService.getMonthlyAttendanceSummary(monthDate, this.departmentId || undefined).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        this.rows = (res?.success && Array.isArray(res.result)) ? res.result : [];
      },
      error: (e) => this.handleError(e),
    });
  }

  private handleError(error: any): void {
    this.loadingService.setLoading(false);
    this.error_message = error?.error;
    this.notifyService.showError(isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message, MessageConstants.GENERAL_ERROR_TITLE);
  }
}
