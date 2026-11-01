import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RequisitionComponent } from './requisition/requisition.component';
import { JobPostingComponent } from './job-posting/job-posting.component';
import { ApplicantPipelineComponent } from './applicant-pipeline/applicant-pipeline.component';

// Recruitment screens at /business/humanresources/recruitment/*. Each screen hosts its own list/form via a viewMode flag.
// Lazy-loaded by humanresources.routes.ts; access (session + menu permission) is checked once by the
// AuthGuard on the parent /business route (canActivateChild), not on every route here.
const routes: Routes = [
  { path: '', redirectTo: 'requisition', pathMatch: 'full' },
  { path: 'position',     redirectTo: '/business/humanresources/orgsetup/position', pathMatch: 'full' },
  { path: 'requisition',  component: RequisitionComponent },
  { path: 'job-posting',  component: JobPostingComponent },
  { path: 'pipeline',     component: ApplicantPipelineComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecruitmentRoutingModule {}
