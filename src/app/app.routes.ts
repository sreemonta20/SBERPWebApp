import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';

// One owner per URL prefix: /auth/* = AuthModule, /business/* = BusinessModule.
// AuthModule was previously lazy-loaded twice (at '' and at 'auth'), which also made
// /auth/auth/login a valid URL; and the second '**' route could never match.
const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'business',
    // canMatch: the business chunk is not even downloaded for a visitor without a session
    canMatch: [AuthGuard],
    loadChildren: () => import('./business/business.module').then((m) => m.BusinessModule),
  },
  // unknown URL: signed in -> dashboard, otherwise -> login (decided by the guard on /business)
  { path: '**', redirectTo: 'business' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
