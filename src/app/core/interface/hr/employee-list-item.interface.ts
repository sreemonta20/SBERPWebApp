export interface EmployeeListItem {
  id: string;
  employeeCode: string;
  fullName: string;
  officialEmail?: string;
  companyName?: string;
  branchName?: string;
  mobileNumber?: string;
  departmentName?: string;
  designationName?: string;
  dateOfJoining?: string;
  employmentStatus?: number;
  employmentStatusName?: string;
  /** Null when no photo was uploaded: the default avatar is shown. */
  photoId?: string | null;
  isActive?: boolean;
}
