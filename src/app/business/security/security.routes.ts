import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';
import { AppUserRoleComponent } from './appuserrole/appuserrole.component';
import { AppUserMenuComponent } from './appusermenu/appusermenu.component';


// const routes: Routes = [
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
//       },
//       {
//         path: 'appusermenu',
//         component: AppUserMenuComponent,
//         canActivate: [AuthGuard]
//       }
//     ],
//   },
// ];
const routes: Routes = [
  { path: '', redirectTo: 'appuserrole', pathMatch: 'full'  },
  { path: 'appuserrole', component: AppUserRoleComponent,canActivate: [AuthGuard] },
  { path: 'appusermenu', component: AppUserMenuComponent,canActivate: [AuthGuard] },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule { }
