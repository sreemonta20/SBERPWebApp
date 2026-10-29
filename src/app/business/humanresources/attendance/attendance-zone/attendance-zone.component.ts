import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CommonService, LoaderService, NotificationService,
} from '@app/core/services';
import { AttendanceService } from '@app/core/services/attendance.service';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

/**
 * Office zones: where a mobile check-in is allowed. A punch passes when the phone's IP is in an
 * allowed range (checked by the server), or it reports an allowed Wi-Fi access point (BSSID), or
 * a GPS position inside the radius.
 */
@Component({
  selector: 'app-attendance-zone',
  standalone: false,
  templateUrl: './attendance-zone.component.html',
  styleUrls: ['../shift/shift.component.css'],
})
export class AttendanceZoneComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false; public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' = 'list';
  public isEdit = false;

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public zoneList: any[] = [];
  public searchTerm = '';

  public zoneForm!: FormGroup;
  public deleteConfirmationMessage = '';
  private pendingDeleteId = '';
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private attendanceService: AttendanceService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().subscribe((u: User) => (this.appUserProfileId = u?.Id || ''));
    const p = this.commonService.getMenuPermission(this.router.url);
    this.isView = p.IsView; this.isCreate = p.IsCreate; this.isUpdate = p.IsUpdate; this.isDelete = p.IsDelete;
    this.initializeForm();
    this.loadZonesPaging();
  }

  initializeForm(): void {
    this.zoneForm = this.formBuilder.group({
      id: [null],
      zoneCode: ['', Validators.required],
      name: ['', Validators.required],
      allowedIpRanges: [''],
      allowedWifiBssids: [''],
      latitude: [null],
      longitude: [null],
      radiusMeters: [null],
      remarks: [''],
      isActive: [true],
    });
  }

  loadZonesPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: 'ZoneCode', SortColumnDirection: 'ASC',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.attendanceService.getAllAttendanceZonesPagingWithSearch(filter).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success && res.result) {
          this.zoneList = res.result.items || [];
          this.totalRows = res.result.rowCount || 0;
          this.pageCount = res.result.pageCount || 0;
          this.currentPage = res.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else { this.zoneList = []; this.totalRows = 0; this.pageCount = 0; }
      },
      error: (e) => this.handleError(e),
    });
  }

  openCreateForm(): void {
    if (!this.isCreate) return;
    this.isEdit = false;
    this.initializeForm();
    this.viewMode = 'form';
  }

  editZone(row: any): void {
    if (!this.isUpdate) return;
    this.isEdit = true;
    this.initializeForm();
    this.zoneForm.patchValue({
      id: row.id, zoneCode: row.zoneCode, name: row.name, allowedIpRanges: row.allowedIpRanges,
      allowedWifiBssids: row.allowedWifiBssids, latitude: row.latitude, longitude: row.longitude,
      radiusMeters: row.radiusMeters, remarks: row.remarks, isActive: row.isActive !== false,
    });
    this.viewMode = 'form';
  }

  cancelForm(): void { this.viewMode = 'list'; this.isEdit = false; }

  saveZone(): void {
    if (this.zoneForm.invalid) {
      this.zoneForm.markAllAsTouched();
      this.notifyService.showWarning('Please fill the required fields', MessageConstants.GENERAL_WARNING_TITLE);
      return;
    }
    const request = { actionName: this.isEdit ? 'Update' : 'Save', ...this.zoneForm.value, createUpdateBy: this.appUserProfileId };
    this.loadingService.setLoading(true);
    this.attendanceService.createUpdateAttendanceZone(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) {
          this.notifyService.showSuccess(res.message || 'Saved', MessageConstants.GENERAL_SUCCESS_TITLE);
          this.viewMode = 'list'; this.loadZonesPaging();
        } else this.notifyService.showWarning(res?.message || 'Save failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  deleteZone(row: any): void {
    if (!this.isDelete || !row?.id) return;
    this.pendingDeleteId = row.id;
    this.deleteConfirmationMessage = `Zone ${row.name} will be inactivated. Mobile check-ins from it will be refused. Continue?`;
    this.confirmDialog?.open();
  }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.loadingService.setLoading(true);
    this.attendanceService.deleteAttendanceZone(this.pendingDeleteId).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message || 'Removed', MessageConstants.GENERAL_SUCCESS_TITLE); this.loadZonesPaging(); }
        else this.notifyService.showWarning(res?.message || 'Remove failed', MessageConstants.GENERAL_WARNING_TITLE);
        this.pendingDeleteId = '';
      },
      error: (e) => { this.handleError(e); this.pendingDeleteId = ''; },
    });
  }

  changePage(page: number): void { if (page >= 1 && page <= this.pageCount) { this.currentPage = page; this.loadZonesPaging(); } }
  changePageSize(event: any): void { this.pageSize = +event.target.value; this.currentPage = 1; this.loadZonesPaging(); }
  search(): void { this.currentPage = 1; this.loadZonesPaging(); }
  updatePageIndices(): void { this.startPage = (this.currentPage - 1) * this.pageSize + 1; this.endPage = this.startPage - 1 + this.zoneList.length; }

  private handleError(error: any): void {
    this.loadingService.setLoading(false);
    this.error_message = error?.error;
    this.notifyService.showError(isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message, MessageConstants.GENERAL_ERROR_TITLE);
  }
}
