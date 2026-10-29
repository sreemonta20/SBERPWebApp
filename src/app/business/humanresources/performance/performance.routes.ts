import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';
import { AppraisalCycleComponent } from './appraisal-cycle/appraisal-cycle.component';
import { CompetencyComponent } from './competency/competency.component';
import { GoalComponent } from './goal/goal.component';
import { ReviewComponent } from './review/review.component';

const routes: Routes = [
  { path: '', redirectTo: 'cycles', pathMatch: 'full' },
  { path: 'cycles', component: AppraisalCycleComponent, canActivate: [AuthGuard] },
  { path: 'competencies', component: CompetencyComponent, canActivate: [AuthGuard] },
  { path: 'goals', component: GoalComponent, canActivate: [AuthGuard] },
  { path: 'reviews', component: ReviewComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerformanceRoutingModule {}
