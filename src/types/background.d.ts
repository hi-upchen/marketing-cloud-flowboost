export interface MessageSendToServiceWorker {
  type:
    'GET_ACTIVE_TAB' |
    'RESOLVE_STACKID_FROM_URL' |
    'LOAD_JOURNEY_FROM_URL' |
    'GET_AUTH' |
    'OTHER_ACTIONS' |
    '_LIST_COOKIES' |
    '_ENSURE_CSRF' |
    '_GENERATE_AN_ERROR' |
    'SEND_EMAILS_BY_JOURNEY_URL' |
    'RESOLVE_JOURNEY_BY_JOURNEY_URL'
  data: {
    url?: string, // for RESOLVE_STACKID_FROM_URL, LOAD_JOURNEY_FROM_URL
    stackId?: string, // for GET_AUTH
  };
}