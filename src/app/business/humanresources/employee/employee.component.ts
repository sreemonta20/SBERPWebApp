// import {
//   AfterViewInit,
//   Component,
//   Inject,
//   OnInit,
//   ViewChild,
// } from '@angular/core';
// import { Router } from '@angular/router';

// import { User } from '@app/core/class';
// import { MessageConstants } from '@app/core/constants';
// import {
//   CommonService,
//   LoaderService,
//   NotificationService,
//   HumanResourcesService,
// } from '@app/core/services';
// import {
//   EmployeeListItem,
//   EmployeeDetail,
//   EmployeeRequest,
//   EmployeeInitialData,
//   EmployeeAddress,
//   EmployeeBank,
//   PagingSearchFilter,
// } from '@app/core/interface/common';
// import { isCommonErrorShow } from '@environments/environment';
// import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

// @Component({
//   selector: 'app-employee',
//   standalone: false,
//   templateUrl: './employee.component.html',
//   styleUrls: ['./employee.component.css'],
// })
// export class EmployeeComponent implements OnInit, AfterViewInit {
//   // Current user
//   public appUserProfileId: string = '';

//   // Permission
//   public isView = false;
//   public isCreate = false;
//   public isUpdate = false;
//   public isDelete = false;
//   public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

//   // View mode
//   public viewMode: 'list' | 'form' = 'list';
//   public isEdit: boolean = false;

//   // Pagination (list)
//   public totalRows: number = 0;
//   public currentPage: number = 1;
//   public pageSize: number = 10;
//   public pageCount: number = 0;
//   public startPage: number = 1;
//   public endPage: number = 0;
//   public pageSizeList: number[] = this.commonService.pageSize();

//   // List data
//   public employeeList: EmployeeListItem[] = [];
//   public searchTerm: string = '';

//   // Form data
//   public model: EmployeeDetail = this.emptyEmployee();
//   public initial: EmployeeInitialData | null = null;
//   public saving: boolean = false;

//   // Tabs
//   public tabs: string[] = [
//     'Personal',
//     'Employment',
//     'Contact & Address',
//     'Education',
//     'Experience',
//     'Skills',
//     'Training & Certs',
//     'Documents',
//     'Bank',
//     'Emergency',
//   ];
//   public activeTab: number = 0;

//   // Delete confirm
//   public deleteConfirmationMessage: string = '';
//   private pendingDeleteId: string = '';

//   public error_message: any;
//   public dateFormat: string = '';

//   @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

//   constructor(
//     public router: Router,
//     private hrService: HumanResourcesService,
//     private notifyService: NotificationService,
//     private loadingService: LoaderService,
//     private commonService: CommonService,
//   ) {}

//   ngOnInit(): void {
//     this.dateFormat = this.commonService.getDateFormat();
//     this.commonService.GetLoggedInUser().subscribe((user: User) => {
//       this.appUserProfileId = user?.Id || '';
//     });
//     this.loadPermission(this.router.url);
//     this.loadEmployeesPaging();
//   }

//   ngAfterViewInit(): void {}

//   loadPermission(url: any): void {
//     const permissionModel = this.commonService.getMenuPermission(url);
//     this.isView = permissionModel.IsView;
//     this.isCreate = permissionModel.IsCreate;
//     this.isUpdate = permissionModel.IsUpdate;
//     this.isDelete = permissionModel.IsDelete;
//   }

//   // ============================================================
//   // LIST OPERATIONS
//   // ============================================================
//   loadEmployeesPaging(): void {
//     this.loadingService.setLoading(true);
//     const filter: PagingSearchFilter = {
//       SearchTerm: this.searchTerm,
//       SortColumnName: 'EmployeeCode',
//       SortColumnDirection: 'asc',
//       PageNumber: this.currentPage,
//       PageSize: this.pageSize,
//     };

