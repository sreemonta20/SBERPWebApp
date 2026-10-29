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
 * Door terminals (fingerprint / face devices). A ZKTeco terminal is recognised by its serial
 * number when it pushes to /iclock/cdata; a "Generic JSON" device sends a device key, which is
 * shown once after saving (only its hash is stored).
 */
@Component({
  selector: 'app-attendance-device',
  standalone: false,
  templateUrl: './attendance-device.component.html',
  styleUrls: ['../shift/shift.component.css'],
})
export class AttendanceDeviceComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false; public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' = 'list';
  public isEdit = false;

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public deviceList: any[] = [];
  public searchTerm = '';
  /** Shown once after a Generic JSON device is saved; the server keeps only its hash. */
  public newDeviceKey: string | null = null;

  public protocols = [
    { id: 1, name: 'ZKTeco ADMS (Push)' },
    { id: 2, name: 'Generic JSON API' },
  ];

  public deviceForm!: FormGroup;
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
    this.loadDevicesPaging();
  }

  initializeForm(): void {
    this.deviceForm = this.formBuilder.group({
      id: [null],
      deviceCode: ['', Validators.required],
      name: ['', Validators.required],
      vendor: ['ZKTeco'],
      model: [''],
      serialNumber: ['', Validators.required],
      protocol: [1, Validators.required],
      location: [''],
      ipAddress: [''],
      remarks: [''],
      regenerateKey: [false],
      isActive: [true],
    });
  }

  loadDevicesPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: 'DeviceCode', SortColumnDirection: 'ASC',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.attendanceService.getAllAttendanceDevicesPagingWithSearch(filter).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success && res.result) {
          this.deviceList = res.result.items || [];
          this.totalRows = res.result.rowCount || 0;
          this.pageCount = res.result.pageCount || 0;
          this.currentPage = res.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else { this.deviceList = []; this.totalRows = 0; this.pageCount = 0; }
      },
      error: (e) => this.handleError(e),
    });
  }

  openCreateForm(): void {
    if (!this.isCreate) return;
    this.isEdit = false;
    this.newDeviceKey = null;
    this.initializeForm();
    this.viewMode = 'form';
  }

  editDevice(row: any): void {
    if (!this.isUpdate) return;
    this.isEdit = true;
    this.newDeviceKey = null;
    this.initializeForm();
    this.deviceForm.patchValue({
      id: row.id, deviceCode: row.deviceCode, name: row.name, vendor: row.vendor, model: row.model,
      serialNumber: row.serialNumber, protocol: row.protocol, location: row.location,
      ipAddress: row.ipAddress, remarks: row.remarks, isActive: row.isActive !== false,
    });
    this.viewMode = 'form';
  }

  cancelForm(): void { this.viewMode = 'list'; this.isEdit = false; }

  saveDevice(): void {
    if (this.deviceForm.invalid) {
      this.deviceForm.markAllAsTouched();
      this.notifyService.showWarning('Please fill the required fields', MessageConstants.GENERAL_WARNING_TITLE);
      return;
    }
    const v = this.deviceForm.value;
    const request = { actionName: this.isEdit ? 'Update' : 'Save', ...v, protocol: +v.protocol, createUpdateBy: this.appUserProfileId };
    this.loadingService.setLoading(true);
    this.attendanceService.createUpdateAttendanceDevice(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) {
          this.notifyService.showSuccess(res.message || 'Saved', MessageConstants.GENERAL_SUCCESS_TITLE);
          this.newDeviceKey = res.result?.deviceKey || null;
          this.viewMode = 'list'; this.loadDevicesPaging();
        } else this.notifyService.showWarning(res?.message || 'Save failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  deleteDevice(row: any): void {
    if (!this.isDelete || !row?.id) return;
    this.pendingDeleteId = row.id;
    this.deleteConfirmationMessage = `Device ${row.name} will be inactivated and its punches refused. Continue?`;
    this.confirmDialog?.open();
  }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.loadingService.setLoading(true);
    this.attendanceService.deleteAttendanceDevice(this.pendingDeleteId).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message || 'Removed', MessageConstants.GENERAL_SUCCESS_TITLE); this.loadDevicesPaging(); }
        else this.notifyService.showWarning(res?.message || 'Remove failed', MessageConstants.GENERAL_WARNING_TITLE);
        this.pendingDeleteId = '';
      },
      error: (e) => { this.handleError(e); this.pendingDeleteId = ''; },
    });
  }

  changePage(page: number): void { if (page >= 1 && page <= this.pageCount) { this.currentPage = page; this.loadDevicesPaging(); } }
  changePageSize(event: any): void { this.pageSize = +event.target.value; this.currentPage = 1; this.loadDevicesPaging(); }
  search(): void { this.currentPage = 1; this.loadDevicesPaging(); }
  updatePageIndices(): void { this.startPage = (this.currentPage - 1) * this.pageSize + 1; this.endPage = this.startPage - 1 + this.deviceList.length; }

  private handleError(error: any): void {
    this.loadingService.setLoading(false);
    this.error_message = error?.error;
    this.notifyService.showError(isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message, MessageConstants.GENERAL_ERROR_TITLE);
  }
}
