import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CommonService, LoaderService, NotificationService, HumanResourcesService,
} from '@app/core/services';
import { AttendanceService } from '@app/core/services/attendance.service';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { take } from 'rxjs';

/**
 * Employee biometric registrations. Mobile-app registrations are created by the employee in the
 * app; HR can revoke them (lost / changed phone). Door-terminal enrolments map the PIN the
 * terminal reports to an employee.
 */
@Component({
  selector: 'app-biometric-registration',
  standalone: false,
  templateUrl: './biometric-registration.component.html',
  styleUrls: ['../shift/shift.component.css'],
})
export class BiometricRegistrationComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false; public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' = 'list';

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public registrationList: any[] = [];
  public employees: any[] = [];
  public devices: any[] = [];
  public searchTerm = '';

  public enrollForm!: FormGroup;
  public revokeReason = '';
  public revokeConfirmationMessage = '';
  private pendingRevokeId = '';
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private attendanceService: AttendanceService,
    private hrService: HumanResourcesService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().pipe(take(1)).subscribe((u: User) => (this.appUserProfileId = u?.Id || ''));
    const p = this.commonService.getMenuPermission(this.router.url);
    this.isView = p.IsView; this.isCreate = p.IsCreate; this.isUpdate = p.IsUpdate; this.isDelete = p.IsDelete;
    this.initializeForm();
    this.loadRegistrationsPaging();
  }

  initializeForm(): void {
    this.enrollForm = this.formBuilder.group({
      employeeId: ['', Validators.required],
      biometricTypeId: [1, Validators.required],
      attendanceDeviceId: [''],
      deviceUserPin: ['', Validators.required],
      consentGiven: [false, Validators.requiredTrue],
    });
  }

  loadRegistrationsPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: '', SortColumnDirection: 'DESC',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.attendanceService.getAllBiometricRegistrationsPagingWithSearch(filter).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success && res.result) {
          this.registrationList = res.result.items || [];
          this.totalRows = res.result.rowCount || 0;
          this.pageCount = res.result.pageCount || 0;
          this.currentPage = res.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else { this.registrationList = []; this.totalRows = 0; this.pageCount = 0; }
      },
      error: (e) => this.handleError(e),
    });
  }

  /** Employees and active terminals for the enrolment form. */
  private loadPickers(): void {
    this.hrService.getAllEmployees().subscribe({
      next: (r: any) => { if (r?.success && Array.isArray(r.result)) this.employees = r.result; }, error: () => {},
    });
    const filter = { SearchTerm: '', SortColumnName: 'DeviceCode', SortColumnDirection: 'ASC', PageNumber: 1, PageSize: 100 } as any;
    this.attendanceService.getAllAttendanceDevicesPagingWithSearch(filter).subscribe({
      next: (r: any) => { this.devices = (r?.result?.items || []).filter((d: any) => d.isActive); }, error: () => {},
    });
  }

  openEnrollForm(): void {
    if (!this.isCreate) return;
    this.initializeForm();
    this.loadPickers();
    this.viewMode = 'form';
  }

  cancelForm(): void { this.viewMode = 'list'; }

  saveEnrollment(): void {
    if (this.enrollForm.invalid) {
      this.enrollForm.markAllAsTouched();
      this.notifyService.showWarning('Fill the required fields and confirm the employee\'s consent.', MessageConstants.GENERAL_WARNING_TITLE);
      return;
    }
    const v = this.enrollForm.value;
    const request = {
      ...v, biometricTypeId: +v.biometricTypeId,
      attendanceDeviceId: v.attendanceDeviceId || null, createUpdateBy: this.appUserProfileId,
    };
    this.loadingService.setLoading(true);
    this.attendanceService.createTerminalEnrollment(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) {
          this.notifyService.showSuccess(res.message || 'Saved', MessageConstants.GENERAL_SUCCESS_TITLE);
          this.viewMode = 'list'; this.loadRegistrationsPaging();
        } else this.notifyService.showWarning(res?.message || 'Save failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  revoke(row: any): void {
    if (!this.isDelete || !row?.id) return;
    this.pendingRevokeId = row.id;
    this.revokeReason = '';
    this.revokeConfirmationMessage = `Revoke ${row.registrationNo} of ${row.employeeName}? The employee must register again to check in with it. Stored biometric data for it is deleted.`;
    this.confirmDialog?.open();
  }

  executeRevoke(): void {
    if (!this.pendingRevokeId) return;
    this.loadingService.setLoading(true);
    const request = { id: this.pendingRevokeId, reason: this.revokeReason || 'Revoked by HR', createUpdateBy: this.appUserProfileId };
    this.attendanceService.revokeBiometricRegistration(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message || 'Revoked', MessageConstants.GENERAL_SUCCESS_TITLE); this.loadRegistrationsPaging(); }
        else this.notifyService.showWarning(res?.message || 'Revoke failed', MessageConstants.GENERAL_WARNING_TITLE);
        this.pendingRevokeId = '';
      },
      error: (e) => { this.handleError(e); this.pendingRevokeId = ''; },
    });
  }

  statusBadge(statusId: number): string {
    return statusId === 2 ? 'badge-success' : statusId === 1 ? 'badge-warning' : 'badge-secondary';
  }

  changePage(page: number): void { if (page >= 1 && page <= this.pageCount) { this.currentPage = page; this.loadRegistrationsPaging(); } }
  changePageSize(event: any): void { this.pageSize = +event.target.value; this.currentPage = 1; this.loadRegistrationsPaging(); }
  search(): void { this.currentPage = 1; this.loadRegistrationsPaging(); }
  updatePageIndices(): void { this.startPage = (this.currentPage - 1) * this.pageSize + 1; this.endPage = this.startPage - 1 + this.registrationList.length; }

  private handleError(error: any): void {
    this.loadingService.setLoading(false);
    this.error_message = error?.error;
    this.notifyService.showError(isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message, MessageConstants.GENERAL_ERROR_TITLE);
  }
}