//     this.hrService.getAllEmployeesPagingWithSearch(filter as any).subscribe({
//       next: (response: any) => {
//         this.loadingService.setLoading(false);
//         if (response?.success && response.result) {
//           this.employeeList = response.result.items || [];
//           this.totalRows = response.result.rowCount || 0;
//           this.pageCount = response.result.pageCount || 0;
//           this.currentPage = response.result.currentPage || this.currentPage;
//           this.updatePageIndices();
//         } else {
//           this.employeeList = [];
//           this.totalRows = 0;
//           this.pageCount = 0;
//         }
//       },
//       error: (error) => {
//         this.loadingService.setLoading(false);
//         this.error_message = error?.error;
//         this.notifyService.showError(
//           isCommonErrorShow
//             ? MessageConstants.INTERNAL_ERROR_MEG
//             : this.error_message,
//           MessageConstants.GENERAL_ERROR_TITLE,
//         );
//       },
//     });
//   }

//   changePage(page: number): void {
//     if (page >= 1 && page <= this.pageCount) {
//       this.currentPage = page;
//       this.loadEmployeesPaging();
//     }
//   }

//   changePageSize(event: any): void {
//     this.pageSize = +event.target.value;
//     this.currentPage = 1;
//     this.loadEmployeesPaging();
//   }

//   searchEmployees(): void {
//     this.currentPage = 1;
//     this.loadEmployeesPaging();
//   }

//   updatePageIndices(): void {
//     this.startPage = (this.currentPage - 1) * this.pageSize + 1;
//     this.endPage = this.startPage - 1 + this.employeeList.length;
//   }

//   // ============================================================
//   // FORM OPEN / LOAD
//   // ============================================================
//   openCreateForm(): void {
//     if (!this.isCreate) return;
//     this.isEdit = false;
//     this.activeTab = 0;
//     this.model = this.emptyEmployee();
//     this.loadInitialData(/* newEmployee = */ true);
//     this.viewMode = 'form';
//   }

//   editEmployee(e: EmployeeListItem): void {
//     if (!this.isUpdate || !e?.id) return;
//     this.isEdit = true;
//     this.activeTab = 0;
//     this.loadInitialData(false);

//     this.loadingService.setLoading(true);
//     this.hrService.getEmployeeById(e.id).subscribe({
//       next: (response: any) => {
//         this.loadingService.setLoading(false);
//         if (response?.success && response.result) {
//           const detail = response.result as EmployeeDetail;
//           // Make sure all the array fields exist so the tabs render cleanly.
//           detail.dateOfBirth = this.commonService.toDateInput(
//             detail.dateOfBirth,
//           );
//           detail.passportExpiryDate = this.commonService.toDateInput(
//             detail.passportExpiryDate,
//           );
//           detail.dateOfJoining = this.commonService.toDateInput(
//             detail.dateOfJoining,
//           );
//           detail.probationEndDate = this.commonService.toDateInput(
//             detail.probationEndDate,
//           );
//           detail.confirmationDate = this.commonService.toDateInput(
//             detail.confirmationDate,
//           );
//           detail.dateOfLeaving = this.commonService.toDateInput(
//             detail.dateOfLeaving,
//           );

//           detail.experiences?.forEach((x) => {
//             x.startDate = this.commonService.toDateInput(x.startDate);
//             x.endDate = this.commonService.toDateInput(x.endDate);
//           });
//           detail.trainings?.forEach((t) => {
//             t.startDate = this.commonService.toDateInput(t.startDate);
//             t.endDate = this.commonService.toDateInput(t.endDate);
//           });
//           detail.certifications?.forEach((c) => {
//             c.issueDate = this.commonService.toDateInput(c.issueDate);
//             c.expiryDate = this.commonService.toDateInput(c.expiryDate);
//           });
//           detail.documents?.forEach((d) => {
//             d.issueDate = this.commonService.toDateInput(d.issueDate);
//             d.expiryDate = this.commonService.toDateInput(d.expiryDate);
//           });
//           detail.addresses ||= [];
//           detail.educations ||= [];
//           detail.experiences ||= [];
//           detail.skills ||= [];
//           detail.trainings ||= [];
//           detail.certifications ||= [];
//           detail.documents ||= [];
//           detail.emergencyContacts ||= [];
//           detail.bankInfo ||= {} as EmployeeBank;
//           debugger
//           this.model = detail;
//           this.viewMode = 'form';
//         } else {
//           this.notifyService.showWarning(
//             response?.message || 'Employee not found',
//             MessageConstants.GENERAL_WARNING_TITLE,
//           );
//         }
//       },
//       error: (error) => {
//         this.loadingService.setLoading(false);
//         this.error_message = error?.error;
//         this.notifyService.showError(
//           isCommonErrorShow
//             ? MessageConstants.INTERNAL_ERROR_MEG
//             : this.error_message,
//           MessageConstants.GENERAL_ERROR_TITLE,
//         );
//       },
//     });
//   }

