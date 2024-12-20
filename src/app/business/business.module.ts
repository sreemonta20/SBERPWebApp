import { NgModule } from '@angular/core';
import { CommonModule,DatePipe  } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { BusinessRoutingModule } from './business.routes';
import { BusinessComponent } from './business.component';


@NgModule({
  declarations: [
    BusinessComponent
  ],
  imports: [
    CommonModule,
    BusinessRoutingModule,
    SharedModule,
  ],
  providers: [
    DatePipe
  ]
})
export class BusinessModule { }