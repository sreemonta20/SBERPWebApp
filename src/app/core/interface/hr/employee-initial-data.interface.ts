import { LookupItem } from './lookup-item.interface';

export interface EmployeeInitialData {
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
