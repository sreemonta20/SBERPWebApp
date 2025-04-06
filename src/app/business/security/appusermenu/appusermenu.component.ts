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
} from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { MenuItem } from '@app/core/interface';
import {
  CommonService,
  LoaderService,
  NotificationService,
  SecurityService,
} from '@app/core/services';
declare var $: any;
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-appusermenu',
  standalone: false,
  templateUrl: './appusermenu.component.html',
  styleUrls: ['./appusermenu.component.css'],
})
export class AppUserMenuComponent implements OnInit, AfterViewInit, OnDestroy {
  // Current User
  public appUserProfileId: string = '';

  // Permission
  public isView = false;
  public isCreate = false;
  public isUpdate = false;
  public isDelete = false;

  //Pagination
  public totalRows: number = 0;
  public currentPage: number = 1;
  public pageSize: number = 5;
  public pageCount: number = 0;
  public startPage: number = 1;
  public endPage: number = 5;
  public pageSizeList: number[] = this.commonService.pageSize();
  public searchTerm: string = '';
  public sortColumnName: string = '';
  public sortColumnDirection: string = 'ASC'; // ASC or DESC

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

  public appUserMenuList: AppUserMenuResponse[] = [];

  nextMenuSerialNo: number = 0;
  isSerialNoDisabled: boolean = false;

  public error_message: any;

