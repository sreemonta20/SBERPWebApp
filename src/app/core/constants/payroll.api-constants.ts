// =============================================================================
// Payroll URL constants — merge into APIConstants (same /gateway/hr/* shape).
// =============================================================================

export const PayrollAPIConstants = {
  // pay components
  API_GET_ALL_PAY_COMPONENTS_PAGING_URL: '/gateway/hr/paycomponent/getAllPayComponentsPagingWithSearch',
  API_GET_PAY_COMPONENTS_LOOKUP_URL: '/gateway/hr/paycomponent/getPayComponentsLookup',
  API_CREATE_UPDATE_PAY_COMPONENT_URL: '/gateway/hr/paycomponent/createUpdatePayComponent',
  API_DELETE_PAY_COMPONENT_URL: '/gateway/hr/paycomponent/deletePayComponent',

  // salary structures
  API_GET_ALL_SALARY_STRUCTURES_PAGING_URL: '/gateway/hr/salarystructure/getAllSalaryStructuresPagingWithSearch',
  API_GET_SALARY_STRUCTURE_DETAIL_URL: '/gateway/hr/salarystructure/getSalaryStructureDetail',
  API_CREATE_UPDATE_SALARY_STRUCTURE_URL: '/gateway/hr/salarystructure/createUpdateSalaryStructure',
  API_DELETE_SALARY_STRUCTURE_URL: '/gateway/hr/salarystructure/deleteSalaryStructure',

  // payroll runs + payslips
  API_GET_ALL_PAYROLL_RUNS_PAGING_URL: '/gateway/hr/payrollrun/getAllPayrollRunsPagingWithSearch',
  API_PROCESS_PAYROLL_RUN_URL: '/gateway/hr/payrollrun/processPayrollRun',
  API_SET_PAYROLL_RUN_STATUS_URL: '/gateway/hr/payrollrun/setPayrollRunStatus',
  API_GET_PAYSLIPS_BY_RUN_URL: '/gateway/hr/payrollrun/getPayslipsByRun',
  API_GET_PAYSLIP_DETAIL_URL: '/gateway/hr/payrollrun/getPayslipDetail',

  // loans
  API_GET_ALL_LOANS_PAGING_URL: '/gateway/hr/loan/getAllLoansPagingWithSearch',
  API_CREATE_UPDATE_LOAN_URL: '/gateway/hr/loan/createUpdateLoan',
  API_SET_LOAN_STATUS_URL: '/gateway/hr/loan/setLoanStatus',
};
