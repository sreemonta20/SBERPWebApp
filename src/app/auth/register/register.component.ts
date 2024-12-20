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
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  host: { class: 'hold-transition register-page' },
  styleUrls: ['./register.component.css'],
})
// export default class RegisterComponent {}
export class RegisterComponent implements OnInit, AfterViewInit, OnDestroy {
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
    // this.loadScripts(['assets/js/adminlte.js']);
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
