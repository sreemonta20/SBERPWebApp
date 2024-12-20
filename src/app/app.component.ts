import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

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
    private renderer: Renderer2
  ) {
    
  }

  ngOnInit() {
  
  }
}
