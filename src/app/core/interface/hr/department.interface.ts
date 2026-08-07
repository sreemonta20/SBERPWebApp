export interface Department {
  id?: string;
  departmentCode: string;
  name: string;
  description?: string;
  parentDepartmentId?: string;
  parentDepartmentName?: string;
  companyId?: string;
  companyName?: string;
  branchId?: string;
  branchName?: string;
  headEmployeeId?: string;
  headEmployeeName?: string;
  employeeCount?: number;
  isActive?: boolean;
}
