import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';

import { HumanResourcesRoutingModule } from './humanresources.routes';
import { CompanyComponent } from './company/company.component';
import { BranchComponent } from './branch/branch.component';
import { EmployeeComponent } from './employee/employee.component';
import { DepartmentComponent } from './department/department.component';
import { DesignationComponent } from './designation/designation.component';
import { HrSettingsComponent } from './hr-settings/hr-settings.component';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { PhotoThumbComponent } from '@app/shared/photo-thumb/photo-thumb.component';


/**
 * HumanResources business module — mirrors SecurityModule in shape.
 * Each screen (Employee, Department, Designation, HR Settings) is a single
 * component that hosts both list and form views, switched by an internal
 * viewMode flag. No more separate -list / -form components.
 */
@NgModule({
  declarations: [
    CompanyComponent,   // NEW
    BranchComponent,
    EmployeeComponent,
    DepartmentComponent,
    DesignationComponent,
    HrSettingsComponent
  ],
  imports: [
    CommonModule,
    HumanResourcesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    ConfirmDialogComponent,
    PhotoThumbComponent
  ]
})
export class HumanResourcesModule { }
