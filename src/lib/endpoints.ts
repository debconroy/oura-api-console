import type { EndpointDef, ScopeDef } from "./types";

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------
const BASE_URL = "https://api.ouraring.com";

// ---------------------------------------------------------------------------
// OAuth Scopes
// ---------------------------------------------------------------------------
export const SCOPES: ScopeDef[] = [
  {
    id: "personal",
    label: "Personal",
    description: "Read personal information (age, email, weight, height)",
    scope: "personal",
  },
  {
    id: "daily",
    label: "Daily",
    description: "Read daily summaries (activity, readiness, sleep, SpO2, stress)",
    scope: "daily",
  },
  {
    id: "heartrate",
    label: "Heart Rate",
    description: "Read heart rate data",
    scope: "heartrate",
  },
  {
    id: "workout",
    label: "Workout",
    description: "Read workout data",
    scope: "workout",
  },
  {
    id: "tag",
    label: "Tag",
    description: "Read user tags and enhanced tags",
    scope: "tag",
  },
  {
    id: "spo2",
    label: "SpO2",
    description: "Read blood oxygen (SpO2) data",
    scope: "spo2",
  },
  {
    id: "session",
    label: "Session",
    description: "Read guided/unguided session data",
    scope: "session",
  },
];

// ---------------------------------------------------------------------------
// Common query params shared by most collection endpoints
// ---------------------------------------------------------------------------
const DATE_RANGE_PARAMS = [
  {
    name: "start_date",
    type: "string",
    description: "Start date (YYYY-MM-DD)",
    required: false,
  },
  {
    name: "end_date",
    type: "string",
    description: "End date (YYYY-MM-DD)",
    required: false,
  },
  {
    name: "next_token",
    type: "string",
    description: "Pagination token from previous response",
    required: false,
  },
];

