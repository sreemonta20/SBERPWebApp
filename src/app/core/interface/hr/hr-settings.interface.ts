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
  isActive?: boolean;
  isHardDelete?: boolean;
}
