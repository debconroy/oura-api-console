// OAuth types
export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp ms
  scopes: string[];
}

export interface AuthStatus {
  authenticated: boolean;
  expiresAt: number | null;
  scopes: string[];
}

// Endpoint types
export type HttpMethod = "GET" | "POST";

export interface PathParam {
  name: string;
  placeholder: string;
  description: string;
}

export interface QueryParam {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface EndpointDef {
  id: string;
  name: string;
  description: string;
  method: HttpMethod;
  pathTemplate: string;
  resource: string;
  pathParams: PathParam[];
  queryParams: QueryParam[];
  hasBody: boolean;
  bodyTemplate: Record<string, unknown> | null;
  supportedDataTypes?: string[];
}

// Request/Response types
export interface ProxyRequest {
  endpointId: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: string | null;
}

export interface ProxyResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  durationMs: number;
}

// History types
export interface HistoryRequest {
  id: string;
  timestamp: string;
  endpoint: string;
  method: HttpMethod;
  url: string;
  requestHeaders: Record<string, string>;
  requestBody: unknown | null;
  status: number;
  statusText: string;
  responseHeaders: Record<string, string>;
  responseBody: unknown;
  durationMs: number;
}

export interface HistorySession {
  id: string;
  label: string;
  createdAt: string;
  requests: HistoryRequest[];
}

export interface HistoryData {
  sessions: HistorySession[];
}

// Scope definitions
export interface ScopeDef {
  id: string;
  label: string;
  description: string;
  scope: string;
}
