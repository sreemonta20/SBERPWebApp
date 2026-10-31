import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnboardingComponent } from './onboarding/onboarding.component';

// Onboarding screen at /business/humanresources/onboarding/list.
// Lazy-loaded by humanresources.routes.ts; access (session + menu permission) is checked once by the
// AuthGuard on the parent /business route (canActivateChild), not on every route here.
const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: OnboardingComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnboardingRoutingModule {}
