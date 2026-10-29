import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

import { OrgSetupRoutingModule } from './orgsetup.routes';
import { CostCenterComponent } from './cost-center/cost-center.component';
import { JobGradeComponent } from './job-grade/job-grade.component';
import { HolidayCalendarComponent } from './holiday-calendar/holiday-calendar.component';
import { PositionComponent } from './position/position.component';

/**
 * Organization Setup (Module 0) — the structure an employee sits on: Cost Center,
 * Job Grade, Holiday Calendar and Position (the budgeted seat Recruitment hires
 * against). Company and Branch screens live in HumanResourcesModule (hr2).
 */
@NgModule({
  declarations: [
    CostCenterComponent,
    JobGradeComponent,
    HolidayCalendarComponent,
    PositionComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    ConfirmDialogComponent,
    OrgSetupRoutingModule,
  ],
})
export class OrgSetupModule {}
