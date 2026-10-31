import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';
import { BusinessComponent } from './business.component';

// Every screen below is guarded once here: canActivateChild runs the AuthGuard (session, token
// refresh, menu permission for the URL) for each navigation inside /business.
const routes: Routes = [
  {
    path: '',
    component: BusinessComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusinessRoutingModule {}
