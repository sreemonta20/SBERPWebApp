import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CompanyComponent } from './company/company.component';
import { BranchComponent } from './branch/branch.component';
import { EmployeeComponent } from './employee/employee.component';
import { DepartmentComponent } from './department/department.component';
import { DesignationComponent } from './designation/designation.component';
import { HrSettingsComponent } from './hr-settings/hr-settings.component';

// Core HR screens at /business/humanresources/corehr/*. Each screen switches list/form internally
// (viewMode flag), so there are no /new or /:id routes.
// Lazy-loaded by humanresources.routes.ts; access (session + menu permission) is checked once by the
// AuthGuard on the parent /business route (canActivateChild), not on every route here.
const routes: Routes = [
  { path: '', redirectTo: 'employee', pathMatch: 'full' },
  { path: 'company',     component: CompanyComponent },
  { path: 'branch',      component: BranchComponent },
  { path: 'department',  component: DepartmentComponent },
  { path: 'designation', component: DesignationComponent },
  { path: 'employee',    component: EmployeeComponent },
  { path: 'settings',    component: HrSettingsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoreHRRoutingModule {}
