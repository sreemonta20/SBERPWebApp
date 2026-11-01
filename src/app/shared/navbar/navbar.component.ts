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
import { NavigationEnd, Router } from '@angular/router';
import { SessionConstants } from '@app/core/constants';
import { MenuItem } from '@app/core/interface/common/index';
import { AuthService, CommonService, SessionStorageService, UserCard, UserCardService } from '@app/core/services';
import { Subscription, filter } from 'rxjs';
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
  private routerSubscription?: Subscription;
  private cardSubscription?: Subscription;
  /** Signed-in user's name and photo for the sidebar user panel. */
  card: UserCard;

  /** Ids of the groups (module / sub module) that are expanded. */
  private openMenuIds = new Set<string>();
  /** Ids on the path to the screen of the current route: the screen itself and all its parents. */
  private activeMenuIds = new Set<string>();
  /** Filled by indexMenu() when the menu changes. */
  private groupIds = new Set<string>();
  private linkIds = new Set<string>();
  private visibleHeaderIds = new Set<string>();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    public router: Router,
    private http: HttpClient,
    private renderer: Renderer2,
    private commonService: CommonService,
    private sessionService: SessionStorageService,
    private authService: AuthService,
    private userCardService: UserCardService
  ) {}

  ngOnInit(): void {
    this.cardSubscription = this.userCardService.card$.subscribe((card) => (this.card = card));
    this.initializeMenu();
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.syncWithRoute());
  }

  ngAfterViewInit() {
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
    this.menuSubscription = this.commonService.GetUserMenus().subscribe({
      next: (userMenus) => {
        this.menuList = this.commonService.parseMenu(userMenus);
        this.indexMenu();
        this.syncWithRoute();
      },
      error: (err) => {
        console.error('Error loading user menus:', err);
        this.menuList = [];
      },
    });
  }

  // ===============================================================================================================
  // MENU TREE (any depth: Header > Module > (Sub Module >)* Component)
  // ===============================================================================================================

  trackById(_: number, item: MenuItem): string {
    return item.Id;
  }

  private children(item: MenuItem): MenuItem[] {
    return item?.Children ?? [];
  }

  /**
   * Classifies every menu item once per menu load. The template asks isGroup / isLink /
   * hasVisibleChildren for every item on every change detection; these used to walk the whole
   * subtree recursively each time, now they are Set lookups.
   */
  private indexMenu(): void {
    this.groupIds.clear();
    this.linkIds.clear();
    this.visibleHeaderIds.clear();
    const visit = (item: MenuItem): boolean => {
      const childVisible = this.children(item).map(visit).some(Boolean);
      if (item.IsHeader) {
        if (childVisible) this.visibleHeaderIds.add(item.Id);
        return false;
      }
      if (childVisible) {
        this.groupIds.add(item.Id); // a module / sub module with something to show below it
        return true;
      }
      if (this.children(item).length === 0 && !!item.RouteLink?.trim()) {
        this.linkIds.add(item.Id); // a routed screen, or a module that is a link itself (Dashboard)
        return true;
      }
      return false;
    };
    (this.menuList ?? []).forEach(visit);
  }

  /** A module / sub module that has something to show below it. */
  isGroup(item: MenuItem): boolean {
    return this.groupIds.has(item.Id);
  }

  /** A routed screen: a component, or a module without children that is a link itself (Dashboard). */
  isLink(item: MenuItem): boolean {
    return this.linkIds.has(item.Id);
  }

  /** Headers are only drawn when the user can see at least one item under them. */
  hasVisibleChildren(item: MenuItem): boolean {
    return this.visibleHeaderIds.has(item.Id);
  }

  isOpen(item: MenuItem): boolean {
    return this.openMenuIds.has(item.Id);
  }

  isActive(item: MenuItem): boolean {
    return this.activeMenuIds.has(item.Id);
  }

  itemClass(item: MenuItem): string {
    return item.CssClass?.trim() || 'nav-item';
  }

  /** RouteLinkClass from the DB, minus any stored "active": the router decides what is active. */
  linkClass(item: MenuItem): string {
    const classes = (item.RouteLinkClass ?? '')
      .split(/\s+/)
      .filter((css) => css && css !== 'active');
    return (classes.length ? classes : ['nav-link']).join(' ');
  }

  /**
   * Expand / collapse a group. Opening one closes its open siblings (and everything under them),
   * so only one branch per level stays expanded.
   */
  toggleMenu(item: MenuItem, siblings: MenuItem[] | undefined, event: Event): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement)?.blur();
    if (this.isOpen(item)) {
      this.closeBranch(item);
      return;
    }
    (siblings ?? []).filter((sibling) => sibling.Id !== item.Id).forEach((sibling) => this.closeBranch(sibling));
    this.openMenuIds.add(item.Id);
  }

  /** Drop the focus ring after a click, so a previously clicked item does not look selected. */
  onLinkClick(event: Event): void {
    (event.currentTarget as HTMLElement)?.blur();
  }

  private closeBranch(item: MenuItem): void {
    this.openMenuIds.delete(item.Id);
    this.children(item).forEach((child) => this.closeBranch(child));
  }

  /**
   * Highlight the screen of the current URL and its parents, and keep only that branch open:
   * selecting a screen in one microservice module collapses every other module.
   */
  private syncWithRoute(): void {
    const url = this.router.url.split(/[?#;]/)[0];
    const path = this.findActivePath(this.menuList, url);
    this.activeMenuIds = new Set(path.map((menu) => menu.Id));
    if (path.length) {
      this.openMenuIds = new Set(path.filter((menu) => this.isGroup(menu)).map((menu) => menu.Id));
    }
  }

  /** Path (root → screen) to the screen whose RouteLink is the longest prefix of the URL. */
  private findActivePath(items: MenuItem[], url: string, trail: MenuItem[] = []): MenuItem[] {
    let best: MenuItem[] = [];
    for (const item of items ?? []) {
      const here = item.IsHeader ? trail : [...trail, item];
      const link = item.RouteLink?.trim();
      if (link && (url === link || url.startsWith(link + '/'))) {
        if (!best.length || link.length > (best[best.length - 1].RouteLink?.trim().length ?? 0)) {
          best = here;
        }
      }
      const deeper = this.findActivePath(this.children(item), url, here);
      if (deeper.length) {
        const deeperLink = deeper[deeper.length - 1].RouteLink?.trim() ?? '';
        if (!best.length || deeperLink.length > (best[best.length - 1].RouteLink?.trim().length ?? 0)) {
          best = deeper;
        }
      }
    }
    return best;
  }

  /** Server-side sign out too: clearing the browser alone would leave the refresh token valid. */
  signOut(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    if (this.menuSubscription) {
      this.menuSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.cardSubscription?.unsubscribe();
  }
}
