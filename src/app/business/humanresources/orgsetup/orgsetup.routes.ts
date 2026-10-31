import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CostCenterComponent } from './cost-center/cost-center.component';
import { JobGradeComponent } from './job-grade/job-grade.component';
import { HolidayCalendarComponent } from './holiday-calendar/holiday-calendar.component';
import { PositionComponent } from './position/position.component';

// Organization Setup screens at /business/humanresources/orgsetup/*. The paths match the RouteLink values seeded
// into SecurityDB.AppUserMenus (menu permissions are resolved per URL).
// Lazy-loaded by humanresources.routes.ts; access (session + menu permission) is checked once by the
// AuthGuard on the parent /business route (canActivateChild), not on every route here.
const routes: Routes = [
  { path: '', redirectTo: 'position', pathMatch: 'full' },
  { path: 'cost-center', component: CostCenterComponent },
  { path: 'job-grade', component: JobGradeComponent },
  { path: 'holiday-calendar', component: HolidayCalendarComponent },
  { path: 'position', component: PositionComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrgSetupRoutingModule {}
