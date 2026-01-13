// import { AppUserRole } from './../../../core/class/models/app.user.role';
import { DOCUMENT, DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
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
  AppUserRoleMenuInitialData,
  InitialDataResponse,
  AppUserMenuResponse,
  CustomValidators,
  DataResponse,
  AppUserMenuRequest,
  User,
  PagingResult,
} from '@app/core/class';
import { MessageConstants, Common } from '@app/core/constants';
import { MenuItem } from '@app/core/interface';
import {
  CommonService,
  LoaderService,
  NotificationService,
  SecurityService,
} from '@app/core/services';
import { isCommonErrorShow } from '@environments/environment';
declare var $: any;
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-appusermenu',
  standalone: false,
  templateUrl: './appusermenu.component.html',
  styleUrls: ['./appusermenu.component.css'],
})
export class AppUserMenuComponent implements OnInit, AfterViewInit, OnDestroy {
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
  public appUserMenuList: AppUserMenuResponse[] = [];
  public searchTerm: string = '';
  public sortColumnName: string = '';
  public sortColumnDirection: string = 'ASC'; // ASC or DESC
  public pageNumber: number = 1;
  public pageSize: number = 5;
  public totalRecords: number = 0;
  public totalPages: number = 0;

  // Form Details
  public appUserMenuForm: FormGroup;
  public isEdit: boolean = false;

  // Response related
  public initialDataResponse: InitialDataResponse;
  public cssClassList: { name: string }[] = [];
  public filteredCssClassList: { name: string }[] = [];
  public routeLinkList: { name: string }[] = [];
  public filteredRouteLinkList: { name: string }[] = [];
  public routeLinkClassList: { name: string }[] = [];
  public filteredRouteLinkClassList: { name: string }[] = [];
  public iconList: { name: string }[] = [];
  public filteredIconList: { name: string }[] = [];
  public parentMenuList: AppUserRoleMenuInitialData[] = [];
  public dropdownIconList: { name: string }[] = [];
  public filteredDropdownIconList: { name: string }[] = [];

  public nextMenuSerialNo: number = 0;
  public isSerialNoDisabled: boolean = false;

  public error_message: any;

