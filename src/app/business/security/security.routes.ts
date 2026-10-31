import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppUserRoleComponent } from './appuserrole/appuserrole.component';
import { AppUserProfileComponent } from './appuserprofile/appuserprofile.component';
import { AppUserMenuComponent } from './appusermenu/appusermenu.component';
import { RoleMenuComponent } from './role-menu/role-menu.component';


const routes: Routes = [
  { path: '', redirectTo: 'appuserrole', pathMatch: 'full'  },
  { path: 'appuserrole', component: AppUserRoleComponent },
  { path: 'appuserprofile', component: AppUserProfileComponent },
  { path: 'appusermenu', component: AppUserMenuComponent },
  { path: 'appuserrolemenu', component: RoleMenuComponent },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule { }
