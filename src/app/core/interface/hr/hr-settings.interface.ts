export interface HRSettings {
  id?: string;
  attendanceSource: number;            // 1 = manual, 2 = biometric
  attendanceSourceName?: string;
  biometricProvider?: number;
  biometricProviderName?: string;
  biometricConnectionString?: string;
  biometricSourceObject?: string;
  officeStartTime?: string;
  officeEndTime?: string;
  gracePeriodMinutes?: number;
  weeklyOffDays?: string;
  annualLeaveDays?: number;
  sickLeaveDays?: number;
  casualLeaveDays?: number;
  autoProcessTime?: string;
  autoProcessEnabled?: boolean;
  timeZoneId?: string;
  attendanceDayCutoffTime?: string;   // "04:00": earlier punches belong to the previous day
  minMinutesBetweenInOut?: number;
  duplicatePunchMinutes?: number;
  mobileAttendanceEnabled?: boolean;
  requireOfficeNetwork?: boolean;
  isActive?: boolean;
  isHardDelete?: boolean;
}