// ---------------------------------------------------------------------------
// Endpoint Definitions
// ---------------------------------------------------------------------------
export const ENDPOINTS: EndpointDef[] = [
  // --- User ---
  {
    id: "getPersonalInfo",
    name: "Personal Info",
    description: "Retrieve personal information (age, email, weight, height).",
    method: "GET",
    pathTemplate: "/v2/usercollection/personal_info",
    resource: "user",
    pathParams: [],
    queryParams: [],
    hasBody: false,
    bodyTemplate: null,
  },
  {
    id: "getRingConfiguration",
    name: "Ring Configuration",
    description: "Retrieve ring hardware info (model, size, color, firmware).",
    method: "GET",
    pathTemplate: "/v2/usercollection/ring_configuration",
    resource: "user",
    pathParams: [],
    queryParams: [...DATE_RANGE_PARAMS],
    hasBody: false,
    bodyTemplate: null,
  },

  // --- Daily ---
  {
    id: "getDailyActivity",
    name: "Daily Activity",
    description: "Activity summaries including MET minutes, steps, and calories.",
    method: "GET",
    pathTemplate: "/v2/usercollection/daily_activity",
    resource: "daily",
    pathParams: [],
    queryParams: [...DATE_RANGE_PARAMS],
    hasBody: false,
    bodyTemplate: null,
  },
  {
    id: "getDailyReadiness",
    name: "Daily Readiness",
    description: "Readiness scores with contributor breakdowns.",
    method: "GET",
    pathTemplate: "/v2/usercollection/daily_readiness",
    resource: "daily",
    pathParams: [],
    queryParams: [...DATE_RANGE_PARAMS],
    hasBody: false,
    bodyTemplate: null,
  },
  {
    id: "getDailySleep",
    name: "Daily Sleep",
    description: "Sleep period summaries with scores and sleep stage contributions.",
    method: "GET",
    pathTemplate: "/v2/usercollection/daily_sleep",
    resource: "daily",
    pathParams: [],
    queryParams: [...DATE_RANGE_PARAMS],
    hasBody: false,
    bodyTemplate: null,
  },
  {
    id: "getDailySpo2",
    name: "Daily SpO2",
    description: "Daily blood oxygen average (Gen 3 rings only).",
    method: "GET",
    pathTemplate: "/v2/usercollection/daily_spo2",
    resource: "daily",
    pathParams: [],
    queryParams: [...DATE_RANGE_PARAMS],
    hasBody: false,
    bodyTemplate: null,
  },
  {
    id: "getDailyStress",
    name: "Daily Stress",
    description: "Daily stress and recovery minutes with summary classifications.",
    method: "GET",
    pathTemplate: "/v2/usercollection/daily_stress",
    resource: "daily",
    pathParams: [],
    queryParams: [...DATE_RANGE_PARAMS],
    hasBody: false,
    bodyTemplate: null,
  },

  // --- Detailed ---
  {
    id: "getHeartRate",
    name: "Heart Rate",
    description: "5-minute heart rate intervals throughout day and night.",
    method: "GET",
    pathTemplate: "/v2/usercollection/heartrate",
    resource: "detailed",
    pathParams: [],
    queryParams: [...DATE_RANGE_PARAMS],
    hasBody: false,
    bodyTemplate: null,
  },
  {
    id: "getSleep",
    name: "Sleep Periods",
    description: "Detailed sleep period data with HRV and breathing metrics.",
    method: "GET",
    pathTemplate: "/v2/usercollection/sleep",
    resource: "detailed",
    pathParams: [],
    queryParams: [...DATE_RANGE_PARAMS],
    hasBody: false,
    bodyTemplate: null,
  },
  {
    id: "getSessions",
    name: "Sessions",
    description: "Guided and unguided session data with biometric trends.",
    method: "GET",
    pathTemplate: "/v2/usercollection/session",
    resource: "detailed",
    pathParams: [],
    queryParams: [...DATE_RANGE_PARAMS],
    hasBody: false,
    bodyTemplate: null,
  },
  {
    id: "getWorkouts",
    name: "Workouts",
    description: "Workout data including activity type, duration, and intensity.",
    method: "GET",
    pathTemplate: "/v2/usercollection/workout",
    resource: "detailed",
    pathParams: [],
    queryParams: [...DATE_RANGE_PARAMS],
    hasBody: false,
    bodyTemplate: null,
  },

  // --- Tags ---
  {
    id: "getEnhancedTags",
    name: "Enhanced Tags",
    description: "User-entered lifestyle tags with timestamps and context.",
    method: "GET",
    pathTemplate: "/v2/usercollection/enhanced_tag",
    resource: "tags",
    pathParams: [],
    queryParams: [...DATE_RANGE_PARAMS],
    hasBody: false,
    bodyTemplate: null,
  },
  {
    id: "getTags",
    name: "Tags (deprecated)",
    description: "User tags (deprecated — use Enhanced Tags instead).",
    method: "GET",
    pathTemplate: "/v2/usercollection/tag",
    resource: "tags",
    pathParams: [],
    queryParams: [...DATE_RANGE_PARAMS],
    hasBody: false,
    bodyTemplate: null,
  },
  {
    id: "getSleepTime",
    name: "Sleep Time",
    description: "Optimal bedtime window calculated from sleep data.",
    method: "GET",
    pathTemplate: "/v2/usercollection/sleep_time",
    resource: "tags",
    pathParams: [],
    queryParams: [...DATE_RANGE_PARAMS],
    hasBody: false,
    bodyTemplate: null,
  },
  {
    id: "getRestModePeriods",
    name: "Rest Mode Periods",
    description: "Rest mode periods with start/end times and episode details.",
    method: "GET",
    pathTemplate: "/v2/usercollection/rest_mode_period",
    resource: "tags",
    pathParams: [],
    queryParams: [...DATE_RANGE_PARAMS],
    hasBody: false,
    bodyTemplate: null,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function resolveUrl(
  endpoint: EndpointDef,
  params: Record<string, string>,
): string {
  let path = endpoint.pathTemplate;
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`{${key}}`, encodeURIComponent(value));
  }
  return `${BASE_URL}${path}`;
}

export function getEndpointById(id: string): EndpointDef | undefined {
  return ENDPOINTS.find((ep) => ep.id === id);
}
