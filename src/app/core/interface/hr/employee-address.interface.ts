export interface EmployeeAddress {
  id?: string;
  addressType: number;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}
