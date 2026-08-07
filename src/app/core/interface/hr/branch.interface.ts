export interface Branch {
  id?: string;
  companyId: string; // required — every department belongs to a company
  companyName?: string;
  branchCode: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  isHeadOffice?: boolean;
  isActive?: boolean;
}