import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';
import { AppUserRoleComponent } from './appuserrole/appuserrole.component';
import { AppUserProfileComponent } from './appuserprofile/appuserprofile.component';
import { AppUserMenuComponent } from './appusermenu/appusermenu.component';
import { RoleMenuComponent } from './role-menu/role-menu.component';


const routes: Routes = [
  { path: '', redirectTo: 'appuserrole', pathMatch: 'full'  },
  { path: 'appuserrole', component: AppUserRoleComponent,canActivate: [AuthGuard] },
  { path: 'appuserprofile', component: AppUserProfileComponent,canActivate: [AuthGuard] },
  { path: 'appusermenu', component: AppUserMenuComponent,canActivate: [AuthGuard] },
  { path: 'appuserrolemenu', component: RoleMenuComponent,canActivate: [AuthGuard] },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule { }
