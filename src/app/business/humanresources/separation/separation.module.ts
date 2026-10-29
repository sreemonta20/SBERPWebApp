import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';

import { SeparationRoutingModule } from './separation.routes';
import { SeparationComponent } from './separation/separation.component';

// NOTE: repo inconsistency — the component imports ConfirmDialogComponent from
// '@app/shared/components/confirm-dialog/...', the module from
// '@app/shared/confirm-dialog/...'. Kept aligned with the other HR modules.
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [SeparationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    SeparationRoutingModule,
    ConfirmDialogComponent,
  ],
})
export class SeparationModule {}
