import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeparationComponent } from './separation/separation.component';

// Separation screen at /business/humanresources/separation (the menu RouteLink has no child segment).
// Lazy-loaded by humanresources.routes.ts; access (session + menu permission) is checked once by the
// AuthGuard on the parent /business route (canActivateChild), not on every route here.
const routes: Routes = [
  { path: '', component: SeparationComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeparationRoutingModule {}
