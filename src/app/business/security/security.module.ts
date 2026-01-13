import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { NgxSpinnerModule } from 'ngx-spinner';
import { SecurityRoutingModule } from './security.routes';
import { AppUserRoleComponent } from './appuserrole/appuserrole.component';
import { AppUserProfileComponent } from './appuserprofile/appuserprofile.component';
import { AppUserMenuComponent } from './appusermenu/appusermenu.component';
import { RoleMenuComponent } from './role-menu/role-menu.component';
import { ConfirmDialogComponent } from "@app/shared/confirm-dialog/confirm-dialog.component";

@NgModule({
  declarations: [
    AppUserRoleComponent,
    AppUserProfileComponent,
    AppUserMenuComponent,
    RoleMenuComponent
  ],
  imports: [
    CommonModule,
    SecurityRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    ConfirmDialogComponent
]
})
export class SecurityModule { }
