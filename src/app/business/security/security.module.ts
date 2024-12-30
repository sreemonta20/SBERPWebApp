import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { NgxSpinnerModule } from 'ngx-spinner';
import { SecurityRoutingModule } from './security.routes';
import { AppUserRoleComponent } from './appuserrole/appuserrole.component';
import { AppUserMenuComponent } from './appusermenu/appusermenu.component';

@NgModule({
  declarations: [
    AppUserRoleComponent,
    AppUserMenuComponent
  ],
  imports: [
    CommonModule,
    SecurityRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
  ]
})
export class SecurityModule { }
