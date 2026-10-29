import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards/auth.guard';

import { ShiftComponent } from './shift/shift.component';
import { OvertimeComponent } from './overtime/overtime.component';
import { AttendanceSummaryComponent } from './attendance-summary/attendance-summary.component';
import { BiometricRegistrationComponent } from './biometric-registration/biometric-registration.component';
import { AttendancePunchComponent } from './attendance-punch/attendance-punch.component';
import { AttendanceDeviceComponent } from './attendance-device/attendance-device.component';
import { AttendanceZoneComponent } from './attendance-zone/attendance-zone.component';

/**
 * Attendance routes — flattened, same convention as HumanResourcesRoutingModule.
 * Wire into business.routes.ts:
 *   {
 *     path: 'attendance',
 *     loadChildren: () =>
 *       import('./attendance/attendance.module').then(m => m.AttendanceModule),
 *   }
 *
 * (A Regularization screen can be added the same way — the service + endpoints
 *  are already in place; mirror the Overtime component.)
 */
const routes: Routes = [
  { path: '', redirectTo: 'shift', pathMatch: 'full' },
  { path: 'shift',     component: ShiftComponent,             canActivate: [AuthGuard] },
  { path: 'overtime',  component: OvertimeComponent,          canActivate: [AuthGuard] },
  { path: 'summary',   component: AttendanceSummaryComponent, canActivate: [AuthGuard] },
  // biometric attendance (mobile app / door terminal)
  { path: 'biometric-registrations', component: BiometricRegistrationComponent, canActivate: [AuthGuard] },
  { path: 'punches',   component: AttendancePunchComponent,   canActivate: [AuthGuard] },
  { path: 'devices',   component: AttendanceDeviceComponent,  canActivate: [AuthGuard] },
  { path: 'zones',     component: AttendanceZoneComponent,    canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttendanceRoutingModule {}
