// import { Routes } from '@angular/router';
// import { AuthGuard } from '@app/core/guards/auth.guard';
// import { AppUserRoleComponent } from './appuserrole/appuserrole.component';

// export const securityRoutes: Routes = [
//   {
//     path: '',
//     component: AppUserRoleComponent,
//     children: [
//       {
//         path: '',
//         redirectTo: 'appuserrole',
//         pathMatch: 'full',
//       },
//       {
//         path: 'appuserrole',
//         component: AppUserRoleComponent,
//         canActivate: [AuthGuard]
//       }
//     ],
//   },
// ];
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';
import { AppUserRoleComponent } from './appuserrole/appuserrole.component';

// const routes: Routes = [
//   {
//     path: '',
//     children: [
//       {
//         path: '',
//         pathMatch: 'full',
//         redirectTo: 'user',
//       },
//       {
//         path: 'user',
//         component: UserComponent,
//         canActivate: [AuthGuard]
//       }
//     ],
//   },
// ];

const routes: Routes = [
  {
    path: '',
    component: AppUserRoleComponent,
    children: [
      {
        path: '',
        redirectTo: 'appuserrole',
        pathMatch: 'full',
      },
      {
        path: 'appuserrole',
        component: AppUserRoleComponent,
        canActivate: [AuthGuard]
      }
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule { }
