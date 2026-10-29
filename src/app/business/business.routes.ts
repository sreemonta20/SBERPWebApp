import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BusinessComponent } from './business.component';

const routes: Routes = [
  {
    path: '',
    component: BusinessComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full', // Redirect only when the full URL matches
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'appsettings',
        loadChildren: () =>
          import('./appsettings/appsettings.module').then(
            (m) => m.AppsettingsModule,
          ),
      },
      {
        path: 'security',
        loadChildren: () =>
          import('./security/security.module').then((m) => m.SecurityModule),
      },
      {
        path: 'humanresources',
        loadChildren: () =>
          import('./humanresources/humanresources.module').then(
            (m) => m.HumanResourcesModule,
          ),
      },
      // ---- HR sub-modules (Module 0-8): code lives under humanresources/, URLs stay /business/<module> (menu URLs in SecurityDB) ----
      {
        path: 'orgsetup',
        loadChildren: () =>
          import('./humanresources/orgsetup/orgsetup.module').then((m) => m.OrgSetupModule),
      },
      {
        path: 'recruitment',
        loadChildren: () =>
          import('./humanresources/recruitment/recruitment.module').then((m) => m.RecruitmentModule),
      },
      {
        path: 'onboarding',
        loadChildren: () =>
          import('./humanresources/onboarding/onboarding.module').then((m) => m.OnboardingModule),
      },
      {
        path: 'attendance',
        loadChildren: () =>
          import('./humanresources/attendance/attendance.module').then((m) => m.AttendanceModule),
      },
      {
        path: 'leave',
        loadChildren: () =>
          import('./humanresources/leave/leave.module').then((m) => m.LeaveModule),
      },
      {
        path: 'payroll',
        loadChildren: () =>
          import('./humanresources/payroll/payroll.module').then((m) => m.PayrollModule),
      },
      {
        path: 'performance',
        loadChildren: () =>
          import('./humanresources/performance/performance.module').then((m) => m.PerformanceModule),
      },
      {
        path: 'separation',
        loadChildren: () =>
          import('./humanresources/separation/separation.module').then((m) => m.SeparationModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusinessRoutingModule {}