//   loadInitialData(newEmployee: boolean): void {
//     this.hrService.getEmployeeInitialData().subscribe({
//       next: (response: any) => {
//         if (response?.success && response.result) {
//           this.initial = response.result as EmployeeInitialData;
//           if (newEmployee && this.initial?.nextEmployeeCode) {
//             this.model.employeeCode = this.initial.nextEmployeeCode;
//           }
//         }
//       },
//       error: () => {
//         /* dropdowns are non-fatal */
//       },
//     });
//   }

//   cancelForm(): void {
//     this.viewMode = 'list';
//     this.isEdit = false;
//     this.activeTab = 0;
//   }

//   // ============================================================
//   // SAVE
//   // ============================================================
//   saveEmployee(): void {
//     if (
//       !this.model.employeeCode ||
//       !this.model.firstName ||
//       !this.model.lastName
//     ) {
//       this.notifyService.showWarning(
//         'Employee Code, First Name, and Last Name are required',
//         MessageConstants.GENERAL_WARNING_TITLE,
//       );
//       this.activeTab = 0;
//       return;
//     }

//     const payload: EmployeeRequest = {
//       ...this.model,
//       dateOfBirth: this.commonService.toSaveDate(this.model.dateOfBirth),
//       passportExpiryDate: this.commonService.toSaveDate(
//         this.model.passportExpiryDate,
//       ),
//       dateOfJoining: this.commonService.toSaveDate(this.model.dateOfJoining),
//       probationEndDate: this.commonService.toSaveDate(
//         this.model.probationEndDate,
//       ),
//       confirmationDate: this.commonService.toSaveDate(
//         this.model.confirmationDate,
//       ),
//       dateOfLeaving: this.commonService.toSaveDate(this.model.dateOfLeaving),
//       actionName: this.isEdit ? 'Update' : 'Save',
//       createUpdateBy: this.appUserProfileId,
//     } as EmployeeRequest;

//     this.saving = true;
//     this.loadingService.setLoading(true);

//     const obs = this.isEdit
//       ? this.hrService.updateEmployee(payload as any)
//       : this.hrService.createEmployee(payload as any);

//     obs.subscribe({
//       next: (response: any) => {
//         this.saving = false;
//         this.loadingService.setLoading(false);
//         if (response?.success) {
//           this.notifyService.showSuccess(
//             response.message || 'Employee saved',
//             MessageConstants.GENERAL_SUCCESS_TITLE,
//           );
//           this.viewMode = 'list';
//           this.isEdit = false;
//           this.loadEmployeesPaging();
//         } else {
//           this.notifyService.showWarning(
//             response?.message || 'Save failed',
//             MessageConstants.GENERAL_WARNING_TITLE,
//           );
//         }
//       },
//       error: (error) => {
//         this.saving = false;
//         this.loadingService.setLoading(false);
//         this.error_message = error?.error;
//         this.notifyService.showError(
//           isCommonErrorShow
//             ? MessageConstants.INTERNAL_ERROR_MEG
//             : this.error_message,
//           MessageConstants.GENERAL_ERROR_TITLE,
//         );
//       },
//     });
//   }

//   // ============================================================
//   // DELETE
//   // ============================================================
//   deleteEmployee(e: EmployeeListItem): void {
//     if (!this.isDelete || !e?.id) return;
//     this.pendingDeleteId = e.id;
//     this.deleteConfirmationMessage = `${e.fullName} will be inactivated and marked Resigned. Continue?`;
//     this.confirmDialog?.open();
//   }