  public param = {
    SearchTerm: this.searchTerm,
    SortColumnName: this.sortColumnName,
    SortColumnDirection: this.sortColumnDirection,
    PageNumber: this.currentPage,
    PageSize: this.pageSize,
  };
  private subscription: Subscription = new Subscription();
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
    this.getAllAppUserMenuPagingWithSearch(
      this.searchTerm,
      this.sortColumnName,
      this.sortColumnDirection,
      this.currentPage,
      this.pageSize
    );
  }

  ngAfterViewInit() {}

  loadPermission(url: any): void {
    console.log('Execution from Home');
    const permissionModel = this.commonService.getMenuPermission(url);
    this.isView = permissionModel.IsView;
    this.isCreate = permissionModel.IsCreate;
    this.isUpdate = permissionModel.IsUpdate;
    this.isDelete = permissionModel.IsDelete;
  }

  createForm() {
    this.appUserMenuForm = this.formBuilder.group({
      Id: [null],
      Name: ['', [Validators.required, CustomValidators.englishText(1, 50)]],
      IsHeader: [false],
      IsModule: [false],
      IsComponent: [false],
      CssClass: new FormControl('', Validators.required),
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
            MessageConstants.INTERNAL_ERROR_MEG,
            MessageConstants.GENERAL_ERROR_TITLE
          );
          return;
        },
      });
    } catch (error) {
      this.notifyService.showError(
        error.error.message,
        MessageConstants.GENERAL_ERROR_TITLE
      );
    }
  }

  onCssClassInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredCssClassList = this.cssClassList.filter(cssClass =>
      cssClass.name.toLowerCase().includes(inputValue)
    );
  }

  onRouteLinkClassInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredRouteLinkClassList = this.routeLinkClassList.filter(routeLinkClass =>
      routeLinkClass.name.toLowerCase().includes(inputValue)
    );
  }

  onIconInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredIconList = this.iconList.filter(icon =>
      icon.name.toLowerCase().includes(inputValue)
    );
  }

  onDropdownIconInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredDropdownIconList = this.dropdownIconList.filter(dropdownIcon =>
      dropdownIcon.name.toLowerCase().includes(inputValue)
    );
  }

  ///-----------------------------------------List & Pagination Starts----------------------------------------------
  getAllAppUserMenuPagingWithSearch(
    searchTerm: string,
    sortColumnName: string,
    sortColumnDirection: string,
    pageNumber: number,
    pageSize: number
  ) {
    this.loadingService.setLoading(true);
    this.securityService
      .getAllAppUserMenuPagingWithSearch(
        searchTerm,
        sortColumnName,
        sortColumnDirection,
        pageNumber,
        pageSize
      )
      .subscribe({
        next: (response: DataResponse) => {
          if (response.ResponseCode === 302) {
            this.loadingService.setLoading(false);
            this.appUserMenuList = response.Result.Items;
            this.currentPage = response.Result.CurrentPage;
            this.pageCount = response.Result.PageCount;
            this.totalRows = response.Result.RowCount;
            this.updatePageIndices();
          } else {
            this.loadingService.setLoading(false);
            this.notifyService.showError(
              MessageConstants.APP_USER_MENU_NOT_FOUND_MEG,
              MessageConstants.GENERAL_ERROR_TITLE
            );
            return;
          }
        },
        error: (error) => {
          
          this.loadingService.setLoading(false);
          this.error_message = error.error;
          this.notifyService.showError(
            MessageConstants.INTERNAL_ERROR_MEG,
            MessageConstants.GENERAL_ERROR_TITLE
          );
          return;
        },
      });
  }

  changePageSize(event: any): void {
    this.currentPage = 1;
    this.getAllAppUserMenuPagingWithSearch(
      this.searchTerm,
      this.sortColumnName,
      this.sortColumnDirection,
      this.currentPage,
      this.pageSize
    );
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.pageCount) {
      this.getAllAppUserMenuPagingWithSearch(
        this.searchTerm,
        this.sortColumnName,
        this.sortColumnDirection,
        page,
        this.pageSize
      );
    }
  }

  onSearch(): void {
    this.currentPage = 1;
    this.getAllAppUserMenuPagingWithSearch(
      this.searchTerm,
      this.sortColumnName,
      this.sortColumnDirection,
      this.currentPage,
      this.pageSize
    );
  }

  // Handle sort column click
  changeSort(columnName: string): void {
    if (this.sortColumnName === columnName) {
      this.sortColumnDirection =
        this.sortColumnDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortColumnName = columnName;
      this.sortColumnDirection = 'ASC';
    }
    this.getAllAppUserMenuPagingWithSearch(
      this.searchTerm,
      this.sortColumnName,
      this.sortColumnDirection,
      this.currentPage,
      this.pageSize
    );
  }

  updatePageIndices(): void {
    this.startPage = (this.currentPage - 1) * this.pageSize + 1;
    this.endPage = this.startPage - 1 + this.appUserMenuList.length;
  }

  loadScripts(urls: string[]) {
    for (const url of urls) {
      const script = this.renderer.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      this.renderer.appendChild(document.body, script);
    }
  }
  ///-----------------------------------------List & Pagination Ends----------------------------------------------

  ///-----------------------------------------Create, Update, and Delete Starts-----------------------------------
  createUpdateAppUserMenu(appUserMenu): void {
    let appUserMenuRequest: AppUserMenuRequest = new AppUserMenuRequest();
    this.loadingService.setLoading(true);
    if (this.appUserMenuForm.invalid) {
      this.loadingService.setLoading(false);
      this.appUserMenuForm.markAllAsTouched();
      return;
    }
    if (!this.isEdit) {
      appUserMenuRequest.ActionName = 'Save';
      appUserMenuRequest.Id = null;
      appUserMenuRequest.Name = appUserMenu['Name'];
      appUserMenuRequest.IsHeader = appUserMenu['IsHeader'];
      appUserMenuRequest.IsModule = appUserMenu['IsModule'];
      appUserMenuRequest.IsComponent = appUserMenu['IsComponent'];
      appUserMenuRequest.CssClass = appUserMenu['CssClass'];
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
      appUserMenuRequest.ActionName = 'Update';
      appUserMenuRequest.Id = appUserMenu['Id'];
      appUserMenuRequest.Name = appUserMenu['Name'];
      appUserMenuRequest.IsHeader = appUserMenu['IsHeader'];
      appUserMenuRequest.IsModule = appUserMenu['IsModule'];
      appUserMenuRequest.IsComponent = appUserMenu['IsComponent'];
      appUserMenuRequest.CssClass = appUserMenu['CssClass'];
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
          this.getAllAppUserMenuPagingWithSearch(
            this.searchTerm,
            this.sortColumnName,
            this.sortColumnDirection,
            this.currentPage,
            this.pageSize
          );
          this.resetForm();
        } else {
          this.loadingService.setLoading(false);
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
          MessageConstants.INTERNAL_ERROR_MEG,
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

  deleteAppUserMenu(roleId: string): void {
    if (confirm(MessageConstants.APP_USER_MENU_DELETE_CONFIRMATION_MSG)) {
      this.loadingService.setLoading(true);

      this.securityService.deleteAppUserMenu(roleId).subscribe({
        next: (response: DataResponse) => {
          this.loadingService.setLoading(false);
          if (response.Success) {
            this.notifyService.showSuccess(
              response.Message,
              MessageConstants.GENERAL_SUCCESS_TITLE
            );
            this.getAllAppUserMenuPagingWithSearch(
              this.searchTerm,
              this.sortColumnName,
              this.sortColumnDirection,
              this.currentPage,
              this.pageSize
            );
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
            MessageConstants.INTERNAL_ERROR_MEG,
            MessageConstants.GENERAL_ERROR_TITLE
          );
        },
      });
    }
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
  ///------------------------------------------Create, Update, and Delete Ends-----------------------------------

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe(); // Prevent memory leaks
    }
  }
}
