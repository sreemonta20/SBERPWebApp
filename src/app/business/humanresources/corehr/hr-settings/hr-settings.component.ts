import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import {
  CommonService,
  LoaderService,
  NotificationService,
  HumanResourcesService,
} from '@app/core/services';
import { HRSettings } from '@app/core/interface/common';
import { isCommonErrorShow } from '@environments/environment';

@Component({
  selector: 'app-hr-settings',
  standalone: false,
  templateUrl: './hr-settings.component.html',
  styleUrls: ['./hr-settings.component.css'],
})
export class HrSettingsComponent implements OnInit, AfterViewInit {
  // Current user
  public appUserProfileId: string = '';

  // Permission
  public isView = false;
  public isCreate = false;
  public isUpdate = false;
  public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  // Form
  public settingsForm!: FormGroup;
  public saving: boolean = false;

  // Attendance upload state
  public selectedFile: File | null = null;
  public uploading: boolean = false;
  public uploadResult: any = null;

  public error_message: any;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private hrService: HumanResourcesService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().subscribe((user: User) => {
      this.appUserProfileId = user?.Id || '';
    });
    this.loadPermission(this.router.url);
    this.initializeForm();
    this.loadSettings();
  }

  ngAfterViewInit(): void {}

  loadPermission(url: any): void {
    const permissionModel = this.commonService.getMenuPermission(url);
    this.isView = permissionModel.IsView;
    this.isCreate = permissionModel.IsCreate;
    this.isUpdate = permissionModel.IsUpdate;
    this.isDelete = permissionModel.IsDelete;
  }

  // ============================================================
  // FORM SETUP
  // ============================================================
  initializeForm(): void {
    this.settingsForm = this.formBuilder.group({
      id: [null],
      attendanceSource: [1, Validators.required], // 1 manual, 2 biometric
      biometricProvider: [null],
      biometricConnectionString: [''],
      biometricSourceObject: [''],
      officeStartTime: ['08:30'],
      officeEndTime: ['17:30'],
      gracePeriodMinutes: [15],
      weeklyOffDays: ['5,6'],
      annualLeaveDays: [22],
      sickLeaveDays: [10],
      casualLeaveDays: [5],
      autoProcessTime: ['23:30'],
      autoProcessEnabled: [false],
      // biometric attendance (mobile app / door terminal)
      timeZoneId: ['Asia/Dubai'],
      attendanceDayCutoffTime: ['04:00'],
      minMinutesBetweenInOut: [30],
      duplicatePunchMinutes: [1],
      mobileAttendanceEnabled: [true],
      requireOfficeNetwork: [true],
      isActive: [true],
      isHardDelete: [true],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  // ============================================================
  // LOAD / SAVE SETTINGS
  // ============================================================
  loadSettings(): void {
    this.loadingService.setLoading(true);
    this.hrService.getHRSettings().subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success && response.result) {
          const s = response.result as HRSettings;
          this.settingsForm.patchValue({
            id: s.id,
            attendanceSource: s.attendanceSource ?? 1,
            biometricProvider: s.biometricProvider ?? null,
            biometricConnectionString: s.biometricConnectionString ?? '',
            biometricSourceObject: s.biometricSourceObject ?? '',
            officeStartTime: s.officeStartTime ?? '08:30',
            officeEndTime: s.officeEndTime ?? '17:30',
            gracePeriodMinutes: s.gracePeriodMinutes ?? 15,
            weeklyOffDays: s.weeklyOffDays ?? '5,6',
            annualLeaveDays: s.annualLeaveDays ?? 22,
            sickLeaveDays: s.sickLeaveDays ?? 10,
            casualLeaveDays: s.casualLeaveDays ?? 5,
            autoProcessTime: s.autoProcessTime ?? '23:30',
            autoProcessEnabled: s.autoProcessEnabled ?? false,
            timeZoneId: s.timeZoneId ?? 'Asia/Dubai',
            attendanceDayCutoffTime: s.attendanceDayCutoffTime ?? '04:00',
            minMinutesBetweenInOut: s.minMinutesBetweenInOut ?? 30,
            duplicatePunchMinutes: s.duplicatePunchMinutes ?? 1,
            mobileAttendanceEnabled: s.mobileAttendanceEnabled ?? true,
            requireOfficeNetwork: s.requireOfficeNetwork ?? true,
            isActive: s.isActive ?? true,
            isHardDelete: s.isHardDelete ?? true,
            createUpdateBy: this.appUserProfileId,
          });
        }
        // If the response isn't successful we just keep the form defaults —
        // matches the "no settings yet, render empty form" behaviour of the
        // original component.
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        this.error_message = error?.error;
        this.notifyService.showError(
          isCommonErrorShow
            ? MessageConstants.INTERNAL_ERROR_MEG
            : this.error_message,
          MessageConstants.GENERAL_ERROR_TITLE,
        );
      },
    });
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      this.notifyService.showWarning(
        'Please fix the highlighted fields',
        MessageConstants.GENERAL_WARNING_TITLE,
      );
      return;
    }

    const payload = {
      ...this.settingsForm.value,
      createUpdateBy: this.appUserProfileId,
    };
    this.saving = true;
    this.loadingService.setLoading(true);

    this.hrService.saveUpdateHRSettings(payload).subscribe({
      next: (response: any) => {
        this.saving = false;
        this.loadingService.setLoading(false);
        if (response?.success) {
          this.notifyService.showSuccess(
            response.message || 'Settings saved',
            MessageConstants.GENERAL_SUCCESS_TITLE,
          );
        } else {
          this.notifyService.showWarning(
            response?.message || 'Save failed',
            MessageConstants.GENERAL_WARNING_TITLE,
          );
        }
      },
      error: (error) => {
        this.saving = false;
        this.loadingService.setLoading(false);
        this.error_message = error?.error;
        this.notifyService.showError(
          isCommonErrorShow
            ? MessageConstants.INTERNAL_ERROR_MEG
            : this.error_message,
          MessageConstants.GENERAL_ERROR_TITLE,
        );
      },
    });
  }

  // ============================================================
  // ATTENDANCE EXCEL UPLOAD (shown when attendanceSource = 1)
  // ============================================================
  onFileChange(ev: any): void {
    const f = ev?.target?.files?.[0];
    this.selectedFile = f ?? null;
  }

  uploadAttendance(): void {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.uploadResult = null;
    this.loadingService.setLoading(true);

    this.hrService.uploadAttendanceExcel(this.selectedFile).subscribe({
      next: (response: any) => {
        this.uploading = false;
        this.loadingService.setLoading(false);
        if (response?.success) {
          this.uploadResult = response.result;
          this.notifyService.showSuccess(
            response.message || 'Attendance imported',
            MessageConstants.GENERAL_SUCCESS_TITLE,
          );
        } else {
          this.notifyService.showWarning(
            response?.message || 'Upload failed',
            MessageConstants.GENERAL_WARNING_TITLE,
          );
        }
      },
      error: (error) => {
        this.uploading = false;
        this.loadingService.setLoading(false);
        this.error_message = error?.error;
        this.notifyService.showError(
          isCommonErrorShow
            ? MessageConstants.INTERNAL_ERROR_MEG
            : this.error_message,
          MessageConstants.GENERAL_ERROR_TITLE,
        );
      },
    });
  }

  // Convenience getter for the template — keeps the *ngIf legible.
  get attendanceSource(): number {
    return +this.settingsForm.get('attendanceSource')?.value || 1;
  }
}
