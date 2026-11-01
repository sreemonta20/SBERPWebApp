// =============================================================================
// Organization Setup URL constants — merge into APIConstants (same /gateway/hr/*
// shape as every other HR area).
// =============================================================================

export const OrgSetupAPIConstants = {
  // Company
  API_GET_ALL_COMPANIES_PAGING_URL: '/gateway/hr/organizationsetup/company/getAllCompaniesPagingWithSearch',
  API_CREATE_UPDATE_COMPANY_URL: '/gateway/hr/organizationsetup/company/saveUpdateCompany',
  API_DELETE_COMPANY_URL: '/gateway/hr/organizationsetup/company/deleteCompany',

  // Branch
  API_GET_ALL_BRANCHES_PAGING_URL: '/gateway/hr/organizationsetup/branch/getAllBranchesPagingWithSearch',
  API_CREATE_UPDATE_BRANCH_URL: '/gateway/hr/organizationsetup/branch/saveUpdateBranch',
  API_DELETE_BRANCH_URL: '/gateway/hr/organizationsetup/branch/deleteBranch',

  // Cost Center
  API_GET_ALL_COSTCENTERS_PAGING_URL: '/gateway/hr/costcenter/getAllCostCentersPagingWithSearch',
  API_CREATE_UPDATE_COSTCENTER_URL: '/gateway/hr/costcenter/createUpdateCostCenter',
  API_DELETE_COSTCENTER_URL: '/gateway/hr/costcenter/deleteCostCenter',

  // Job Grade
  API_GET_ALL_JOBGRADES_PAGING_URL: '/gateway/hr/jobgrade/getAllJobGradesPagingWithSearch',
  API_CREATE_UPDATE_JOBGRADE_URL: '/gateway/hr/jobgrade/createUpdateJobGrade',
  API_DELETE_JOBGRADE_URL: '/gateway/hr/jobgrade/deleteJobGrade',

  API_GET_ALL_HOLIDAYCALENDARS_PAGING_URL: '/gateway/hr/holidaycalendar/getAllHolidayCalendarsPagingWithSearch',
  API_CREATE_UPDATE_HOLIDAYCALENDAR_URL: '/gateway/hr/holidaycalendar/createUpdateHolidayCalendar',
  API_DELETE_HOLIDAYCALENDAR_URL: '/gateway/hr/holidaycalendar/deleteHolidayCalendar',
  API_GET_HOLIDAY_DATES_URL: '/gateway/hr/holidaycalendar/getHolidayDatesByCalendar',
  API_CREATE_UPDATE_HOLIDAY_DATE_URL: '/gateway/hr/holidaycalendar/createUpdateHolidayDate',
  API_DELETE_HOLIDAY_DATE_URL: '/gateway/hr/holidaycalendar/deleteHolidayDate',

  // Position
  API_GET_ALL_POSITIONS_PAGING_URL: '/gateway/hr/position/getAllPositionsPagingWithSearch',
  API_CREATE_UPDATE_POSITION_URL: '/gateway/hr/position/createUpdatePosition',
  API_DELETE_POSITION_URL: '/gateway/hr/position/deletePosition',
  API_SET_POSITION_FILL_URL: '/gateway/hr/position/setPositionFill',
  API_SET_POSITION_STATUS_URL: '/gateway/hr/position/setPositionStatus',
  API_GET_POSITION_ORG_TREE_URL: '/gateway/hr/position/getPositionOrgTree',
};
