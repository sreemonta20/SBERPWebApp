export interface LookupItem {
  id: string;
  name: string;
}

/** Branch lookup carries companyId so the Employee/Department forms can
 *  filter it client-side once a Company is picked. */
export interface BranchLookupItem extends LookupItem {
  companyId: string;
}