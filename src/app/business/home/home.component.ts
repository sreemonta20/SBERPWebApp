import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MenuPermission } from '@app/core/class/models/menu.permission';
import { MessageConstants, SessionConstants } from '@app/core/constants';
import {
  CommonService,
  LoaderService,
  NotificationService,
  SessionStorageService,
  ValidationFormsService
} from '@app/core/services/index';
import { NgxSpinnerService } from 'ngx-spinner';
declare var $: any;

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  // Current User
  public appUserProfileId: string = '';

  // Permission
  public isView = false;
  public isCreate = false;
  public isUpdate = false;
  public isDelete = false;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    public router: Router,
    private renderer: Renderer2,
    private loadingService: LoaderService,
    private sessionService: SessionStorageService,
    private notifyService: NotificationService,
    private validationService: ValidationFormsService,
    private spinnerService: NgxSpinnerService,
    private commonService: CommonService,
    private titleService: Title
  ) {
    this.appUserProfileId = this.commonService.GetLoggedInUser().user.Id;
    this.loadPermission(this.router.url);
  }

  ngOnInit(): void {
    this.titleService.setTitle(MessageConstants.HOME_DASHBOARD_TITLE);
  }

  ngAfterViewInit() {
    this.loadScripts(['assets/js/pages/dashboard2.js']);
  }

  loadPermission(url:any):void{
    console.log("Execution from Home");
    const permissionModel  = this.commonService.getMenuPermission(url);
    this.isView = permissionModel.IsView;
    this.isCreate = permissionModel.IsCreate;
    this.isUpdate = permissionModel.IsUpdate;
    this.isDelete = permissionModel.IsDelete;
  }

  loadScripts(urls: string[]) {
    for (const url of urls) {
      const script = this.renderer.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      this.renderer.appendChild(document.body, script);
    }
  }

  ngOnDestroy(): void {
    
  }
}
