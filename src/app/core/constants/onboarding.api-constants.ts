// =============================================================================
// Onboarding URL constants — merge into APIConstants (same /gateway/hr/* shape).
// The notification URLs hit the Security service via the gateway.
// =============================================================================

export const OnboardingAPIConstants = {
  API_GET_ALL_ONBOARDINGS_PAGING_URL: '/gateway/hr/onboarding/getAllOnboardingsPagingWithSearch',
  API_GET_ACCEPTED_OFFERS_URL: '/gateway/hr/onboarding/getAcceptedOffersAwaitingOnboarding',
  API_START_ONBOARDING_URL: '/gateway/hr/onboarding/startOnboarding',
  API_GET_ONBOARDING_TASKS_URL: '/gateway/hr/onboarding/getOnboardingTasks',
  API_UPDATE_ONBOARDING_TASK_URL: '/gateway/hr/onboarding/updateOnboardingTask',
  API_ADD_ONBOARDING_TASK_URL: '/gateway/hr/onboarding/addOnboardingTask',
  API_COMPLETE_ONBOARDING_URL: '/gateway/hr/onboarding/completeOnboarding',
  API_CANCEL_ONBOARDING_URL: '/gateway/hr/onboarding/cancelOnboarding',

  // Security notifications (AdminLTE bell)
  API_GET_USER_NOTIFICATIONS_URL: '/gateway/security/notification/getUserNotifications',
  API_MARK_NOTIFICATION_READ_URL: '/gateway/security/notification/markRead',
};
