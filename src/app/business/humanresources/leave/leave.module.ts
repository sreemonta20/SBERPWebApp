import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';

import { LeaveRoutingModule } from './leave.routes';
import { LeaveTypeComponent } from './leave-type/leave-type.component';
import { LeavePolicyComponent } from './leave-policy/leave-policy.component';
import { LeaveApplicationComponent } from './leave-application/leave-application.component';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

/**
 * Leave business module — mirrors HumanResourcesModule shape. Each component
 * hosts its own list + form via an internal viewMode flag.
 */
@NgModule({
  declarations: [
    LeaveTypeComponent,
    LeavePolicyComponent,
    LeaveApplicationComponent,
  ],
  imports: [
    CommonModule,
    LeaveRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    ConfirmDialogComponent,
  ],
})
export class LeaveModule {}
