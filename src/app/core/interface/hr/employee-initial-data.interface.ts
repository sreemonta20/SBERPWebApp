import { LookupItem, BranchLookupItem } from './lookup-item.interface';

export interface EmployeeInitialData {
  companies?: LookupItem[];
  branches?: BranchLookupItem[];
  departments?: LookupItem[];
  designations?: LookupItem[];
  reportingManagers?: LookupItem[];
  genders?: LookupItem[];
  maritalStatuses?: LookupItem[];
  bloodGroups?: LookupItem[];
  employmentTypes?: LookupItem[];
  employmentStatuses?: LookupItem[];
  nextEmployeeCode?: string;
}
