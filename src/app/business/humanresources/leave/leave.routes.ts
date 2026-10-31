import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LeaveTypeComponent } from './leave-type/leave-type.component';
import { LeavePolicyComponent } from './leave-policy/leave-policy.component';
import { LeaveApplicationComponent } from './leave-application/leave-application.component';

// Leave screens at /business/humanresources/leave/*.
// Lazy-loaded by humanresources.routes.ts; access (session + menu permission) is checked once by the
// AuthGuard on the parent /business route (canActivateChild), not on every route here.
const routes: Routes = [
  { path: '', redirectTo: 'applications', pathMatch: 'full' },
  { path: 'types',        component: LeaveTypeComponent },
  { path: 'policies',     component: LeavePolicyComponent },
  { path: 'applications', component: LeaveApplicationComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeaveRoutingModule {}
