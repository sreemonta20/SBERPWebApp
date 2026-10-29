// =============================================================================
// Attendance URL constants — merge into APIConstants (same /gateway/hr/* shape).
// =============================================================================

export const AttendanceAPIConstants = {
  // shifts
  API_GET_ALL_SHIFTS_PAGING_URL: '/gateway/hr/shift/getAllShiftsPagingWithSearch',
  API_CREATE_UPDATE_SHIFT_URL: '/gateway/hr/shift/createUpdateShift',
  API_DELETE_SHIFT_URL: '/gateway/hr/shift/deleteShift',

  // rosters
  API_CREATE_UPDATE_ROSTER_URL: '/gateway/hr/roster/createUpdateRoster',
  API_GET_EMPLOYEE_ROSTER_URL: '/gateway/hr/roster/getEmployeeRoster',
  API_DELETE_ROSTER_URL: '/gateway/hr/roster/deleteRoster',

  // overtime
  API_GET_ALL_OVERTIME_PAGING_URL: '/gateway/hr/overtime/getAllOvertimePagingWithSearch',
  API_CREATE_UPDATE_OVERTIME_URL: '/gateway/hr/overtime/createUpdateOvertime',
  API_SET_OVERTIME_STATUS_URL: '/gateway/hr/overtime/setOvertimeStatus',

  // regularization
  API_GET_ALL_REGULARIZATIONS_PAGING_URL: '/gateway/hr/regularization/getAllRegularizationsPagingWithSearch',
  API_CREATE_UPDATE_REGULARIZATION_URL: '/gateway/hr/regularization/createUpdateRegularization',
  API_SET_REGULARIZATION_STATUS_URL: '/gateway/hr/regularization/setRegularizationStatus',

  // summary
  API_GET_MONTHLY_SUMMARY_URL: '/gateway/hr/attendancesummary/getMonthlyAttendanceSummary',

  // biometric attendance — registrations
  API_GET_ALL_BIOMETRIC_REGISTRATIONS_PAGING_URL: '/gateway/hr/biometricregistration/getAllBiometricRegistrationsPagingWithSearch',
  API_CREATE_TERMINAL_ENROLLMENT_URL: '/gateway/hr/biometricregistration/createTerminalEnrollment',
  API_REVOKE_BIOMETRIC_REGISTRATION_URL: '/gateway/hr/biometricregistration/revokeBiometricRegistration',

  // biometric attendance — punch log
  API_GET_ALL_ATTENDANCE_PUNCHES_PAGING_URL: '/gateway/hr/attendancepunch/getAllAttendancePunchesPagingWithSearch',
  API_REPROCESS_ATTENDANCE_URL: '/gateway/hr/attendancepunch/reprocessAttendance',

  // biometric attendance — door terminals
  API_GET_ALL_ATTENDANCE_DEVICES_PAGING_URL: '/gateway/hr/attendancedevice/getAllAttendanceDevicesPagingWithSearch',
  API_CREATE_UPDATE_ATTENDANCE_DEVICE_URL: '/gateway/hr/attendancedevice/createUpdateAttendanceDevice',
  API_DELETE_ATTENDANCE_DEVICE_URL: '/gateway/hr/attendancedevice/deleteAttendanceDevice',

  // biometric attendance — office zones (network / Wi-Fi / GPS)
  API_GET_ALL_ATTENDANCE_ZONES_PAGING_URL: '/gateway/hr/attendancezone/getAllAttendanceZonesPagingWithSearch',
  API_CREATE_UPDATE_ATTENDANCE_ZONE_URL: '/gateway/hr/attendancezone/createUpdateAttendanceZone',
  API_DELETE_ATTENDANCE_ZONE_URL: '/gateway/hr/attendancezone/deleteAttendanceZone',
};
