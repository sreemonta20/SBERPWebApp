import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AttendanceRoutingModule } from './attendance.routes';
import { ShiftComponent } from './shift/shift.component';
import { OvertimeComponent } from './overtime/overtime.component';
import { AttendanceSummaryComponent } from './attendance-summary/attendance-summary.component';
import { BiometricRegistrationComponent } from './biometric-registration/biometric-registration.component';
import { AttendancePunchComponent } from './attendance-punch/attendance-punch.component';
import { AttendanceDeviceComponent } from './attendance-device/attendance-device.component';
import { AttendanceZoneComponent } from './attendance-zone/attendance-zone.component';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

/**
 * Attendance business module — mirrors HumanResourcesModule shape.
 * Shift / Overtime each host list + form via an internal viewMode flag; Summary
 * is a single read-only screen.
 */
@NgModule({
  declarations: [
    ShiftComponent,
    OvertimeComponent,
    AttendanceSummaryComponent,
    BiometricRegistrationComponent,
    AttendancePunchComponent,
    AttendanceDeviceComponent,
    AttendanceZoneComponent,
  ],
  imports: [
    CommonModule,
    AttendanceRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    ConfirmDialogComponent,
  ],
})
export class AttendanceModule {}
