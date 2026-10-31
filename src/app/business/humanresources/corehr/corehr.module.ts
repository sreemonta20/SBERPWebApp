import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';

import { CoreHRRoutingModule } from './corehr.routes';
import { CompanyComponent } from './company/company.component';
import { BranchComponent } from './branch/branch.component';
import { EmployeeComponent } from './employee/employee.component';
import { DepartmentComponent } from './department/department.component';
import { DesignationComponent } from './designation/designation.component';
import { HrSettingsComponent } from './hr-settings/hr-settings.component';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { PhotoThumbComponent } from '@app/shared/photo-thumb/photo-thumb.component';

/**
 * Core HR business module (company, branch, department, designation, employee, HR settings).
 * Each screen is a single component that hosts both list and form views, switched by an
 * internal viewMode flag.
 */
@NgModule({
  declarations: [
    CompanyComponent,
    BranchComponent,
    EmployeeComponent,
    DepartmentComponent,
    DesignationComponent,
    HrSettingsComponent,
  ],
  imports: [
    CommonModule,
    CoreHRRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    ConfirmDialogComponent,
    PhotoThumbComponent,
  ],
})
export class CoreHRModule {}
