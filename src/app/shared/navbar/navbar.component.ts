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
import { Subscription } from 'rxjs';
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
  menuList: MenuItem[] = [];
  private menuSubscription?: Subscription;
  
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

  initializeMenu(): void {
    this.initTreeview(); // Optional pre-init if needed

    this.menuSubscription = this.commonService.GetUserMenus().subscribe({
      next: (userMenus) => {
        this.menuList = this.commonService.parseMenu(userMenus);
        this.reinitializeTreeview(); // Initialize menu after data
      },
      error: (err) => {
        console.error('Error loading user menus:', err);
        this.menuList = [];
      },
    });
  }

  

  // private parseMenu(userMenus: any): MenuItem[] {
  //   try {
  //     let parsed = userMenus;

  //     // Handle possible double-encoded JSON
  //     if (typeof parsed === 'string') parsed = JSON.parse(parsed);
  //     if (Array.isArray(parsed)) {
  //       console.log('Parsed menu with', parsed.length, 'items');
  //       return parsed;
  //     } else {
  //       console.warn('Menu data is not an array:', parsed);
  //       return [];
  //     }
  //   } catch (error) {
  //     console.error('Failed to parse menu:', error);
  //     return [];
  //   }
  // }

  private initTreeview(): void {
    if ($ && $('[data-widget="treeview"]').length > 0) {
      try {
        $('[data-widget="treeview"]').Treeview('init');
      } catch (e) {
        console.warn('Initial treeview init error (optional):', e);
      }
    }
  }

  private reinitializeTreeview(): void {
    setTimeout(() => {
      if ($ && $('[data-widget="treeview"]').length > 0) {
        try {
          $('[data-widget="treeview"]').Treeview('init');
          console.log('Treeview initialized after loading menu');
        } catch (e) {
          console.error('Error initializing Treeview:', e);
        }
      }
    }, 0);
  }

  signOut(): void {
    this.commonService.RevokeSession();
  }

  ngOnDestroy(): void {
    if (this.menuSubscription) {
      this.menuSubscription.unsubscribe();
    }
  }
}
