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
import { DOCUMENT } from '@angular/common';
import { ScriptLoaderService } from '@app/core/services/script-loader.service';
declare var $: any;

@Component({
  selector: 'app-control-settings',
  standalone: false,
  templateUrl: './control-settings.component.html',
  styleUrls: ['./control-settings.component.css']
})
export class ControlSettingsComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    public router: Router,
    private http: HttpClient,
    private renderer: Renderer2,
    private scriptLoader: ScriptLoaderService
  ) {
    
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    // AdminLTE control-sidebar options; executed once per app session, not on every layout init
    this.scriptLoader.load(['assets/js/demo.js']).catch((error) => console.error(error));
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
