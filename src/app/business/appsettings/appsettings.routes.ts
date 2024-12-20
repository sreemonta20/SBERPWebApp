// import { Routes } from '@angular/router';
// import { AppsettingsComponent } from './appsettings.component';
// import { AuthGuard } from '@app/core/guards/auth.guard';

// export const AppsettingsRoutes: Routes = [
//   {
//     path: '',
//     component: AppsettingsComponent,
//     canActivate: [AuthGuard],
//   },
// ];
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppsettingsComponent } from './appsettings.component';
import { AuthGuard } from '@app/core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AppsettingsComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppsettingsRoutingModule { }