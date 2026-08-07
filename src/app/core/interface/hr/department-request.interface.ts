export interface DepartmentRequest {
  actionName?: string | null; // "Save" or "Update"
  id?: string;
  departmentCode: string;
  name: string;
  description?: string;
  parentDepartmentId?: string;
  headEmployeeId?: string;
  companyId: string; // [Required] server-side
  branchId?: string;
  createUpdateBy?: string | null;
  isActive?: boolean;
}
