import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';

import { PayrollRoutingModule } from './payroll.routes';
import { PayComponentComponent } from './pay-component/pay-component.component';
import { SalaryStructureComponent } from './salary-structure/salary-structure.component';
import { PayrollRunComponent } from './payroll-run/payroll-run.component';
import { LoanComponent } from './loan/loan.component';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

/**
 * Payroll business module — mirrors HumanResourcesModule shape. Each component
 * hosts its own list + form via an internal viewMode flag; the payroll-run
 * component adds a 'payslips' view + a payslip-detail modal.
 */
@NgModule({
  declarations: [
    PayComponentComponent,
    SalaryStructureComponent,
    PayrollRunComponent,
    LoanComponent,
  ],
  imports: [
    CommonModule,
    PayrollRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    ConfirmDialogComponent,
  ],
})
export class PayrollModule {}
