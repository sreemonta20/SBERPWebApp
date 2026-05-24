export interface Department {
  id?: string;
  departmentCode: string;
  name: string;
  description?: string;
  parentDepartmentId?: string;
  parentDepartmentName?: string;
  headEmployeeId?: string;
  headEmployeeName?: string;
  employeeCount?: number;
  isActive?: boolean;
}
