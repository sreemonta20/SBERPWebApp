import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';

import { RecruitmentRoutingModule } from './recruitment.routes';
import { RequisitionComponent } from './requisition/requisition.component';
import { JobPostingComponent } from './job-posting/job-posting.component';
import { ApplicantPipelineComponent } from './applicant-pipeline/applicant-pipeline.component';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

/**
 * Recruitment business module — mirrors HumanResourcesModule in shape.
 * Position / Requisition / JobPosting / Pipeline each host both list and form
 * (or board) views internally via a viewMode flag, so no -list / -form split.
 */
@NgModule({
  declarations: [
    RequisitionComponent,
    JobPostingComponent,
    ApplicantPipelineComponent,
  ],
  imports: [
    CommonModule,
    RecruitmentRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    ConfirmDialogComponent,
  ],
})
export class RecruitmentModule {}
