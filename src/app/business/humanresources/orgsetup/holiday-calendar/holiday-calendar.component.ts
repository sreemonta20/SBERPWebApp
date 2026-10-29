import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService, LoaderService, NotificationService } from '@app/core/services';
import { HolidayCalendarService } from '@app/core/services/orgsetup.services';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

/**
 * Holiday calendars — list + form, plus a child panel to manage the individual
 * holiday dates that belong to a calendar. Leave/Attendance read these dates
 * (via fn_IsHoliday) to exclude non-working days.
 */
@Component({
  selector: 'app-holiday-calendar',
  standalone: false,
  templateUrl: './holiday-calendar.component.html',
  styleUrls: ['./holiday-calendar.component.css'],
})
export class HolidayCalendarComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false; public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' | 'dates' = 'list';
  public isEdit = false;

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public list: any[] = [];
  public searchTerm = '';

  public form!: FormGroup;
  public deleteConfirmationMessage = '';
  private pendingDeleteId = '';
  private pendingDeleteKind: 'calendar' | 'date' = 'calendar';
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  // child holiday dates
  public activeCalendar: any = null;
  public holidayDates: any[] = [];
  public dateForm!: FormGroup;
  public showDateForm = false;
  public isDateEdit = false;
  public holidayTypes = [
    { id: 1, name: 'Public Holiday' }, { id: 2, name: 'Religious' }, { id: 3, name: 'National' },
    { id: 4, name: 'Company Holiday' }, { id: 5, name: 'Optional / Restricted' },
  ];

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private service: HolidayCalendarService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().subscribe((u: User) => (this.appUserProfileId = u?.Id || ''));
    const p = this.commonService.getMenuPermission(this.router.url);
    this.isView = p.IsView; this.isCreate = p.IsCreate; this.isUpdate = p.IsUpdate; this.isDelete = p.IsDelete;
    this.initForm();
    this.initDateForm();
    this.loadPaging();
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      id: [null],
      name: ['', Validators.required],
      year: [new Date().getFullYear()],
      country: [''],
      description: [''],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  initDateForm(): void {
    this.dateForm = this.formBuilder.group({
      id: [null],
      holidayCalendarId: [''],
      name: ['', Validators.required],
      holidayDate: [null, Validators.required],
      holidayTypeId: [1, Validators.required],
      isRecurring: [false],
      description: [''],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  loadPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: '', SortColumnDirection: 'asc',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.service.getAllPaging(filter as any).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success && res.result) {
          this.list = res.result.items || [];
          this.totalRows = res.result.rowCount || 0;
          this.pageCount = res.result.pageCount || 0;
          this.currentPage = res.result.currentPage || 1;
          this.buildPager();
        } else { this.list = []; this.totalRows = 0; }
      },
      error: (err) => { this.loadingService.setLoading(false); this.handleError(err); },
    });
  }

  buildPager(): void {
    this.startPage = (this.currentPage - 1) * this.pageSize + 1;
    this.endPage = Math.min(this.currentPage * this.pageSize, this.totalRows);
  }

  onSearch(): void { this.currentPage = 1; this.loadPaging(); }
  onPageChange(page: number): void { if (page < 1 || page > this.pageCount) return; this.currentPage = page; this.loadPaging(); }
  onPageSizeChange(): void { this.currentPage = 1; this.loadPaging(); }

  openCreate(): void { this.isEdit = false; this.initForm(); this.viewMode = 'form'; }
  openEdit(row: any): void { this.isEdit = true; this.form.patchValue({ ...row, createUpdateBy: this.appUserProfileId }); this.viewMode = 'form'; }
  backToList(): void { this.viewMode = 'list'; this.loadPaging(); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const payload = { ...this.form.value, actionName: this.isEdit ? 'Update' : 'Save', createUpdateBy: this.appUserProfileId };
    this.loadingService.setLoading(true);
    this.service.createUpdate(payload).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE); this.backToList(); }
        else { this.notifyService.showWarning(res?.message, MessageConstants.GENERAL_WARNING_TITLE); }
      },
      error: (err) => { this.loadingService.setLoading(false); this.handleError(err); },
    });
  }

  confirmDelete(row: any): void {
    this.pendingDeleteId = row.id; this.pendingDeleteKind = 'calendar';
    this.deleteConfirmationMessage = `Delete calendar "${row.name}" and its holidays?`;
    this.confirmDialog.open();
  }

  // ---- child holiday dates ----
  manageDates(row: any): void {
    this.activeCalendar = row;
    this.viewMode = 'dates';
    this.showDateForm = false;
    this.loadHolidayDates();
  }
  loadHolidayDates(): void {
    this.loadingService.setLoading(true);
    this.service.getHolidayDates(this.activeCalendar.id).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        this.holidayDates = res?.success ? (res.result || []) : [];
      },
      error: (err) => { this.loadingService.setLoading(false); this.handleError(err); },
    });
  }
  addDate(): void {
    this.isDateEdit = false; this.initDateForm();
    this.dateForm.patchValue({ holidayCalendarId: this.activeCalendar.id });
    this.showDateForm = true;
  }
  editDate(d: any): void {
    this.isDateEdit = true;
    this.dateForm.patchValue({
      id: d.id, holidayCalendarId: this.activeCalendar.id, name: d.name,
      holidayDate: (d.holidayDate || '').substring(0, 10), holidayTypeId: d.holidayTypeId,
      isRecurring: d.isRecurring, description: d.description, createUpdateBy: this.appUserProfileId,
    });
    this.showDateForm = true;
  }
  saveDate(): void {
    if (this.dateForm.invalid) { this.dateForm.markAllAsTouched(); return; }
    const payload = { ...this.dateForm.value, actionName: this.isDateEdit ? 'Update' : 'Save', createUpdateBy: this.appUserProfileId };
    this.loadingService.setLoading(true);
    this.service.createUpdateHolidayDate(payload).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE); this.showDateForm = false; this.loadHolidayDates(); }
        else { this.notifyService.showWarning(res?.message, MessageConstants.GENERAL_WARNING_TITLE); }
      },
      error: (err) => { this.loadingService.setLoading(false); this.handleError(err); },
    });
  }
  confirmDeleteDate(d: any): void {
    this.pendingDeleteId = d.id; this.pendingDeleteKind = 'date';
    this.deleteConfirmationMessage = `Remove holiday "${d.name}"?`;
    this.confirmDialog.open();
  }
  backToCalendars(): void { this.viewMode = 'list'; this.activeCalendar = null; this.loadPaging(); }

  onDeleteConfirmed(): void {
    this.loadingService.setLoading(true);
    const call = this.pendingDeleteKind === 'calendar'
      ? this.service.delete(this.pendingDeleteId)
      : this.service.deleteHolidayDate(this.pendingDeleteId);
    call.subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) {
          this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE);
          this.pendingDeleteKind === 'calendar' ? this.loadPaging() : this.loadHolidayDates();
        } else { this.notifyService.showWarning(res?.message, MessageConstants.GENERAL_WARNING_TITLE); }
      },
      error: (err) => { this.loadingService.setLoading(false); this.handleError(err); },
    });
  }

  private handleError(err: any): void {
    this.error_message = err;
    if (isCommonErrorShow) this.notifyService.showError(MessageConstants.INTERNAL_ERROR_MEG, MessageConstants.GENERAL_ERROR_TITLE);
  }
}
