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
import { User } from '@app/core/class';
import { MenuPermission } from '@app/core/class';
import { MessageConstants, SessionConstants } from '@app/core/constants';
import {
  CommonService,
  LoaderService,
  NotificationService,
  SessionStorageService,
  ValidationFormsService,
} from '@app/core/services/index';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, Subscription, filter, take, takeUntil, tap } from 'rxjs';
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

  // Subscription management
  private destroy$ = new Subject<void>();
  private scriptsLoaded: HTMLScriptElement[] = [];
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
  }

  ngOnInit(): void {
    this.titleService.setTitle(MessageConstants.HOME_DASHBOARD_TITLE);
    this.loadUserData();
  }

  ngAfterViewInit() {
    this.loadScripts(['assets/js/pages/dashboard2.js']);
  }

  private loadUserData(): void {
    // Using takeUntil for proper subscription management
    this.commonService
      .GetLoggedInUser()
      .pipe(
        filter((userInformation) => !!userInformation),
        take(1),
        tap((userInformation: User) => {
          console.log('Home-> appUserProfileId: '+userInformation.Id);

          this.appUserProfileId = userInformation.Id;
          // Now that we have the user info, load permissions
          this.loadPermission(this.router.url);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  loadPermission(url: any): void {
    const permissionModel = this.commonService.getMenuPermission(url);
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
      this.scriptsLoaded.push(script);
    }
  }

  cleanupScripts(): void {
    // Remove dynamically added scripts to prevent memory leaks
    this.scriptsLoaded.forEach(script => {
      if (script.parentNode) {
        this.renderer.removeChild(script.parentNode, script);
      }
    });
    this.scriptsLoaded = [];
  }

  ngOnDestroy(): void {
    // Complete the subject to notify all subscriptions to unsubscribe
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up dynamically added scripts
    this.cleanupScripts();
  }
}
