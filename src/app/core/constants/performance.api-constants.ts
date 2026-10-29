// =============================================================================
// Performance URL constants — merge into APIConstants (same /gateway/hr/* shape).
// =============================================================================

export const PerformanceAPIConstants = {
  // appraisal cycles
  API_GET_ALL_APPRAISAL_CYCLES_PAGING_URL: '/gateway/hr/appraisalcycle/getAllAppraisalCyclesPagingWithSearch',
  API_GET_APPRAISAL_CYCLES_LOOKUP_URL: '/gateway/hr/appraisalcycle/getAppraisalCyclesLookup',
  API_CREATE_UPDATE_APPRAISAL_CYCLE_URL: '/gateway/hr/appraisalcycle/createUpdateAppraisalCycle',
  API_DELETE_APPRAISAL_CYCLE_URL: '/gateway/hr/appraisalcycle/deleteAppraisalCycle',
  API_SET_CYCLE_STATUS_URL: '/gateway/hr/appraisalcycle/setAppraisalCycleStatus',
  API_INITIATE_REVIEWS_URL: '/gateway/hr/appraisalcycle/initiateReviews',

  // competencies
  API_GET_ALL_COMPETENCIES_PAGING_URL: '/gateway/hr/competency/getAllCompetenciesPagingWithSearch',
  API_GET_COMPETENCIES_LOOKUP_URL: '/gateway/hr/competency/getCompetenciesLookup',
  API_CREATE_UPDATE_COMPETENCY_URL: '/gateway/hr/competency/createUpdateCompetency',
  API_DELETE_COMPETENCY_URL: '/gateway/hr/competency/deleteCompetency',

  // goals
  API_GET_ALL_GOALS_PAGING_URL: '/gateway/hr/goal/getAllGoalsPagingWithSearch',
  API_CREATE_UPDATE_GOAL_URL: '/gateway/hr/goal/createUpdateGoal',
  API_UPDATE_GOAL_PROGRESS_URL: '/gateway/hr/goal/updateGoalProgress',
  API_DELETE_GOAL_URL: '/gateway/hr/goal/deleteGoal',

  // reviews
  API_GET_ALL_REVIEWS_PAGING_URL: '/gateway/hr/review/getAllReviewsPagingWithSearch',
  API_GET_REVIEW_DETAIL_URL: '/gateway/hr/review/getReviewDetail',
  API_SAVE_REVIEW_RATINGS_URL: '/gateway/hr/review/saveReviewRatings',
  API_SET_REVIEW_STATUS_URL: '/gateway/hr/review/setReviewStatus',
};
