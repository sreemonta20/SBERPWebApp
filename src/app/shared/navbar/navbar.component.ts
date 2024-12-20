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
import { Router } from '@angular/router';
import { SessionConstants } from '@app/core/constants';
import { MenuItem } from '@app/core/interface';
import { CommonService, SessionStorageService } from '@app/core/services';
declare var $: any;

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  //Menu Related
  isLoggedIn: boolean = false;
  menuList: MenuItem[];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    public router: Router,
    private http: HttpClient,
    private renderer: Renderer2,
    private commonService: CommonService,
    private sessionService: SessionStorageService
  ) {}

  ngOnInit(): void {
    this.initializeMenu();
  }

  ngAfterViewInit() {
    // this.loadScripts(['assets/js/menu.js']);
  }

  loadScripts(urls: string[]) {
    for (const url of urls) {
      const script = this.renderer.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      this.renderer.appendChild(document.body, script);
    }
  }

  initializeMenu() {
    $('[data-widget="treeview"]').Treeview('init');
    // this.commonService.isLoggedIn$.subscribe(
    //   (isLoggedIn) => (this.isLoggedIn = isLoggedIn)
    // );
    this.commonService.userMenus$.subscribe((userMenus) => {
      this.menuList = userMenus;
    });
  }

  signOut(): void {
    this.commonService.RevokeSession();
  }

  // TestClick() {
  //   this.router.navigate(['/business/home']);
  // }

  ngOnDestroy(): void {}
}
