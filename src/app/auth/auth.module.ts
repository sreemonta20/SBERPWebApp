import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AuthRoutingModule } from './auth.routes';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';

@NgModule({
  declarations: [LoginComponent, RegisterComponent, ResetpasswordComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    AuthRoutingModule,
  ]
})
export class AuthModule {}

