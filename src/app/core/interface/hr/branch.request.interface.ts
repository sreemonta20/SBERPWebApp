export interface BranchRequest {
  actionName?: string | null;
  id?: string;
  companyId: string; // required — every department belongs to a company
  branchCode: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  isHeadOffice?: boolean;
  createUpdateBy?: string | null;
  isActive?: boolean;
}