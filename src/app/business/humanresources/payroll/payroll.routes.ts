import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PayComponentComponent } from './pay-component/pay-component.component';
import { SalaryStructureComponent } from './salary-structure/salary-structure.component';
import { PayrollRunComponent } from './payroll-run/payroll-run.component';
import { LoanComponent } from './loan/loan.component';

// Payroll screens at /business/humanresources/payroll/*.
// Lazy-loaded by humanresources.routes.ts; access (session + menu permission) is checked once by the
// AuthGuard on the parent /business route (canActivateChild), not on every route here.
const routes: Routes = [
  { path: '', redirectTo: 'runs', pathMatch: 'full' },
  { path: 'components',        component: PayComponentComponent },
  { path: 'salary-structures', component: SalaryStructureComponent },
  { path: 'runs',              component: PayrollRunComponent },
  { path: 'loans',             component: LoanComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayrollRoutingModule {}
