import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';

import { OnboardingRoutingModule } from './onboarding.routes';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

/**
 * Onboarding business module — same shape as HumanResourcesModule.
 * NOTE: NotificationBellComponent is intentionally NOT declared here — it lives
 * in the navbar (shared/layout), so declare it in the module that owns your
 * topbar (e.g. a SharedModule or the layout module) and render it there.
 */
@NgModule({
  declarations: [OnboardingComponent],
  imports: [
    CommonModule,
    OnboardingRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    ConfirmDialogComponent,
  ],
})
export class OnboardingModule {}
