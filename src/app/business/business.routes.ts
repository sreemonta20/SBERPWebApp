// import { Routes } from '@angular/router';
// import { BusinessComponent } from './business.component';

// export const BusinessRoutes: Routes = [
//   {
//     path: '',
//     component: BusinessComponent,
//     children: [
//       {
//         path: '',
//         redirectTo: 'home',
//         pathMatch: 'full',
//       },
//       {
//         path: 'home',
//         loadChildren: () =>
//           import('./home/home.config').then((m) => m.HomeConfig),
//       },
//       {
//         path: 'appsettings',
//         loadChildren: () =>
//           import('./appsettings/appsettings.config').then((m) => m.AppsettingsConfig),
//       },
//       {
//         path: 'security',
//         loadChildren: () =>
//           import('./security/security.config').then((m) => m.SecurityConfig),
//       },
//     ],
//   },
// ];
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
          import('./appsettings/appsettings.module').then((m) => m.AppsettingsModule),
      },
      {
        path: 'security',
        loadChildren: () =>
          import('./security/security.module').then((m) => m.SecurityModule),
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessRoutingModule { }