// import { Routes } from '@angular/router';
// import { LoginComponent } from './login/login.component';
// import { RegisterComponent } from './register/register.component';
// import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
// import { AuthGuard } from '@app/core/guards/auth.guard';

// export const authRoutes: Routes = [
//   { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
//   { path: 'auth/login', component: LoginComponent, canActivate: [AuthGuard] },
//   { path: 'auth/register', component: RegisterComponent },
//   { path: 'auth/resetpassword', component: ResetpasswordComponent, canActivate: [AuthGuard] },
// ];
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { AuthGuard } from '@app/core/guards/auth.guard';


const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full'  },
  { path: 'auth/login', component: LoginComponent,canActivate: [AuthGuard] },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/resetpassword', component: ResetpasswordComponent,canActivate: [AuthGuard] },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}