import { DatePipe } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { NgModule } from '@angular/core';
import {
  BrowserModule,
  Title,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';

import {
  AuthReqInterceptor,
  EncryptDecryptAuthInterceptor
} from '@app/core/interceptor';
import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
    }),
  ],
  providers: [
    // Path URLs (/business/home) instead of hash URLs (/#/business/home): the server only sees
    // the path, so it is what makes server rendering + hydration possible. Old /#/ bookmarks are
    // rewritten by the inline script in index.html.
    Title,
    DatePipe,
    // withFetch: HttpClient uses fetch(), which also works on the server (recommended for SSR)
    provideHttpClient(
      withFetch(),
      withInterceptors([
        AuthReqInterceptor,
        EncryptDecryptAuthInterceptor
      ])
    ),
    // the animations package (~60 kB) is loaded on first use (first toast / spinner), not at start-up
    provideAnimationsAsync(),
    // reuse the server-rendered DOM of prerendered pages (login) instead of re-creating it;
    // clicks / typing made before the app is ready are replayed once it is
    provideClientHydration(withEventReplay()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
