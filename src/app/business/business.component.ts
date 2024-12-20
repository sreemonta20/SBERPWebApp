import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Inject,
  Renderer2,
  ElementRef,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DOCUMENT } from '@angular/common';
declare var $: any;

@Component({
  selector: 'app-business',
  standalone: false,
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.css'],
})
export class BusinessComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    public router: Router,
    private http: HttpClient,
    private renderer: Renderer2
  ) {
    
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    // this.loadScripts([
    //   'assets/plugins/jquery/jquery.min.js',
    //   'assets/plugins/bootstrap/js/bootstrap.bundle.min.js',
    //   'assets/plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js',
    //   'assets/js/adminlte.js',
    //   'assets/plugins/jquery-mousewheel/jquery.mousewheel.js',
    //   'assets/plugins/raphael/raphael.min.js',
    //   'assets/plugins/jquery-mapael/jquery.mapael.min.js',
    //   'assets/plugins/jquery-mapael/maps/usa_states.min.js',
    //   'assets/plugins/chart.js/Chart.min.js',
    //   'assets/js/pages/dashboard2.js',
    // ]);
    //this.loadScripts(['assets/js/adminlte.js']);
  }

  loadScripts(urls: string[]) {
    for (const url of urls) {
      const script = this.renderer.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      this.renderer.appendChild(document.body, script);
    }
  }

  ngOnDestroy(): void {}
}
