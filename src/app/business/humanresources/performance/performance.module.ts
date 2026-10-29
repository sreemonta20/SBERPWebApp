import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';

import { PerformanceRoutingModule } from './performance.routes';
import { AppraisalCycleComponent } from './appraisal-cycle/appraisal-cycle.component';
import { CompetencyComponent } from './competency/competency.component';
import { GoalComponent } from './goal/goal.component';
import { ReviewComponent } from './review/review.component';

// NOTE: repo inconsistency — components import ConfirmDialogComponent from
// '@app/shared/components/confirm-dialog/...', whereas modules import it from
// '@app/shared/confirm-dialog/...'. Kept aligned with the other HR modules.
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
    AppraisalCycleComponent,
    CompetencyComponent,
    GoalComponent,
    ReviewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    PerformanceRoutingModule,
    ConfirmDialogComponent,
  ],
})
export class PerformanceModule {}