//   executeDelete(): void {
//     if (!this.pendingDeleteId) return;
//     this.loadingService.setLoading(true);
//     this.hrService.deleteEmployee(this.pendingDeleteId).subscribe({
//       next: (response: any) => {
//         this.loadingService.setLoading(false);
//         if (response?.success) {
//           this.notifyService.showSuccess(
//             response.message || 'Employee removed',
//             MessageConstants.GENERAL_SUCCESS_TITLE,
//           );
//           this.loadEmployeesPaging();
//         } else {
//           this.notifyService.showWarning(
//             response?.message || 'Remove failed',
//             MessageConstants.GENERAL_WARNING_TITLE,
//           );
//         }
//         this.pendingDeleteId = '';
//       },
//       error: (error) => {
//         this.loadingService.setLoading(false);
//         this.error_message = error?.error;
//         this.notifyService.showError(
//           isCommonErrorShow
//             ? MessageConstants.INTERNAL_ERROR_MEG
//             : this.error_message,
//           MessageConstants.GENERAL_ERROR_TITLE,
//         );
//         this.pendingDeleteId = '';
//       },
//     });
//   }

//   // ============================================================
//   // NESTED-ARRAY HELPERS — keep the template simple
//   // ============================================================
//   addAddress(): void {
//     (this.model.addresses ||= []).push({
//       addressType: 1,
//       isActive: true,
//     } as EmployeeAddress);
//   }
//   addEducation(): void {
//     (this.model.educations ||= []).push({ isActive: true });
//   }
//   addExperience(): void {
//     (this.model.experiences ||= []).push({ isActive: true });
//   }
//   addSkill(): void {
//     (this.model.skills ||= []).push({ isActive: true });
//   }
//   addTraining(): void {
//     (this.model.trainings ||= []).push({ isActive: true });
//   }
//   addCertification(): void {
//     (this.model.certifications ||= []).push({ isActive: true });
//   }
//   addDocument(): void {
//     (this.model.documents ||= []).push({ isActive: true });
//   }
//   addEmergency(): void {
//     (this.model.emergencyContacts ||= []).push({ isActive: true });
//   }

//   removeAt(prop: keyof EmployeeDetail, index: number): void {
//     const arr = this.model[prop] as unknown as any[];
//     if (Array.isArray(arr)) arr.splice(index, 1);
//   }

//   // Pretty-print employment status badge color in the list
//   statusBadgeClass(status?: number): string {
//     if (status === 1) return 'badge-success';
//     if (status === 2) return 'badge-warning';
//     return 'badge-secondary';
//   }

//   // Fresh employee skeleton — arrays initialised so *ngFor works.
//   private emptyEmployee(): EmployeeDetail {
//     return {
//       employeeCode: '',
//       firstName: '',
//       lastName: '',
//       employmentStatus: 1,
//       isActive: true,
//       addresses: [],
//       educations: [],
//       experiences: [],
//       skills: [],
//       trainings: [],
//       certifications: [],
//       documents: [],
//       emergencyContacts: [],
//       bankInfo: {} as EmployeeBank,
//     };
//   }
// }

