import {
  EmployeeAddress,
  EmployeeEducation,
  EmployeeExperience,
  EmployeeSkill,
  EmployeeTraining,
  EmployeeCertification,
  EmployeeDocument,
  EmployeeEmergencyContact,
  EmployeeBank,
} from '@app/core/interface/common';

export interface EmployeeRequest {
  actionName?: string | null; // "Save" or "Update"
  id?: string | null;

  employeeCode: string; // [Required] server-side
  appUserId?: string | null;

  firstName: string; // [Required] server-side
  middleName?: string | null;
  lastName: string; // [Required] server-side

  officialEmail?: string | null;
  personalEmail?: string | null;

  dateOfBirth?: string | null; // ISO date string
  gender?: number | null;
  maritalStatus?: number | null;
  bloodGroup?: number | null;
  nationality?: string | null;
  religion?: string | null;
  nationalId?: string | null;
  passportNumber?: string | null;
  passportExpiryDate?: string | null;

  mobileNumber?: string | null;
  alternatePhoneNumber?: string | null;

  departmentId?: string | null;
  designationId?: string | null;
  reportingManagerId?: string | null;
  dateOfJoining?: string | null;
  probationEndDate?: string | null;
  confirmationDate?: string | null;
  dateOfLeaving?: string | null;
  employmentType?: number | null;
  employmentStatus?: number | null;
  workLocation?: string | null;

  basicSalary?: number | null;
  salaryCurrency?: string | null;

  photoUrl?: string | null;
  signatureUrl?: string | null;

  createUpdateBy?: string | null;
  isActive?: boolean | null;

  addresses?: EmployeeAddress[] | null;
  educations?: EmployeeEducation[] | null;
  experiences?: EmployeeExperience[] | null;
  skills?: EmployeeSkill[] | null;
  trainings?: EmployeeTraining[] | null;
  certifications?: EmployeeCertification[] | null;
  documents?: EmployeeDocument[] | null;
  emergencyContacts?: EmployeeEmergencyContact[] | null;
  bankInfo?: EmployeeBank | null;
}
