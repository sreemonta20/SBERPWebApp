export interface EmployeeListItem {
  id: string;
  employeeCode: string;
  fullName: string;
  officialEmail?: string;
  mobileNumber?: string;
  departmentName?: string;
  designationName?: string;
  dateOfJoining?: string;
  employmentStatus?: number;
  employmentStatusName?: string;
  isActive?: boolean;
}
