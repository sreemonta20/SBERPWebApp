import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';
import { OnboardingComponent } from './onboarding/onboarding.component';

/**
 * Onboarding routes. Wire into business.routes.ts:
 *   {
 *     path: 'onboarding',
 *     loadChildren: () =>
 *       import('./onboarding/onboarding.module').then(m => m.OnboardingModule),
 *   }
 */
const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: OnboardingComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnboardingRoutingModule {}
