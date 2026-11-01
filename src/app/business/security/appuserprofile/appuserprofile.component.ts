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
import { ActivatedRoute, Router } from '@angular/router';
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
import {
  DEFAULT_AVATAR_URL,
  PHOTO_ACCEPT,
  PHOTO_MAX_SIZE_KB,
  PhotoResult,
  PhotoService,
} from '@app/core/services/photo.service';
import { MessageConstants, Common } from '@app/core/constants/index';
import { isCommonErrorShow } from '@environments/environment';
declare var $: any;
import { Observable, Subject, Subscription, of, take } from 'rxjs';
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

  // Profile photo (optional). 'pending' / 'remove' are applied after the profile is saved.
  public photoAccept = PHOTO_ACCEPT;
  public photoMaxSizeMB = PHOTO_MAX_SIZE_KB / 1024;
  public photoPreviewUrl: string = DEFAULT_AVATAR_URL;
  public photoStatus: 'none' | 'uploaded' | 'pending' | 'remove' = 'none';
  public editingEmployeeId: string | null = null;
  private photoFile: File | null = null;
  private savedPhotoUrl: string = DEFAULT_AVATAR_URL;
  private localPreviewUrl: string | null = null;
  private photoLoad?: Subscription;
  /** A user without the Profiles rights, on their own profile: no list, and role and status are locked. */
  isSelfService = false;

  constructor(
    private formBuilder: FormBuilder,
    public router: Router,
    private renderer: Renderer2,
    private securityService: SecurityService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
    private titleService: Title,
    private cdRef: ChangeDetectorRef,
    private photoService: PhotoService,
    private route: ActivatedRoute
  ) {
    this.subscription = this.commonService
      .GetLoggedInUser()
      .subscribe((userInformation: User) => {
        this.appUserProfileId = userInformation.Id;
      });
    this.loadPermission(this.router.url.split('?')[0]);
    if (!this.isUpdate && this.commonService.isOwnProfile(this.route.snapshot.queryParamMap.get('profile'))) {
      this.isSelfService = true;
      this.isView = true;
      this.isUpdate = true;
    }
  }

  ngOnInit(): void {
    this.titleService.setTitle(MessageConstants.APP_USER_PROFILE_TITLE);
    this.initializeForm();
    this.initializeFormData();
  }

  ngAfterViewInit(): void {
    if (!this.isSelfService) {
      this.getAllAppUserProfilePagingWithSearch();
    }
    this.subscription.add(
      this.route.queryParamMap.subscribe((params) => {
        const profileId = params.get('profile');
        if (profileId && this.isView) {
          this.loadAppUserProfileForEdit(profileId);
        }
      })
    );
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
        JobTitle: ['', Validators.maxLength(100)],
        Address: [''],
        Email: ['', [Validators.required, Validators.email]],
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
        {
          data: 'ProfilePhotoId',
          orderable: false,
          searchable: false,
          render: (data, type, row) =>
            `<img src="${DEFAULT_AVATAR_URL}" class="img-circle elevation-1 dt-photo" alt="Photo"
                  data-photo-id="${row.Id}" data-photo-key="${row.ProfilePhotoId ?? ''}">`,
        },
        { data: 'FullName' },
        {
          data: 'JobTitle',
          render: (data) => (data ? $('<div>').text(data).html() : '<span class="text-muted">—</span>'),
        },
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
      order: [[1, 'asc']],
      drawCallback: () => this.loadGridPhotos(),
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
      this.notifyService.showWarning(
        `Please check: ${this.invalidFieldNames().join(', ')}.`,
        MessageConstants.GENERAL_WARNING_TITLE
      );
      return;
    }
    const request: AppUserProfileRegisterRequest = {
      Id: formValue.Id || undefined || null,
      ActionName: this.isEdit
        ? Common.ACTION_NAME_UPDATE
        : Common.ACTION_NAME_SAVE,
      FullName: formValue.FullName,
      JobTitle: formValue.JobTitle?.trim() || null,
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
          const savedId: string = response.Result?.Id || request.Id;
          this.refreshSignedInUser(savedId, request);
          this.applyPhotoChange(savedId).subscribe((photoResult) => {
            if (photoResult) {
              photoResult.success
                ? this.notifyService.showSuccess(photoResult.message, MessageConstants.GENERAL_SUCCESS_TITLE)
                : this.notifyService.showWarning(photoResult.message, MessageConstants.GENERAL_WARNING_TITLE);
            }
            this.resetForm();
            this.dataTable?.ajax.reload(null, false);
          });
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

  /** Human names of the invalid controls (the Save / Update button stays enabled and explains instead). */
  invalidFieldNames(): string[] {
    const labels: { [key: string]: string } = {
      FullName: 'Full Name',
      JobTitle: 'Role Name (max 100 characters)',
      Email: 'Email (a valid address)',
      AppUserRoleId: 'User Role',
      UserName: 'User Name',
    };
    const names = Object.keys(labels).filter((key) => this.appUserProfileForm.get(key)?.invalid).map((key) => labels[key]);
    if (this.appUserProfileForm.hasError('mismatch')) {
      names.push('Password and Confirm Password must match (clear Password to keep the current one)');
    }
    return names;
  }

  /** When the signed-in user edits their own profile, update the session user so the top bar / sidebar follow. */
  private refreshSignedInUser(savedId: string, request: AppUserProfileRegisterRequest): void {
    if (!savedId || String(savedId).toLowerCase() !== String(this.appUserProfileId ?? '').toLowerCase()) {
      return;
    }
    this.commonService
      .GetLoggedInUser()
      .pipe(take(1))
      .subscribe((user: User) => {
        if (user) {
          this.commonService.UpdateLoggedInUser({
            ...user,
            FullName: request.FullName ?? user.FullName,
            Email: request.Email ?? user.Email,
            JobTitle: request.JobTitle ?? undefined,
          });
        }
      });
  }

  editAppUserProfile(appUserProfile: AppUserProfileResponse): void {
    this.isEdit = true;
    if (!this.commonService.isInvalidObject(appUserProfile)) {
      this.showSavedPhoto(appUserProfile);
      const roleIdLower = appUserProfile.AppUserRoleId
        ? String(appUserProfile.AppUserRoleId).toUpperCase()
        : null;
      this.appUserProfileForm.reset({
        Id: appUserProfile.Id,
        FullName: appUserProfile.FullName ?? '',
        JobTitle: appUserProfile.JobTitle ?? '',
        Address: appUserProfile.Address ?? '',
        Email: appUserProfile.Email ?? '',
        AppUserRoleId: roleIdLower,
        CreateUpdateBy: this.appUserProfileId,
        IsActive: appUserProfile.IsActive ?? true,
        UserName: appUserProfile.UserName ?? '',
        Password: '',
        ConfirmPassword: '',
      });
      if (this.isSelfService) {
        // a form control's disabled state must be set on the control: the template attribute is overwritten
        this.appUserProfileForm.get('AppUserRoleId')?.disable();
        this.appUserProfileForm.get('IsActive')?.disable();
      }
    } else {
      this.notifyService.showError(
        MessageConstants.APP_USER_PROFILE_NOT_FOUND_TO_UPDATE_MEG,
        MessageConstants.GENERAL_ERROR_TITLE
      );
    }
  }

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
    this.clearPhotoState();
    this.appUserProfileForm = this.formBuilder.group(
      {
        Id: [null],
        FullName: ['', Validators.required],
        JobTitle: ['', Validators.maxLength(100)],
        Address: [''],
        Email: ['', [Validators.required, Validators.email]],
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
      JobTitle: '',
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
    if (this.isSelfService) {
      this.loadAppUserProfileForEdit(this.appUserProfileId);
    }
  }

  // ===============================================================================================================
  // PROFILE PHOTO
  // ===============================================================================================================

  /** Open a profile in the form by id (Profile link of the top bar card / sidebar). */
  private loadAppUserProfileForEdit(profileId: string): void {
    this.securityService.getAppUserProfileById(profileId).subscribe({
      next: (response: DataResponse) => {
        if (response?.Success && response.Result) {
          const profile: AppUserProfileResponse =
            typeof response.Result === 'string' ? JSON.parse(response.Result) : response.Result;
          this.editAppUserProfile(profile);
        }
      },
      error: () => {
        /* the list is still usable */
      },
    });
  }

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

  /** Upload / remove the photo of the saved profile; emits null when there was nothing to do. */
  private applyPhotoChange(profileId: string): Observable<PhotoResult | null> {
    if (!profileId) {
      return of(null);
    }
    const by = this.appUserProfileId;
    let action$: Observable<PhotoResult> | null = null;
    if (this.photoStatus === 'pending' && this.photoFile) {
      action$ = this.photoService.upload('user', profileId, this.photoFile, by);
    } else if (this.photoStatus === 'remove') {
      action$ = this.photoService.remove('user', profileId, by);
    }
    if (!action$) {
      return of(null);
    }
    return new Observable<PhotoResult | null>((subscriber) => {
      action$!.subscribe({
        next: (result) => subscriber.next(result),
        error: (error) =>
          subscriber.next({
            success: false,
            message: error?.error?.Message || error?.error?.title || MessageConstants.INTERNAL_ERROR_MEG,
          }),
        complete: () => subscriber.complete(),
      });
    });
  }

  private showSavedPhoto(profile: AppUserProfileResponse): void {
    this.clearPhotoState();
    this.editingEmployeeId = profile.EmployeeId ?? null;
    if (!profile.ProfilePhotoId) {
      return;
    }
    this.photoLoad = this.photoService
      .photoUrl('user', profile.Id, profile.ProfilePhotoId)
      .subscribe((url) => {
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
    this.editingEmployeeId = null;
  }

  private revokeLocalPreview(): void {
    if (this.localPreviewUrl) {
      URL.revokeObjectURL(this.localPreviewUrl);
      this.localPreviewUrl = null;
    }
  }

  /** The grid is rendered by DataTables (plain HTML): load each row photo after a draw. */
  private loadGridPhotos(): void {
    $('#appUserProfileTable img.dt-photo[data-photo-key!=""]').each((_: number, img: HTMLImageElement) => {
      const id = img.getAttribute('data-photo-id');
      const key = img.getAttribute('data-photo-key');
      this.photoService
        .photoUrl('user', id, key)
        .pipe(take(1))
        .subscribe((url) => (img.src = url));
    });
  }

  ngOnDestroy(): void {
    this.clearPhotoState();
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription) this.subscription.unsubscribe();
    if (this.dataTable) this.dataTable.destroy();
  }
}
