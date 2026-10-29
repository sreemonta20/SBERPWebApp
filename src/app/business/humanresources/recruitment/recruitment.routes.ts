import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';

import { RequisitionComponent } from './requisition/requisition.component';
import { JobPostingComponent } from './job-posting/job-posting.component';
import { ApplicantPipelineComponent } from './applicant-pipeline/applicant-pipeline.component';

/**
 * Recruitment routes — flattened, same convention as HumanResourcesRoutingModule.
 * Each screen hosts its own list/form via an internal viewMode flag.
 *
 * Wire into business.routes.ts as:
 *   {
 *     path: 'recruitment',
 *     loadChildren: () =>
 *       import('./recruitment/recruitment.module').then(m => m.RecruitmentModule),
 *   }
 */
const routes: Routes = [
  { path: '', redirectTo: 'requisition', pathMatch: 'full' },
  // Positions are maintained in Organization Setup (one shared seat model)
  { path: 'position',     redirectTo: '/business/orgsetup/position', pathMatch: 'full' },
  { path: 'requisition',  component: RequisitionComponent,       canActivate: [AuthGuard] },
  { path: 'job-posting',  component: JobPostingComponent,        canActivate: [AuthGuard] },
  { path: 'pipeline',     component: ApplicantPipelineComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecruitmentRoutingModule {}