  // dtMainOptions: DataTables.Settings = {};
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;
  deleteConfirmationMessage =
    MessageConstants.APP_USER_MENU_DELETE_CONFIRMATION_MSG;
  private itemIdToDelete: string | null = null;

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
    this.titleService.setTitle(MessageConstants.APP_USER_MENU_TITLE);
    this.createForm();
    this.initializeFormData();
    this.getAllAppUserMenuPagingWithSearch();
  }

  ngAfterViewInit() {
    // ($('#appUserMenuTable') as any).DataTable({
    //   paging: true,
    //   lengthChange: true,
    //   searching: true,
    //   ordering: true,
    //   responsive: true,
    // });
    // this.getAllAppUserMenuPagingWithSearch();
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

  createForm() {
    this.appUserMenuForm = this.formBuilder.group({
      Id: [null],
      Name: ['', [Validators.required, CustomValidators.englishText(1, 50)]],
      IsHeader: [false],
      IsModule: [false],
      IsComponent: [false],
      CssClass: new FormControl('', Validators.required),
      IsRouteLink: [false],
      RouteLink: new FormControl('', Validators.required),
      RouteLinkClass: new FormControl('', Validators.required),
      Icon: new FormControl('', Validators.required),
      Remark: new FormControl(''),
      ParentId: new FormControl(''),
      DropdownIcon: new FormControl(''),
      SerialNo: new FormControl('', Validators.required),
      CreateUpdateBy: this.appUserProfileId,
      IsActive: [true],
    });
  }

  initializeFormData() {
    try {
      this.securityService.getAppUserRoleMenuInitialData().subscribe({
        next: (response: DataResponse) => {
          if (response.ResponseCode === 200) {
            this.initialDataResponse = response.Result;

            this.initialDataResponse.cssClassList.forEach(
              (item: AppUserRoleMenuInitialData) => {
                if (item.Name) {
                  this.cssClassList.push({ name: item.Name });
                }
              }
            );
            this.filteredCssClassList = [...this.cssClassList];

            this.initialDataResponse.routeLinkList.forEach(
              (item: AppUserRoleMenuInitialData) => {
                if (item.Name) {
                  this.routeLinkList.push({ name: item.Name });
                }
              }
            );
            this.filteredRouteLinkList = [...this.routeLinkList];

            this.initialDataResponse.routeLinkClassList.forEach(
              (item: AppUserRoleMenuInitialData) => {
                if (item.Name) {
                  this.routeLinkClassList.push({ name: item.Name });
                }
              }
            );
            this.filteredRouteLinkClassList = [...this.routeLinkClassList];

            this.initialDataResponse.iconList.forEach(
              (item: AppUserRoleMenuInitialData) => {
                if (item.Name) {
                  this.iconList.push({ name: item.Name });
                }
              }
            );
            this.filteredIconList = [...this.iconList];

            this.parentMenuList = this.initialDataResponse.parentMenuList;

            this.initialDataResponse.dropdownIconList.forEach(
              (item: AppUserRoleMenuInitialData) => {
                if (item.Name) {
                  this.dropdownIconList.push({ name: item.Name });
                }
              }
            );
            this.filteredDropdownIconList = [...this.dropdownIconList];

            if (
              this.commonService.isValid(this.initialDataResponse.nextMenuSlNo)
            ) {
              this.nextMenuSerialNo = this.initialDataResponse.nextMenuSlNo;
              this.appUserMenuForm
                .get('SerialNo')
                .setValue(this.nextMenuSerialNo);
              this.isSerialNoDisabled = true;
            }
          } else {
            this.notifyService.showError(
              MessageConstants.APP_USER_ROLE_MENU_INITIAL_DATA_NOT_FOUND_MEG,
              MessageConstants.GENERAL_ERROR_TITLE
            );
            return;
          }
        },
        error: (error) => {
          this.error_message = error.error;
          this.notifyService.showError(
            isCommonErrorShow
              ? MessageConstants.INTERNAL_ERROR_MEG
              : this.error_message,
            MessageConstants.GENERAL_ERROR_TITLE
          );
          return;
        },
      });
    } catch (error) {
      this.error_message = error.error.message;
      this.notifyService.showError(
        isCommonErrorShow
          ? MessageConstants.INTERNAL_ERROR_MEG
          : this.error_message,
        MessageConstants.GENERAL_ERROR_TITLE
      );
    }
  }

  onCssClassInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredCssClassList = this.cssClassList.filter((cssClass) =>
      cssClass.name.toLowerCase().includes(inputValue)
    );
  }

  onRouteLinkClassInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredRouteLinkClassList = this.routeLinkClassList.filter(
      (routeLinkClass) => routeLinkClass.name.toLowerCase().includes(inputValue)
    );
  }

  onIconInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredIconList = this.iconList.filter((icon) =>
      icon.name.toLowerCase().includes(inputValue)
    );
  }

  onDropdownIconInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredDropdownIconList = this.dropdownIconList.filter(
      (dropdownIcon) => dropdownIcon.name.toLowerCase().includes(inputValue)
    );
  }

  // ===============================================================================================================
  // LIST & PAGINATION
  // ===============================================================================================================
  getAllAppUserMenuPagingWithSearch(): void {
    this.loadingService.setLoading(true);

    this.securityService
      .getAllAppUserMenuPagingWithSearch('', '', '', 1, 1000) // Adjust page size if needed
      .subscribe({
        next: (response: DataResponse | undefined) => {
          this.loadingService.setLoading(false);

          if (response && response.Success && response.Result) {
            const result = response.Result as PagingResult<AppUserMenuResponse>;
            this.appUserMenuList = result.Items || [];

            // Allow Angular time to render rows before initializing DataTables
            setTimeout(() => {
              if (this.dataTable) {
                this.dataTable.destroy(); // Destroy existing instance before re-initializing
              }

              this.dataTable = $('#appUserMenuTable').DataTable({
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

            this.appUserMenuList = [];
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
          this.appUserMenuList = [];
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
  createUpdateAppUserMenu(appUserMenu): void {
    let appUserMenuRequest: AppUserMenuRequest = new AppUserMenuRequest();
    this.loadingService.setLoading(true);
    if (this.appUserMenuForm.invalid) {
      this.loadingService.setLoading(false);
      this.appUserMenuForm.markAllAsTouched();
      return;
    }
    if (!this.isEdit) {
      appUserMenuRequest.ActionName = Common.ACTION_NAME_SAVE;
      appUserMenuRequest.Id = null;
      appUserMenuRequest.Name = appUserMenu['Name'];
      appUserMenuRequest.IsHeader = appUserMenu['IsHeader'];
      appUserMenuRequest.IsModule = appUserMenu['IsModule'];
      appUserMenuRequest.IsComponent = appUserMenu['IsComponent'];
      appUserMenuRequest.CssClass = appUserMenu['CssClass'];
      appUserMenuRequest.IsRouteLink = appUserMenu['IsRouteLink'];
      appUserMenuRequest.RouteLink = appUserMenu['RouteLink'];
      appUserMenuRequest.RouteLinkClass = appUserMenu['RouteLinkClass'];
      appUserMenuRequest.Icon = appUserMenu['Icon'];
      appUserMenuRequest.Remark = appUserMenu['Remark'];
      appUserMenuRequest.ParentId = appUserMenu['ParentId'];
      appUserMenuRequest.DropdownIcon = appUserMenu['DropdownIcon'];
      appUserMenuRequest.SerialNo = appUserMenu['SerialNo'];
      appUserMenuRequest.CreateUpdateBy = appUserMenu['CreateUpdateBy'];
      appUserMenuRequest.IsActive = appUserMenu['IsActive'];
    } else {
      appUserMenuRequest.ActionName = Common.ACTION_NAME_UPDATE;
      appUserMenuRequest.Id = appUserMenu['Id'];
      appUserMenuRequest.Name = appUserMenu['Name'];
      appUserMenuRequest.IsHeader = appUserMenu['IsHeader'];
      appUserMenuRequest.IsModule = appUserMenu['IsModule'];
      appUserMenuRequest.IsComponent = appUserMenu['IsComponent'];
      appUserMenuRequest.CssClass = appUserMenu['CssClass'];
      appUserMenuRequest.IsRouteLink = appUserMenu['IsRouteLink'];
      appUserMenuRequest.RouteLink = appUserMenu['RouteLink'];
      appUserMenuRequest.RouteLinkClass = appUserMenu['RouteLinkClass'];
      appUserMenuRequest.Icon = appUserMenu['Icon'];
      appUserMenuRequest.Remark = appUserMenu['Remark'];
      appUserMenuRequest.ParentId = appUserMenu['ParentId'];
      appUserMenuRequest.DropdownIcon = appUserMenu['DropdownIcon'];
      appUserMenuRequest.SerialNo = appUserMenu['SerialNo'];
      appUserMenuRequest.CreateUpdateBy = appUserMenu['CreateUpdateBy'];
      appUserMenuRequest.IsActive = appUserMenu['IsActive'];
    }

    this.securityService.createUpdateAppUserMenu(appUserMenuRequest).subscribe({
      next: (response: DataResponse) => {
        this.loadingService.setLoading(false);
        if (response.Success) {
          this.notifyService.showSuccess(
            response.Message,
            MessageConstants.GENERAL_SUCCESS_TITLE
          );
          this.getAllAppUserMenuPagingWithSearch();
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

  editAppUserMenu(menu: AppUserMenuResponse): void {
    this.isEdit = true;
    if (!this.commonService.isInvalidObject(menu)) {
      this.appUserMenuForm.patchValue({
        Id: menu.Id,
        Name: menu.Name,
        IsHeader: menu.IsHeader,
        IsModule: menu.IsModule,
        IsComponent: menu.IsComponent,
        CssClass: menu.CssClass,
        IsRouteLink: menu.IsRouteLink,
        RouteLink: menu.RouteLink,
        RouteLinkClass: menu.RouteLinkClass,
        Icon: menu.Icon,
        Remark: menu.Remark,
        ParentId: menu.ParentId,
        DropdownIcon: menu.DropdownIcon,
        SerialNo: menu.SerialNo,
        CreateUpdateBy: this.appUserProfileId,
        IsActive: menu.IsActive,
      });
    } else {
      this.notifyService.showError(
        MessageConstants.APP_USER_MENU_NOT_FOUND_TO_UPDATE_MEG,
        MessageConstants.GENERAL_ERROR_TITLE
      );
    }
  }

  // deleteAppUserMenu(roleId: string): void {
  //   if (confirm(MessageConstants.APP_USER_MENU_DELETE_CONFIRMATION_MSG)) {
  //     this.loadingService.setLoading(true);

  //     this.securityService.deleteAppUserMenu(roleId).subscribe({
  //       next: (response: DataResponse) => {
  //         this.loadingService.setLoading(false);
  //         if (response.Success) {
  //           this.notifyService.showSuccess(
  //             response.Message,
  //             MessageConstants.GENERAL_SUCCESS_TITLE
  //           );
  //           this.getAllAppUserMenuPagingWithSearch();
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

  deleteAppUserMenu(roleId: string): void {
    this.itemIdToDelete = roleId;
    this.confirmDialog.open();
  }

  executeDelete(): void {
    if (!this.itemIdToDelete) return;

    this.loadingService.setLoading(true);

    this.securityService.deleteAppUserMenu(this.itemIdToDelete).subscribe({
      next: (response: DataResponse) => {
        this.loadingService.setLoading(false);
        if (response.Success) {
          this.notifyService.showSuccess(
            response.Message,
            MessageConstants.GENERAL_SUCCESS_TITLE
          );
          // this.dataTable?.ajax.reload(null, false);
          this.getAllAppUserMenuPagingWithSearch();
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

    this.appUserMenuForm = this.formBuilder.group({
      Id: [null],
      Name: ['', [Validators.required, CustomValidators.englishText(1, 50)]],
      IsHeader: [false],
      IsModule: [false],
      IsComponent: [false],
      CssClass: new FormControl('', Validators.required),
      IsRouteLink: [false],
      RouteLink: new FormControl('', Validators.required),
      RouteLinkClass: new FormControl('', Validators.required),
      Icon: new FormControl('', Validators.required),
      Remark: new FormControl(''),
      ParentId: new FormControl(''),
      DropdownIcon: new FormControl(''),
      SerialNo: new FormControl('', Validators.required),
      CreateUpdateBy: this.appUserProfileId,
      IsActive: [true],
    });

    this.appUserMenuForm.reset({
      Id: null,
      Name: '',
      IsHeader: false,
      IsModule: false,
      IsComponent: false,
      CssClass: '',
      IsRouteLink: false,
      RouteLink: '',
      RouteLinkClass: '',
      Icon: '',
      Remark: '',
      ParentId: '',
      DropdownIcon: '',
      SerialNo: '',
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
