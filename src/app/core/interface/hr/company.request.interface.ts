export interface CompanyRequest {
  actionName?: string | null; // "Save" or "Update"
  id?: string;
  companyCode: string;
  name: string;
  legalName?: string;
  registrationNumber?: string;
  taxNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  currencyCode?: string;
  financialYearStartMonth?: number;
  createUpdateBy?: string | null;
  isActive?: boolean;
}