// =============================================================================
// Recruitment URL constants — merge these keys into the existing APIConstants
// object in @app/core/constants (right after the HR Settings block). They use
// the same /gateway/hr/<area>/<action> shape as the existing HR URLs.
// =============================================================================

export const RecruitmentAPIConstants = {
  // Position
  API_GET_ALL_POSITIONS_PAGING_URL: '/gateway/hr/position/getAllPositionsPagingWithSearch',
  API_GET_ALL_POSITIONS_URL: '/gateway/hr/position/getAllPositions',
  API_SAVE_UPDATE_POSITION_URL: '/gateway/hr/position/createUpdatePosition',
  API_DELETE_POSITION_URL: '/gateway/hr/position/deletePosition',

  // Requisition
  API_GET_ALL_REQUISITIONS_PAGING_URL: '/gateway/hr/requisition/getAllRequisitionsPagingWithSearch',
  API_GET_REQUISITION_BY_ID_URL: '/gateway/hr/requisition/getRequisitionById',
  API_SAVE_UPDATE_REQUISITION_URL: '/gateway/hr/requisition/createUpdateRequisition',
  API_SUBMIT_REQUISITION_URL: '/gateway/hr/requisition/submitRequisition',
  API_APPROVE_REQUISITION_URL: '/gateway/hr/requisition/approveRequisition',
  API_REJECT_REQUISITION_URL: '/gateway/hr/requisition/rejectRequisition',

  // Job Posting
  API_GET_ALL_JOBPOSTINGS_PAGING_URL: '/gateway/hr/jobposting/getAllJobPostingsPagingWithSearch',
  API_GET_JOBPOSTING_BY_ID_URL: '/gateway/hr/jobposting/getJobPostingById',
  API_SAVE_UPDATE_JOBPOSTING_URL: '/gateway/hr/jobposting/createUpdateJobPosting',
  API_PUBLISH_JOBPOSTING_URL: '/gateway/hr/jobposting/publishJobPosting',
  API_CLOSE_JOBPOSTING_URL: '/gateway/hr/jobposting/closeJobPosting',
  API_GET_APPLICATIONS_BY_POSTING_URL: '/gateway/hr/jobposting/getApplicationsByPosting',

  // Candidate / Application
  API_GET_ALL_CANDIDATES_PAGING_URL: '/gateway/hr/candidate/getAllCandidatesPagingWithSearch',
  API_APPLY_TO_POSTING_URL: '/gateway/hr/candidate/applyToPosting',
  API_MOVE_APPLICATION_STAGE_URL: '/gateway/hr/candidate/moveApplicationStage',

  // Interview
  API_GET_INTERVIEWS_BY_APPLICATION_URL: '/gateway/hr/interview/getInterviewsByApplication',
  API_SAVE_UPDATE_INTERVIEW_URL: '/gateway/hr/interview/createUpdateInterview',

  // Offer
  API_GET_OFFER_BY_ID_URL: '/gateway/hr/joboffer/getOfferById',
  API_SAVE_UPDATE_OFFER_URL: '/gateway/hr/joboffer/createUpdateOffer',
  API_ISSUE_OFFER_URL: '/gateway/hr/joboffer/issueOffer',
  API_ACCEPT_OFFER_URL: '/gateway/hr/joboffer/acceptOffer',
  API_DECLINE_OFFER_URL: '/gateway/hr/joboffer/declineOffer',
};
