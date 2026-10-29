import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  CommonService, LoaderService, NotificationService, HumanResourcesService,
} from '@app/core/services';
import { AttendanceService } from '@app/core/services/attendance.service';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';

/**
 * Every check-in / check-out received from phones and door terminals, including rejected and
 * duplicate ones. "Recalculate" rebuilds the daily attendance from the punches (earliest = in,
 * latest = out) — e.g. after the day cut-off or a shift was changed.
 */
@Component({
  selector: 'app-attendance-punch',
  standalone: false,
  templateUrl: './attendance-punch.component.html',
  styleUrls: ['../shift/shift.component.css'],
})
export class AttendancePunchComponent implements OnInit {
  public isView = false; public isUpdate = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public totalRows = 0; public currentPage = 1; public pageSize = 20;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public punchList: any[] = [];
  public employees: any[] = [];
  public searchTerm = '';

  public showReprocess = false;
  public reprocessFrom = '';
  public reprocessTo = '';
  public reprocessEmployeeId = '';
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
    this.isView = p.IsView; this.isUpdate = p.IsUpdate;
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    this.reprocessFrom = this.toInputDate(first);
    this.reprocessTo = this.toInputDate(today);
    this.loadPunchesPaging();
  }

  private toInputDate(d: Date): string {
    const m = `${d.getMonth() + 1}`.padStart(2, '0'); const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  loadPunchesPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: 'PunchLocalTime', SortColumnDirection: 'DESC',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.attendanceService.getAllAttendancePunchesPagingWithSearch(filter).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success && res.result) {
          this.punchList = res.result.items || [];
          this.totalRows = res.result.rowCount || 0;
          this.pageCount = res.result.pageCount || 0;
          this.currentPage = res.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else { this.punchList = []; this.totalRows = 0; this.pageCount = 0; }
      },
      error: (e) => this.handleError(e),
    });
  }

  toggleReprocess(): void {
    this.showReprocess = !this.showReprocess;
    if (this.showReprocess && this.employees.length === 0) {
      this.hrService.getAllEmployees().subscribe({
        next: (r: any) => { if (r?.success && Array.isArray(r.result)) this.employees = r.result; }, error: () => {},
      });
    }
  }

  reprocess(): void {
    if (!this.isUpdate || !this.reprocessFrom || !this.reprocessTo) return;
    this.loadingService.setLoading(true);
    const request = { fromDate: this.reprocessFrom, toDate: this.reprocessTo, employeeId: this.reprocessEmployeeId || null };
    this.attendanceService.reprocessAttendance(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) {
          this.notifyService.showSuccess(`${res.message} (${res.result?.employeeDays ?? 0} employee-days)`, MessageConstants.GENERAL_SUCCESS_TITLE);
          this.showReprocess = false;
        } else this.notifyService.showWarning(res?.message || 'Recalculation failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  statusBadge(statusId: number): string {
    return statusId === 1 ? 'badge-success' : statusId === 2 ? 'badge-info' : 'badge-danger';
  }

  punchTypeName(id: number): string { return id === 1 ? 'In' : id === 2 ? 'Out' : 'Auto'; }

  changePage(page: number): void { if (page >= 1 && page <= this.pageCount) { this.currentPage = page; this.loadPunchesPaging(); } }
  changePageSize(event: any): void { this.pageSize = +event.target.value; this.currentPage = 1; this.loadPunchesPaging(); }
  search(): void { this.currentPage = 1; this.loadPunchesPaging(); }
  updatePageIndices(): void { this.startPage = (this.currentPage - 1) * this.pageSize + 1; this.endPage = this.startPage - 1 + this.punchList.length; }

  private handleError(error: any): void {
    this.loadingService.setLoading(false);
    this.error_message = error?.error;
    this.notifyService.showError(isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message, MessageConstants.GENERAL_ERROR_TITLE);
  }
}
