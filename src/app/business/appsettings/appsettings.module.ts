import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 

import { AppsettingsRoutingModule } from './appsettings.routes';
import { AppsettingsComponent } from './appsettings.component';


@NgModule({
  declarations: [
    AppsettingsComponent
  ],
  imports: [
    CommonModule,
    AppsettingsRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class AppsettingsModule { }
