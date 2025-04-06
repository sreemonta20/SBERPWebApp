import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { RouterModule, RouterOutlet, NavigationStart, Router  } from '@angular/router';
import { CommonService, SessionStorageService } from './core/services';
import { RouteConstants, SessionConstants } from './core/constants';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isLoding: boolean = false;
  title = 'Web::SB';
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    private http: HttpClient,
    private renderer: Renderer2,
    private router: Router,
    private sessionService: SessionStorageService,
    private commonService: CommonService
  ) {
    
  }

  // ngOnInit() {
  //   this.router.events.subscribe(event => {
  //     if (event instanceof NavigationStart) {
  //       // Store the previous URL in localStorage
  //       this.sessionService.set(SessionConstants.PREVIOUS_URL, event.url);
  //     }
  //   });
  // }

  ngOnInit() {
    // this.router.events.subscribe(event => {
    //   if (event instanceof NavigationStart) {
    //     this.sessionService.set(SessionConstants.PREVIOUS_URL, event.url);
    //   }
    // });
  
    // // Check session on app load
    // setTimeout(() => {
    //   if (this.commonService.isLoggedIn$) {
    //     this.router.navigate([RouteConstants.BUSINESS_HOME_URL]);
    //   }
    // }, 500);
  }
}
