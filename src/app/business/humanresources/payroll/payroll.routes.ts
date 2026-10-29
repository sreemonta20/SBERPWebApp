import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';

import { PayComponentComponent } from './pay-component/pay-component.component';
import { SalaryStructureComponent } from './salary-structure/salary-structure.component';
import { PayrollRunComponent } from './payroll-run/payroll-run.component';
import { LoanComponent } from './loan/loan.component';

/**
 * Payroll routes. Wire into business.routes.ts:
 *   {
 *     path: 'payroll',
 *     loadChildren: () =>
 *       import('./payroll/payroll.module').then(m => m.PayrollModule),
 *   }
 */
const routes: Routes = [
  { path: '', redirectTo: 'runs', pathMatch: 'full' },
  { path: 'components',        component: PayComponentComponent,    canActivate: [AuthGuard] },
  { path: 'salary-structures', component: SalaryStructureComponent, canActivate: [AuthGuard] },
  { path: 'runs',              component: PayrollRunComponent,      canActivate: [AuthGuard] },
  { path: 'loans',             component: LoanComponent,            canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayrollRoutingModule {}
