import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  AppUserProfileResponse,
  AppUserProfileRegisterRequest,
  PagingResult,
  InitialDataResponse,
  AppUserRoleMenuInitialData,
  DataResponse,
  User
} from '@app/core/class';
import {
  SecurityService,
  NotificationService,
  LoaderService,
  CommonService,
} from '@app/core/services/index';
import { MessageConstants, Common } from '@app/core/constants/index';
import { isCommonErrorShow } from '@environments/environment';
declare var $: any;
import { Subject, Subscription } from 'rxjs';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-appuserprofile',
  standalone: false,
  templateUrl: './appuserprofile.component.html',
  styleUrls: ['./appuserprofile.component.css'],
})
export class AppUserProfileComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  public appUserProfileForm: FormGroup;
  public isEdit: boolean = false;
  public profileList: AppUserProfileResponse[] = [];
  public userRolesList: AppUserRoleMenuInitialData[] = []; //any[] = [];
  public appUserProfileId: string;
  public loading: boolean = false;
  public error_message: string = '';
  private subscription: Subscription;
  destroy$ = new Subject<void>();
  public dataTable: any;
  public isView = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;
  public isCreate = false;
  public isUpdate = false;
  public isDelete = false;

  public pageSizeList: number[] = this.commonService.pageSize();

  public searchTerm: string = '';
  public sortColumnName: string = '';
  public sortColumnDirection: string = 'ASC'; // ASC or DESC
  public pageNumber: number = 1;
  public pageSize: number = 5;
  public totalRecords: number = 0;
  public totalPages: number = 0;

  public initialDataResponse: InitialDataResponse;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;
  deleteConfirmationMessage =
    MessageConstants.APP_USER_PROFILE_DELETE_CONFIRMATION_MSG;
  private itemIdToDelete: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    public router: Router,
    private renderer: Renderer2,
    private securityService: SecurityService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
    private titleService: Title,
    private cdRef: ChangeDetectorRef
  ) {
    this.subscription = this.commonService
      .GetLoggedInUser()
      .subscribe((userInformation: User) => {
        this.appUserProfileId = userInformation.Id;
      });
    this.loadPermission(this.router.url);
  }

  ngOnInit(): void {
    this.titleService.setTitle(MessageConstants.APP_USER_PROFILE_TITLE);
    this.initializeForm();
    this.initializeFormData();
  }

  ngAfterViewInit(): void {
    // $('#userRoleSelect').select2();
    this.getAllAppUserProfilePagingWithSearch();
  }

  loadPermission(url: any): void {
    const permissionModel = this.commonService.getMenuPermission(url);
    this.isView = permissionModel.IsView;
    this.isCreate = permissionModel.IsCreate;
    this.isUpdate = permissionModel.IsUpdate;
    this.isDelete = permissionModel.IsDelete;
  }

  // ===============================================================================================================
  // FORM & DATA INITIALIZATION
  // ===============================================================================================================
  initializeForm(): void {
    this.appUserProfileForm = this.formBuilder.group(
      {
        Id: [null],
        FullName: ['', Validators.required],
        Address: ['', Validators.required],
        Email: ['', Validators.required],
        AppUserRoleId: [null, Validators.required],
        CreateUpdateBy: this.appUserProfileId,
        IsActive: [true],
        UserName: ['', Validators.required],
        Password: [''],
        ConfirmPassword: [''],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('Password')?.value;
    const confirm = g.get('ConfirmPassword')?.value;
    return (password && password === confirm) || !password
      ? null
      : { mismatch: true };
  }

  // =============== INITIAL DATA (ROLE DROPDOWN) ==================
  initializeFormData(): void {
    this.securityService.getAppUserRoleMenuInitialData().subscribe({
      next: (response: DataResponse) => {
        if (response.ResponseCode === 200) {
          this.initialDataResponse = response.Result;
          this.userRolesList = this.initialDataResponse.userRolesList ?? [];
        } else {
          this.notifyService.showError(
            MessageConstants.APP_USER_PROFILE_INITIAL_DATA_NOT_FOUND_MEG,
            MessageConstants.GENERAL_ERROR_TITLE
          );
        }
      },
      error: () => {
        this.notifyService.showError(
          MessageConstants.INTERNAL_ERROR_MEG,
          MessageConstants.GENERAL_ERROR_TITLE
        );
      },
    });
  }

  // ===============================================================================================================
  // LIST & PAGINATION
  // ===============================================================================================================

  getAllAppUserProfilePagingWithSearch(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }

    this.dataTable = $('#appUserProfileTable').DataTable({
      processing: true,
      serverSide: true,
      ajax: (dtParams: any, callback) => {
        const orderColumn = dtParams.order[0];
        const sortColumnIndex = orderColumn ? orderColumn.column : 0;
        const sortDirection = orderColumn
          ? orderColumn.dir.toUpperCase()
          : 'ASC';
        const sortColumnName = dtParams.columns[sortColumnIndex].data || '';
        const searchTerm = dtParams.search.value || '';
        const pageNumber = dtParams.start / dtParams.length + 1;
        const pageSize = dtParams.length;

        this.securityService
          .getAllAppUserProfilePagingWithSearch(
            searchTerm,
            sortColumnName,
            sortDirection,
            pageNumber,
            pageSize
          )
          .subscribe({
            next: (response: DataResponse) => {
              console.log('DataTable Response:', response);
              if (response.ResponseCode === 302) {
                const result =
                  response.Result as PagingResult<AppUserProfileResponse>;
                callback({
                  draw: dtParams.draw,
                  recordsTotal: result.RowCount,
                  recordsFiltered: result.RowCount,
                  data: result.Items,
                });
              } else {
                callback({
                  draw: dtParams.draw,
                  recordsTotal: 0,
                  recordsFiltered: 0,
                  data: [],
                });
                this.notifyService.showError(
                  response.Message || MessageConstants.FETCH_DATA_FAILED_MSG,
                  MessageConstants.GENERAL_ERROR_TITLE
                );
              }
            },
            error: (error) => {
              callback({
                draw: dtParams.draw,
                recordsTotal: 0,
                recordsFiltered: 0,
                data: [],
              });
              this.notifyService.showError(
                isCommonErrorShow
                  ? MessageConstants.INTERNAL_ERROR_MEG
                  : error.error,
                MessageConstants.GENERAL_ERROR_TITLE
              );
            },
          });
      },
      columns: [
        { data: 'FullName' },
        { data: 'Email' },
        { data: 'RoleName' },
        {
          data: 'UserName',
          render: (data) => data || 'N/A',
        },
        {
          data: 'IsActive',
          render: (data, type, row) =>
            `<span class="badge ${
              row.IsActive ? 'badge-success' : 'badge-danger'
            }">${row.IsActive ? 'Yes' : 'No'}</span>`,
        },
        {
          data: null,
          render: (data, type, row) => {
            const editDisabled = this.isUpdate ? '' : 'disabled';
            const deleteDisabled = this.isDelete ? '' : 'disabled';
            return `<div class="btn-group btn-group-sm">
                      <button type="button" class="btn btn-info" ${editDisabled} title="Edit"><i class="fas fa-edit"></i></button>
                      <button type="button" class="btn btn-danger ml-1" ${deleteDisabled} title="Delete"><i class="fas fa-trash"></i></button>
                    </div>`;
          },
          orderable: false,
        },
      ],
      pagingType: 'full_numbers',
      lengthChange: true,
      lengthMenu: this.pageSizeList,
      pageLength: 5,
      ordering: true,
      searching: true,
      responsive: true,
      destroy: true,
    });

    this.dataTable.on('click', '.btn-info', (e) => {
      const tr = $(e.target).closest('tr');
      const row = this.dataTable.row(tr);
      const rowData = row.data();
      this.editAppUserProfile(rowData);
    });

    this.dataTable.on('click', '.btn-danger', (e) => {
      const tr = $(e.target).closest('tr');
      const row = this.dataTable.row(tr);
      const rowData = row.data();
      this.deleteAppUserProfile(rowData.Id);
    });
  }

  loadScripts(urls: string[]) {
    for (const url of urls) {
      const script = this.renderer.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      this.renderer.appendChild(document.body, script);
    }
  }

  // ===============================================================================================================
  // CREATE UPDATE & DELETE
  // ===============================================================================================================
  createUpdateAppUserProfile(formValue: any): void {
    this.loadingService.setLoading(true);
    if (this.appUserProfileForm.invalid) {
      this.loadingService.setLoading(false);
      this.appUserProfileForm.markAllAsTouched();
      return;
    }
    const request: AppUserProfileRegisterRequest = {
      Id: formValue.Id || undefined || null,
      ActionName: this.isEdit
        ? Common.ACTION_NAME_UPDATE
        : Common.ACTION_NAME_SAVE,
      FullName: formValue.FullName,
      Address: formValue.Address,
      Email: formValue.Email,
      AppUserRoleId: formValue.AppUserRoleId,
      CreateUpdateBy: formValue.CreateUpdateBy,
      IsActive: formValue.IsActive,
      UserName: formValue.UserName || undefined,
      Password: formValue.Password || undefined,
      ConfirmPassword: formValue.ConfirmPassword || undefined,
    };

    this.securityService.createUpdateAppUserProfile(request).subscribe({
      next: (response: DataResponse) => {
        this.loadingService.setLoading(false);
        if (response.Success) {
          this.notifyService.showSuccess(
            response.Message,
            MessageConstants.GENERAL_SUCCESS_TITLE
          );
          this.resetForm();
          this.dataTable.ajax.reload(null, false);
        } else {
          this.notifyService.showError(
            response.Message,
            MessageConstants.GENERAL_ERROR_TITLE
          );
        }
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        this.error_message = error.error;
        this.notifyService.showError(
          isCommonErrorShow
            ? MessageConstants.INTERNAL_ERROR_MEG
            : this.error_message,
          MessageConstants.GENERAL_ERROR_TITLE
        );
      },
    });
  }

  editAppUserProfile(appUserProfile: AppUserProfileResponse): void {
    this.isEdit = true;
    if (!this.commonService.isInvalidObject(appUserProfile)) {
      const roleIdLower = appUserProfile.AppUserRoleId
        ? String(appUserProfile.AppUserRoleId).toUpperCase()
        : null;
      this.appUserProfileForm.reset({
        Id: appUserProfile.Id,
        FullName: appUserProfile.FullName ?? '',
        Address: appUserProfile.Address ?? '',
        Email: appUserProfile.Email ?? '',
        AppUserRoleId: roleIdLower,
        CreateUpdateBy: this.appUserProfileId,
        IsActive: appUserProfile.IsActive ?? true,
        UserName: appUserProfile.UserName ?? '',
        Password: '',
        ConfirmPassword: '',
      });
    } else {
      this.notifyService.showError(
        MessageConstants.APP_USER_PROFILE_NOT_FOUND_TO_UPDATE_MEG,
        MessageConstants.GENERAL_ERROR_TITLE
      );
    }
  }

  // deleteAppUserProfile(userProfileId: string): void {
  //   if (confirm(MessageConstants.APP_USER_PROFILE_DELETE_CONFIRMATION_MSG)) {
  //     this.loadingService.setLoading(true);

  //     this.securityService.deleteAppUserProfile(userProfileId).subscribe({
  //       next: (response: DataResponse) => {
  //         this.loadingService.setLoading(false);
  //         if (response.Success) {
  //           this.notifyService.showSuccess(
  //             response.Message,
  //             MessageConstants.GENERAL_SUCCESS_TITLE
  //           );
  //           this.dataTable.ajax.reload(null, false);
  //         } else {
  //           this.notifyService.showError(
  //             response.Message,
  //             MessageConstants.GENERAL_ERROR_TITLE
  //           );
  //         }
  //       },
  //       error: (error) => {
  //         this.loadingService.setLoading(false);
  //         this.error_message = error.error;
  //         this.notifyService.showError(
  //           isCommonErrorShow
  //             ? MessageConstants.INTERNAL_ERROR_MEG
  //             : this.error_message,
  //           MessageConstants.GENERAL_ERROR_TITLE
  //         );
  //       },
  //     });
  //   }
  // }

  deleteAppUserProfile(userProfileId: string): void {
    this.itemIdToDelete = userProfileId;
    this.confirmDialog.open();
  }

  executeDelete(): void {
    if (!this.itemIdToDelete) return;

    this.loadingService.setLoading(true);

    this.securityService.deleteAppUserProfile(this.itemIdToDelete).subscribe({
      next: (response: DataResponse) => {
        this.loadingService.setLoading(false);
        if (response.Success) {
          this.notifyService.showSuccess(
            response.Message,
            MessageConstants.GENERAL_SUCCESS_TITLE
          );
          this.dataTable?.ajax.reload(null, false);
        } else {
          this.notifyService.showError(
            response.Message,
            MessageConstants.GENERAL_ERROR_TITLE
          );
        }
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        this.error_message = error.error;
        this.notifyService.showError(
          isCommonErrorShow
            ? MessageConstants.INTERNAL_ERROR_MEG
            : this.error_message,
          MessageConstants.GENERAL_ERROR_TITLE
        );
      },
      complete: () => {
        this.loadingService.setLoading(false);
        this.itemIdToDelete = null;
      },
    });
  }

  resetForm(): void {
    this.isEdit = false;
    this.appUserProfileForm = this.formBuilder.group(
      {
        Id: [null],
        FullName: ['', Validators.required],
        Address: ['', Validators.required],
        Email: ['', Validators.required],
        AppUserRoleId: [null, Validators.required],
        CreateUpdateBy: this.appUserProfileId,
        IsActive: [true],
        UserName: ['', Validators.required],
        Password: [''],
        ConfirmPassword: [''],
      },
      { validators: this.passwordMatchValidator }
    );
    this.appUserProfileForm.reset({
      Id: null,
      FullName: '',
      Address: '',
      Email: '',
      AppUserRoleId: null,
      CreateUpdateBy: this.appUserProfileId,
      IsActive: true,
      UserName: '',
      Password: '',
      ConfirmPassword: '',
    });
    this.initializeFormData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription) this.subscription.unsubscribe();
    if (this.dataTable) this.dataTable.destroy();
  }
}
