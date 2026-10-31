import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppraisalCycleComponent } from './appraisal-cycle/appraisal-cycle.component';
import { CompetencyComponent } from './competency/competency.component';
import { GoalComponent } from './goal/goal.component';
import { ReviewComponent } from './review/review.component';

// Performance screens at /business/humanresources/performance/*.
// Lazy-loaded by humanresources.routes.ts; access (session + menu permission) is checked once by the
// AuthGuard on the parent /business route (canActivateChild), not on every route here.
const routes: Routes = [
  { path: '', redirectTo: 'cycles', pathMatch: 'full' },
  { path: 'cycles', component: AppraisalCycleComponent },
  { path: 'competencies', component: CompetencyComponent },
  { path: 'goals', component: GoalComponent },
  { path: 'reviews', component: ReviewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerformanceRoutingModule {}
