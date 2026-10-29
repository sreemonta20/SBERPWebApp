import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';

import { CostCenterComponent } from './cost-center/cost-center.component';
import { JobGradeComponent } from './job-grade/job-grade.component';
import { HolidayCalendarComponent } from './holiday-calendar/holiday-calendar.component';
import { PositionComponent } from './position/position.component';

// Lazy-loaded at /business/orgsetup. Menu permissions resolve per URL
// (commonService.getMenuPermission(router.url)), so these paths match the
// RouteLink values seeded into SecurityDB.AppUserMenus.
const routes: Routes = [
  { path: '', redirectTo: 'position', pathMatch: 'full' },
  { path: 'cost-center', component: CostCenterComponent, canActivate: [AuthGuard] },
  { path: 'job-grade', component: JobGradeComponent, canActivate: [AuthGuard] },
  { path: 'holiday-calendar', component: HolidayCalendarComponent, canActivate: [AuthGuard] },
  { path: 'position', component: PositionComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrgSetupRoutingModule {}
