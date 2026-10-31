import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Human Resources module at /business/humanresources/<sub-module>/<screen>. The 9 sub-modules follow
// the menu tree in SecurityDB (Human Resources > Leave > Leave Application =
// /business/humanresources/leave/applications); each one is lazy-loaded as its own chunk.
// Lazy-loaded by business.routes.ts; access (session + menu permission) is checked once by the
// AuthGuard on the parent /business route (canActivateChild), not on every route here.
const routes: Routes = [
  { path: '', redirectTo: 'corehr', pathMatch: 'full' },
  {
    path: 'corehr',
    loadChildren: () => import('./corehr/corehr.module').then((m) => m.CoreHRModule),
  },
  {
    path: 'orgsetup',
    loadChildren: () => import('./orgsetup/orgsetup.module').then((m) => m.OrgSetupModule),
  },
  {
    path: 'recruitment',
    loadChildren: () => import('./recruitment/recruitment.module').then((m) => m.RecruitmentModule),
  },
  {
    path: 'onboarding',
    loadChildren: () => import('./onboarding/onboarding.module').then((m) => m.OnboardingModule),
  },
  {
    path: 'attendance',
    loadChildren: () => import('./attendance/attendance.module').then((m) => m.AttendanceModule),
  },
  {
    path: 'leave',
    loadChildren: () => import('./leave/leave.module').then((m) => m.LeaveModule),
  },
  {
    path: 'payroll',
    loadChildren: () => import('./payroll/payroll.module').then((m) => m.PayrollModule),
  },
  {
    path: 'performance',
    loadChildren: () => import('./performance/performance.module').then((m) => m.PerformanceModule),
  },
  {
    path: 'separation',
    loadChildren: () => import('./separation/separation.module').then((m) => m.SeparationModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HumanResourcesRoutingModule {}
