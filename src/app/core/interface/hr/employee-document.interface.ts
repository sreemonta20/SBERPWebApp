export interface EmployeeDocument {
  id?: string;
  documentType?: string;
  documentNumber?: string;
  fileUrl?: string;
  issueDate?: string;
  expiryDate?: string;
  remark?: string;
  isActive?: boolean;
}
