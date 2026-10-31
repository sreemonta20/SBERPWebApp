import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppsettingsComponent } from './appsettings.component';

const routes: Routes = [
  {
    path: '',
    component: AppsettingsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppsettingsRoutingModule { }