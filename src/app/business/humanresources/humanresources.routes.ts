import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';

import { EmployeeComponent } from './employee/employee.component';
import { DepartmentComponent } from './department/department.component';
import { DesignationComponent } from './designation/designation.component';
import { HrSettingsComponent } from './hr-settings/hr-settings.component';

/**
 * HR routes — flattened. The old separate /employee/new and /employee/:id
 * routes are gone; the EmployeeComponent now switches between list and
 * form internally via a viewMode flag (no navigation needed).
 *
 * Wired into business.routes.ts as:
 *   {
 *     path: 'humanresources',
 *     loadChildren: () =>
 *       import('./humanresources/humanresources.module').then(m => m.HumanResourcesModule),
 *   }
 */
const routes: Routes = [
  { path: '', redirectTo: 'employee', pathMatch: 'full' },
  { path: 'employee',    component: EmployeeComponent,    canActivate: [AuthGuard] },
  { path: 'department',  component: DepartmentComponent,  canActivate: [AuthGuard] },
  { path: 'designation', component: DesignationComponent, canActivate: [AuthGuard] },
  { path: 'settings',    component: HrSettingsComponent,  canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HumanResourcesRoutingModule { }
