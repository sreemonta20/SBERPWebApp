import { DOCUMENT, DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
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
  User,
  CustomValidators,
} from '@app/core/class/index';
import {
  SecurityService,
  NotificationService,
  LoaderService,
  CommonService,
} from '@app/core/services/index';
import { MessageConstants, Common } from '@app/core/constants/index';
import { isCommonErrorShow } from '@environments/environment';
declare var $: any;
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'app-appuserprofile',
  standalone: false,
  templateUrl: './appuserprofile.component.html',
  styleUrls: ['./appuserprofile.component.css'],
})
export class AppUserProfileComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private subscription: Subscription = new Subscription();
  private destroy$: Subject<void> = new Subject<void>();

  // Current User
  public appUserProfileId: string = '';

  // Permission
  public isView = false;
  public isCreate = false;
  public isUpdate = false;
  public isDelete = false;
  public loading: boolean = false;

  // Page display prevention Message
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  // DataTable Properties & Pagination
  public dataTable: any;
  public pageSizeList: number[] = this.commonService.pageSize();
  public profileList: AppUserProfileResponse[] = [];
  public searchTerm: string = '';
  public sortColumnName: string = '';
  public sortColumnDirection: string = 'ASC'; // ASC or DESC
  public pageNumber: number = 1;
  public pageSize: number = 5;
  public totalRecords: number = 0;
  public totalPages: number = 0;

  // Form Details
  public appUserProfileForm: FormGroup;
  public isEdit: boolean = false;

  // Response related
  public initialDataResponse: InitialDataResponse;
  public userRolesList: AppUserRoleMenuInitialData[] = [];

  public error_message: any;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    public router: Router,
    private renderer: Renderer2,
    private loadingService: LoaderService,
    private notifyService: NotificationService,
    private commonService: CommonService,
    private securityService: SecurityService,
    private formBuilder: FormBuilder,
    private titleService: Title
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
    this.getAllAppUserProfilePagingWithSearch();
  }

  ngAfterViewInit() {}

  loadPermission(url: any): void {
    const permissionModel = this.commonService.getMenuPermission(url);
    this.isView = permissionModel.IsView;
    this.isCreate = permissionModel.IsCreate;
    this.isUpdate = permissionModel.IsUpdate;
    this.isDelete = permissionModel.IsDelete;
  }

  //   export class AppUserProfileRegisterRequest {
  //   Id?: string;
  //   FullName?: string;
  //   Address?: string;
  //   Email?: string;
  //   AppUserRoleId?: string;
  //   CreateUpdatedBy?: string;
  //   IsActive?: boolean;
  //   ActionName?: 'SAVE' | 'UPDATE';
  // }
  // ===============================================================================================================
  // FORM & DATA INITIALIZATION
  // ===============================================================================================================
  initializeForm(): void {
    this.appUserProfileForm = this.formBuilder.group({
      Id: [null],
      FullName: ['', Validators.required],
      Address: [''],
      Email: ['', [Validators.required, Validators.email]],
      AppUserRoleId: ['', Validators.required],
      CreateUpdateBy: this.appUserProfileId,
      IsActive: [true],
    });
  }

  // ---------------- INITIAL DATA (ROLE DROPDOWN) ----------------
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
    this.loadingService.setLoading(true);

    this.securityService
      .getAllAppUserProfilePagingWithSearch('', '', '', 1, 1000) // Adjust page size if needed
      .subscribe({
        next: (response: DataResponse | undefined) => {
          this.loadingService.setLoading(false);

          if (response && response.Success && response.Result) {
            const result =
              response.Result as PagingResult<AppUserProfileResponse>;
            this.profileList = result.Items || [];

            // Allow Angular time to render rows before initializing DataTables
            setTimeout(() => {
              if (this.dataTable) {
                this.dataTable.destroy(); // Destroy existing instance before re-initializing
              }

              this.dataTable = $('#appUserProfileTable').DataTable({
                pagingType: 'full_numbers',
                lengthChange: true,
                lengthMenu: this.pageSizeList,
                pageLength: 5,
                ordering: true,
                searching: true,
                responsive: true,
                destroy: true,
              });
            }, 0);
          } else {
            this.error_message =
              response?.Message || MessageConstants.FETCH_DATA_FAILED_MSG;
            this.notifyService.showError(
              this.error_message,
              MessageConstants.GENERAL_ERROR_TITLE
            );

            this.profileList = [];
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
          this.profileList = [];
        },
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
  createUpdateAppUserMenu(appUserProfile): void {
    let appUserProfileRequest: AppUserProfileRegisterRequest =
      new AppUserProfileRegisterRequest();
    this.loadingService.setLoading(true);
    if (this.appUserProfileForm.invalid) {
      this.loadingService.setLoading(false);
      this.appUserProfileForm.markAllAsTouched();
      return;
    }

    if (!this.isEdit) {
      appUserProfileRequest.ActionName = Common.ACTION_NAME_SAVE;
      appUserProfileRequest.Id = null;
      appUserProfileRequest.FullName = appUserProfile['FullName'];
      appUserProfileRequest.Address = appUserProfile['Address'];
      appUserProfileRequest.Email = appUserProfile['Email'];
      appUserProfileRequest.AppUserRoleId = appUserProfile['AppUserRoleId'];
      appUserProfileRequest.CreateUpdateBy = appUserProfile['CreateUpdateBy'];
      appUserProfileRequest.IsActive = appUserProfile['IsActive'];
    } else {
      appUserProfileRequest.ActionName = Common.ACTION_NAME_UPDATE;
      appUserProfileRequest.Id = appUserProfile['Id'];
      appUserProfileRequest.FullName = appUserProfile['FullName'];
      appUserProfileRequest.Address = appUserProfile['Address'];
      appUserProfileRequest.Email = appUserProfile['Email'];
      appUserProfileRequest.AppUserRoleId = appUserProfile['AppUserRoleId'];
      appUserProfileRequest.CreateUpdateBy = appUserProfile['CreateUpdateBy'];
      appUserProfileRequest.IsActive = appUserProfile['IsActive'];
    }

    this.securityService
      .createUpdateAppUserProfile(appUserProfileRequest)
      .subscribe({
        next: (response: DataResponse) => {
          this.loadingService.setLoading(false);
          if (response.Success) {
            this.notifyService.showSuccess(
              response.Message,
              MessageConstants.GENERAL_SUCCESS_TITLE
            );
            this.getAllAppUserProfilePagingWithSearch();
            this.resetForm();
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
      this.appUserProfileForm.patchValue({
        Id: appUserProfile.Id,
        FullName: appUserProfile.FullName,
        Address: appUserProfile.Address,
        Email: appUserProfile.Email,
        AppUserRoleId: appUserProfile.AppUserRoleId,
        CreateUpdateBy: this.appUserProfileId,
        IsActive: appUserProfile.IsActive,
      });
    } else {
      this.notifyService.showError(
        MessageConstants.APP_USER_PROFILE_NOT_FOUND_TO_UPDATE_MEG,
        MessageConstants.GENERAL_ERROR_TITLE
      );
    }
  }

  deleteAppUserProfile(userProfileId: string): void {
    if (confirm(MessageConstants.APP_USER_PROFILE_DELETE_CONFIRMATION_MSG)) {
      this.loadingService.setLoading(true);

      this.securityService.deleteAppUserProfile(userProfileId).subscribe({
        next: (response: DataResponse) => {
          this.loadingService.setLoading(false);
          if (response.Success) {
            this.notifyService.showSuccess(
              response.Message,
              MessageConstants.GENERAL_SUCCESS_TITLE
            );
            this.getAllAppUserProfilePagingWithSearch();
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
  }

  resetForm(): void {
    this.isEdit = false;

    this.appUserProfileForm = this.formBuilder.group({
      Id: [null],
      FullName: [
        '',
        [Validators.required, CustomValidators.englishText(1, 150)],
      ],
      Address: new FormControl('', Validators.required),
      Email: new FormControl('', Validators.required),
      AppUserRoleId: new FormControl('', Validators.required),
      CreateUpdateBy: this.appUserProfileId,
      IsActive: [true],
    });

    this.appUserProfileForm.reset({
      Id: null,
      FullName: '',
      Address: '',
      Email: '',
      AppUserRoleId: '',
      CreateUpdateBy: this.appUserProfileId,
      IsActive: true,
    });
    this.initializeFormData();
  }

  ngOnDestroy(): void {
    // Unsubscribe from the Subject (for takeUntil approach)
    this.destroy$.next();
    this.destroy$.complete();

    // Unsubscribe from any direct subscriptions
    if (this.subscription) {
      this.subscription.unsubscribe(); // Prevent memory leaks
    }

    // Destroy datatable
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}
