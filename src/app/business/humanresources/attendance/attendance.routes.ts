import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShiftComponent } from './shift/shift.component';
import { OvertimeComponent } from './overtime/overtime.component';
import { AttendanceSummaryComponent } from './attendance-summary/attendance-summary.component';
import { BiometricRegistrationComponent } from './biometric-registration/biometric-registration.component';
import { AttendancePunchComponent } from './attendance-punch/attendance-punch.component';
import { AttendanceDeviceComponent } from './attendance-device/attendance-device.component';
import { AttendanceZoneComponent } from './attendance-zone/attendance-zone.component';

// Attendance screens at /business/humanresources/attendance/*. A Regularization screen can be added the same way
// (service + endpoints exist; mirror the Overtime component).
// Lazy-loaded by humanresources.routes.ts; access (session + menu permission) is checked once by the
// AuthGuard on the parent /business route (canActivateChild), not on every route here.
const routes: Routes = [
  { path: '', redirectTo: 'shift', pathMatch: 'full' },
  { path: 'shift',     component: ShiftComponent },
  { path: 'overtime',  component: OvertimeComponent },
  { path: 'summary',   component: AttendanceSummaryComponent },
  // biometric attendance (mobile app / door terminal)
  { path: 'biometric-registrations', component: BiometricRegistrationComponent },
  { path: 'punches',   component: AttendancePunchComponent },
  { path: 'devices',   component: AttendanceDeviceComponent },
  { path: 'zones',     component: AttendanceZoneComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttendanceRoutingModule {}
