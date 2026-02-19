export type LoginEvent = 
  | 'login_view'
  | 'login_submit'
  | 'login_success'
  | 'login_error'
  | 'login_sso_click'
  | 'password_reset_click'
  | 'create_account_click';

export type LoginErrorType = 'validation' | 'auth' | 'network' | 'rate_limit';

interface AnalyticsProperties {
  [key: string]: any;
}

/**
 * Privacy-friendly analytics tracker.
 * Currently logs to console, but designed to be easily swappable for a real provider.
 * No PII should be passed to these events.
 */
export const trackAuthEvent = (event: LoginEvent, properties?: AnalyticsProperties) => {
  // In a real app, this would send data to Segment, Mixpanel, etc.
  // For now, we just log it to the console in development.
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${event}`, properties);
  }

  // Example of how integration would look:
  // if (window.analytics) {
  //   window.analytics.track(event, properties);
  // }
};
