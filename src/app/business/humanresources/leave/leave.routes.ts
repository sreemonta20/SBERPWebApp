import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';

import { LeaveTypeComponent } from './leave-type/leave-type.component';
import { LeavePolicyComponent } from './leave-policy/leave-policy.component';
import { LeaveApplicationComponent } from './leave-application/leave-application.component';

/**
 * Leave routes. Wire into business.routes.ts:
 *   {
 *     path: 'leave',
 *     loadChildren: () =>
 *       import('./leave/leave.module').then(m => m.LeaveModule),
 *   }
 */
const routes: Routes = [
  { path: '', redirectTo: 'applications', pathMatch: 'full' },
  { path: 'types',        component: LeaveTypeComponent,        canActivate: [AuthGuard] },
  { path: 'policies',     component: LeavePolicyComponent,      canActivate: [AuthGuard] },
  { path: 'applications', component: LeaveApplicationComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeaveRoutingModule {}
