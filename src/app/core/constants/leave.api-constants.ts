// =============================================================================
// Leave URL constants — merge into APIConstants (same /gateway/hr/* shape).
// =============================================================================

export const LeaveAPIConstants = {
  // types
  API_GET_ALL_LEAVE_TYPES_PAGING_URL: '/gateway/hr/leavetype/getAllLeaveTypesPagingWithSearch',
  API_GET_LEAVE_TYPES_LOOKUP_URL: '/gateway/hr/leavetype/getLeaveTypesLookup',
  API_CREATE_UPDATE_LEAVE_TYPE_URL: '/gateway/hr/leavetype/createUpdateLeaveType',
  API_DELETE_LEAVE_TYPE_URL: '/gateway/hr/leavetype/deleteLeaveType',

  // policies
  API_GET_ALL_LEAVE_POLICIES_PAGING_URL: '/gateway/hr/leavepolicy/getAllLeavePoliciesPagingWithSearch',
  API_CREATE_UPDATE_LEAVE_POLICY_URL: '/gateway/hr/leavepolicy/createUpdateLeavePolicy',
  API_DELETE_LEAVE_POLICY_URL: '/gateway/hr/leavepolicy/deleteLeavePolicy',
  API_GRANT_ENTITLEMENTS_URL: '/gateway/hr/leavepolicy/grantLeaveEntitlements',

  // applications + balances
  API_GET_ALL_LEAVE_APPLICATIONS_PAGING_URL: '/gateway/hr/leaveapplication/getAllLeaveApplicationsPagingWithSearch',
  API_APPLY_LEAVE_URL: '/gateway/hr/leaveapplication/applyLeave',
  API_SET_LEAVE_STATUS_URL: '/gateway/hr/leaveapplication/setLeaveApplicationStatus',
  API_GET_EMPLOYEE_BALANCES_URL: '/gateway/hr/leaveapplication/getEmployeeLeaveBalances',
};