import {
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import {
  CommonService,
  LoaderService,
  NotificationService,
  HumanResourcesService,
} from '@app/core/services';
import {
  EmployeeListItem,
  EmployeeDetail,
  EmployeeRequest,
  EmployeeInitialData,
  EmployeeAddress,
  EmployeeBank,
  PagingSearchFilter,
  BranchLookupItem,
} from '@app/core/interface/common';
import { isCommonErrorShow } from '@environments/environment';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import {
  DEFAULT_AVATAR_URL,
  PHOTO_ACCEPT,
  PHOTO_MAX_SIZE_KB,
  PhotoResult,
  PhotoService,
} from '@app/core/services/photo.service';
import { Observable, Subscription, catchError, of } from 'rxjs';

@Component({
  selector: 'app-employee',
  standalone: false,
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeComponent implements OnInit, AfterViewInit, OnDestroy {
  // Current user
  public appUserProfileId: string = '';

  // Permission
  public isView = false;
  public isCreate = false;
  public isUpdate = false;
  public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  // View mode
  public viewMode: 'list' | 'form' = 'list';
  public isEdit: boolean = false;

  // Pagination (list)
  public totalRows: number = 0;
  public currentPage: number = 1;
  public pageSize: number = 10;
  public pageCount: number = 0;
  public startPage: number = 1;
  public endPage: number = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  // List data
  public employeeList: EmployeeListItem[] = [];
  public searchTerm: string = '';

  // Form data
  public model: EmployeeDetail = this.emptyEmployee();
  public initial: EmployeeInitialData | null = null;
  public saving: boolean = false;

  // Tabs
  public tabs: string[] = [
    'Personal',
    'Employment',
    'Contact & Address',
    'Education',
    'Experience',
    'Skills',
    'Training & Certs',
    'Documents',
    'Bank',
    'Emergency',
  ];
  public activeTab: number = 0;

  // Delete confirm
  public deleteConfirmationMessage: string = '';
  private pendingDeleteId: string = '';

  public error_message: any;
  public dateFormat: string = '';

  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  // Employee photo (optional). 'pending' / 'remove' are applied after the employee is saved.
  public photoAccept = PHOTO_ACCEPT;
  public photoMaxSizeMB = PHOTO_MAX_SIZE_KB / 1024;
  public photoPreviewUrl: string = DEFAULT_AVATAR_URL;
  public photoStatus: 'none' | 'uploaded' | 'pending' | 'remove' = 'none';
  private photoFile: File | null = null;
  private savedPhotoUrl: string = DEFAULT_AVATAR_URL;
  private localPreviewUrl: string | null = null;
  private photoLoad?: Subscription;

  constructor(
    public router: Router,
    private hrService: HumanResourcesService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
    private photoService: PhotoService,
  ) {}

  ngOnInit(): void {
    this.dateFormat = this.commonService.getDateFormat();
    this.commonService.GetLoggedInUser().subscribe((user: User) => {
      this.appUserProfileId = user?.Id || '';
    });
    this.loadPermission(this.router.url);
    this.loadEmployeesPaging();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.clearPhotoState();
  }

  loadPermission(url: any): void {
    const permissionModel = this.commonService.getMenuPermission(url);
    this.isView = permissionModel.IsView;
    this.isCreate = permissionModel.IsCreate;
    this.isUpdate = permissionModel.IsUpdate;
    this.isDelete = permissionModel.IsDelete;
  }

  // ============================================================
  // LIST OPERATIONS
  // ============================================================
  loadEmployeesPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm,
      SortColumnName: 'EmployeeCode',
      SortColumnDirection: 'asc',
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
    };

    this.hrService.getAllEmployeesPagingWithSearch(filter as any).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success && response.result) {
          this.employeeList = response.result.items || [];
          this.totalRows = response.result.rowCount || 0;
          this.pageCount = response.result.pageCount || 0;
          this.currentPage = response.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else {
          this.employeeList = [];
          this.totalRows = 0;
          this.pageCount = 0;
        }
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

  changePage(page: number): void {
    if (page >= 1 && page <= this.pageCount) {
      this.currentPage = page;
      this.loadEmployeesPaging();
    }
  }

  changePageSize(event: any): void {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
    this.loadEmployeesPaging();
  }

  searchEmployees(): void {
    this.currentPage = 1;
    this.loadEmployeesPaging();
  }

  updatePageIndices(): void {
    this.startPage = (this.currentPage - 1) * this.pageSize + 1;
    this.endPage = this.startPage - 1 + this.employeeList.length;
  }

  // ============================================================
  // FORM OPEN / LOAD
  // ============================================================
  openCreateForm(): void {
    if (!this.isCreate) return;
    this.isEdit = false;
    this.activeTab = 0;
    this.model = this.emptyEmployee();
    this.clearPhotoState();
    this.loadInitialData(/* newEmployee = */ true);
    this.viewMode = 'form';
  }

  editEmployee(e: EmployeeListItem): void {
    if (!this.isUpdate || !e?.id) return;
    this.isEdit = true;
    this.activeTab = 0;
    this.loadInitialData(false);

    this.loadingService.setLoading(true);
    this.hrService.getEmployeeById(e.id).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success && response.result) {
          const detail = response.result as EmployeeDetail;
          // Make sure all the array fields exist so the tabs render cleanly.
          detail.dateOfBirth = this.commonService.toDateInput(
            detail.dateOfBirth,
          );
          detail.passportExpiryDate = this.commonService.toDateInput(
            detail.passportExpiryDate,
          );
          detail.dateOfJoining = this.commonService.toDateInput(
            detail.dateOfJoining,
          );
          detail.probationEndDate = this.commonService.toDateInput(
            detail.probationEndDate,
          );
          detail.confirmationDate = this.commonService.toDateInput(
            detail.confirmationDate,
          );
          detail.dateOfLeaving = this.commonService.toDateInput(
            detail.dateOfLeaving,
          );

          detail.experiences?.forEach((x) => {
            x.startDate = this.commonService.toDateInput(x.startDate);
            x.endDate = this.commonService.toDateInput(x.endDate);
          });
          detail.trainings?.forEach((t) => {
            t.startDate = this.commonService.toDateInput(t.startDate);
            t.endDate = this.commonService.toDateInput(t.endDate);
          });
          detail.certifications?.forEach((c) => {
            c.issueDate = this.commonService.toDateInput(c.issueDate);
            c.expiryDate = this.commonService.toDateInput(c.expiryDate);
          });
          detail.documents?.forEach((d) => {
            d.issueDate = this.commonService.toDateInput(d.issueDate);
            d.expiryDate = this.commonService.toDateInput(d.expiryDate);
          });
          detail.addresses ||= [];
          detail.educations ||= [];
          detail.experiences ||= [];
          detail.skills ||= [];
          detail.trainings ||= [];
          detail.certifications ||= [];
          detail.documents ||= [];
          detail.emergencyContacts ||= [];
          detail.bankInfo ||= {} as EmployeeBank;
          this.model = detail;
          this.showSavedPhoto(detail.id, detail.photoId);
          this.viewMode = 'form';
        } else {
          this.notifyService.showWarning(
            response?.message || 'Employee not found',
            MessageConstants.GENERAL_WARNING_TITLE,
          );
        }
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

  loadInitialData(newEmployee: boolean): void {
    this.hrService.getEmployeeInitialData().subscribe({
      next: (response: any) => {
        if (response?.success && response.result) {
          this.initial = response.result as EmployeeInitialData;
          if (newEmployee && this.initial?.nextEmployeeCode) {
            this.model.employeeCode = this.initial.nextEmployeeCode;
          }
          // Convenience: most orgs run a single company, so pre-select it
          // rather than forcing an extra click every time. Still overridable,
          // and still validated as required on save either way.
          if (newEmployee && !this.model.companyId && this.initial?.companies?.length === 1) {
            this.model.companyId = this.initial.companies[0].id;
          }
        }
      },
      error: () => {
        /* dropdowns are non-fatal */
      },
    });
  }

  /** Branches belonging to the currently-selected Company. All branches are
   *  already loaded via EmployeeInitialData — this is a client-side filter,
   *  not an API call. */
  filteredBranches(): BranchLookupItem[] {
    if (!this.model.companyId || !this.initial?.branches) return [];
    return this.initial.branches.filter(
      (b) => b.companyId === this.model.companyId,
    );
  }

  /** Company changed — drop a Branch selection that no longer belongs to it. */
  onCompanyChange(): void {
    const stillValid = this.filteredBranches().some(
      (b) => b.id === this.model.branchId,
    );
    if (!stillValid) {
      this.model.branchId = undefined;
    }
  }

  cancelForm(): void {
    this.clearPhotoState();
    this.viewMode = 'list';
    this.isEdit = false;
    this.activeTab = 0;
  }

  // ============================================================
  // SAVE
  // ============================================================
  saveEmployee(): void {
    if (
      !this.model.employeeCode ||
      !this.model.firstName ||
      !this.model.lastName
    ) {
      this.notifyService.showWarning(
        'Employee Code, First Name, and Last Name are required',
        MessageConstants.GENERAL_WARNING_TITLE,
      );
      this.activeTab = 0;
      return;
    }

    if (!this.model.companyId) {
      this.notifyService.showWarning(
        'Company is required',
        MessageConstants.GENERAL_WARNING_TITLE,
      );
      this.activeTab = 1;
      return;
    }

    const payload: EmployeeRequest = {
      ...this.model,
      dateOfBirth: this.commonService.toSaveDate(this.model.dateOfBirth),
      passportExpiryDate: this.commonService.toSaveDate(
        this.model.passportExpiryDate,
      ),
      dateOfJoining: this.commonService.toSaveDate(this.model.dateOfJoining),
      probationEndDate: this.commonService.toSaveDate(
        this.model.probationEndDate,
      ),
      confirmationDate: this.commonService.toSaveDate(
        this.model.confirmationDate,
      ),
      dateOfLeaving: this.commonService.toSaveDate(this.model.dateOfLeaving),
      actionName: this.isEdit ? 'Update' : 'Save',
      createUpdateBy: this.appUserProfileId,
    } as EmployeeRequest;

    this.saving = true;
    this.loadingService.setLoading(true);

    const obs = this.isEdit
      ? this.hrService.updateEmployee(payload as any)
      : this.hrService.createEmployee(payload as any);

    obs.subscribe({
      next: (response: any) => {
        this.saving = false;
        this.loadingService.setLoading(false);
        if (response?.success) {
          this.notifyService.showSuccess(
            response.message || 'Employee saved',
            MessageConstants.GENERAL_SUCCESS_TITLE,
          );
          // create returns the new employee id; then upload / remove the photo
          const savedId: string = (this.isEdit ? this.model.id : response.result) || this.model.id || '';
          this.applyPhotoChange(savedId).subscribe((photoResult) => {
            if (photoResult) {
              photoResult.success
                ? this.notifyService.showSuccess(photoResult.message, MessageConstants.GENERAL_SUCCESS_TITLE)
                : this.notifyService.showWarning(photoResult.message, MessageConstants.GENERAL_WARNING_TITLE);
            }
            this.clearPhotoState();
            this.viewMode = 'list';
            this.isEdit = false;
            this.loadEmployeesPaging();
          });
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
  // PHOTO
  // ============================================================
  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const error = this.photoService.validate(file);
    if (error) {
      this.notifyService.showWarning(error, MessageConstants.GENERAL_WARNING_TITLE);
      return;
    }
    this.revokeLocalPreview();
    this.photoFile = file!;
    this.localPreviewUrl = URL.createObjectURL(file!);
    this.photoPreviewUrl = this.localPreviewUrl;
    this.photoStatus = 'pending';
  }

  removePhoto(): void {
    if (this.photoStatus === 'pending') {
      // drop the chosen file, back to what is saved
      this.revokeLocalPreview();
      this.photoFile = null;
      this.photoPreviewUrl = this.savedPhotoUrl;
      this.photoStatus = this.savedPhotoUrl === DEFAULT_AVATAR_URL ? 'none' : 'uploaded';
      return;
    }
    this.photoPreviewUrl = DEFAULT_AVATAR_URL;
    this.photoStatus = 'remove';
  }

  /** Upload / remove the photo of the saved employee; emits null when there was nothing to do. */
  private applyPhotoChange(employeeId: string): Observable<PhotoResult | null> {
    let action$: Observable<PhotoResult> | null = null;
    if (employeeId && this.photoStatus === 'pending' && this.photoFile) {
      action$ = this.photoService.upload('employee', employeeId, this.photoFile, this.appUserProfileId);
    } else if (employeeId && this.photoStatus === 'remove') {
      action$ = this.photoService.remove('employee', employeeId, this.appUserProfileId);
    }
    if (!action$) {
      return of(null);
    }
    return action$.pipe(
      catchError((error) =>
        of({
          success: false,
          message: error?.error?.message || error?.error?.title || MessageConstants.INTERNAL_ERROR_MEG,
        } as PhotoResult),
      ),
    );
  }

  private showSavedPhoto(employeeId: string | undefined, photoId: string | null | undefined): void {
    this.clearPhotoState();
    if (!employeeId || !photoId) {
      return;
    }
    this.photoLoad = this.photoService.photoUrl('employee', employeeId, photoId).subscribe((url) => {
      this.savedPhotoUrl = url;
      if (this.photoStatus === 'none' || this.photoStatus === 'uploaded') {
        this.photoPreviewUrl = url;
        this.photoStatus = url === DEFAULT_AVATAR_URL ? 'none' : 'uploaded';
      }
    });
  }

  private clearPhotoState(): void {
    this.photoLoad?.unsubscribe();
    this.revokeLocalPreview();
    this.photoFile = null;
    this.savedPhotoUrl = DEFAULT_AVATAR_URL;
    this.photoPreviewUrl = DEFAULT_AVATAR_URL;
    this.photoStatus = 'none';
  }

  private revokeLocalPreview(): void {
    if (this.localPreviewUrl) {
      URL.revokeObjectURL(this.localPreviewUrl);
      this.localPreviewUrl = null;
    }
  }

  // ============================================================
  // DELETE
  // ============================================================
  deleteEmployee(e: EmployeeListItem): void {
    if (!this.isDelete || !e?.id) return;
    this.pendingDeleteId = e.id;
    this.deleteConfirmationMessage = `${e.fullName} will be inactivated and marked Resigned. Continue?`;
    this.confirmDialog?.open();
  }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.loadingService.setLoading(true);
    this.hrService.deleteEmployee(this.pendingDeleteId).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success) {
          this.notifyService.showSuccess(
            response.message || 'Employee removed',
            MessageConstants.GENERAL_SUCCESS_TITLE,
          );
          this.loadEmployeesPaging();
        } else {
          this.notifyService.showWarning(
            response?.message || 'Remove failed',
            MessageConstants.GENERAL_WARNING_TITLE,
          );
        }
        this.pendingDeleteId = '';
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
        this.pendingDeleteId = '';
      },
    });
  }

  // ============================================================
  // NESTED-ARRAY HELPERS — keep the template simple
  // ============================================================
  addAddress(): void {
    (this.model.addresses ||= []).push({
      addressType: 1,
      isActive: true,
    } as EmployeeAddress);
  }
  addEducation(): void {
    (this.model.educations ||= []).push({ isActive: true });
  }
  addExperience(): void {
    (this.model.experiences ||= []).push({ isActive: true });
  }
  addSkill(): void {
    (this.model.skills ||= []).push({ isActive: true });
  }
  addTraining(): void {
    (this.model.trainings ||= []).push({ isActive: true });
  }
  addCertification(): void {
    (this.model.certifications ||= []).push({ isActive: true });
  }
  addDocument(): void {
    (this.model.documents ||= []).push({ isActive: true });
  }
  addEmergency(): void {
    (this.model.emergencyContacts ||= []).push({ isActive: true });
  }

  removeAt(prop: keyof EmployeeDetail, index: number): void {
    const arr = this.model[prop] as unknown as any[];
    if (Array.isArray(arr)) arr.splice(index, 1);
  }

  // Pretty-print employment status badge color in the list
  statusBadgeClass(status?: number): string {
    if (status === 1) return 'badge-success';
    if (status === 2) return 'badge-warning';
    return 'badge-secondary';
  }

  // Fresh employee skeleton — arrays initialised so *ngFor works.
  private emptyEmployee(): EmployeeDetail {
    return {
      employeeCode: '',
      firstName: '',
      lastName: '',
      employmentStatus: 1,
      isActive: true,
      addresses: [],
      educations: [],
      experiences: [],
      skills: [],
      trainings: [],
      certifications: [],
      documents: [],
      emergencyContacts: [],
      bankInfo: {} as EmployeeBank,
    };
  }
}
