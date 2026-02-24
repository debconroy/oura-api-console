import { NextRequest, NextResponse } from 'next/server';

const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// Paths that skip JWT verification (ALB health checks)
const PUBLIC_PATHS = ['/api/health'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Health check: skip auth, add security headers
  if (PUBLIC_PATHS.includes(pathname)) {
    const response = NextResponse.next();
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(key, value);
    }
    return response;
  }

  // Handle logout: redirect through Cognito
  if (pathname === '/logout') {
    const domain = process.env.COGNITO_DOMAIN;
    const clientId = process.env.COGNITO_CLIENT_ID;
    const appDomain = process.env.APP_DOMAIN;
    if (domain && clientId && appDomain) {
      const response = NextResponse.redirect(
        `${domain}/logout?client_id=${clientId}&logout_uri=https://${appDomain}`
      );
      for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        response.headers.set(key, value);
      }
      return response;
    }
  }

  // Verify ALB OIDC token is present (signature verification happens at ALB level;
  // the token's presence confirms the request came through the authenticated ALB path)
  const oidcData = request.headers.get('x-amzn-oidc-data');
  if (!oidcData && process.env.NODE_ENV === 'production') {
    return new NextResponse('Unauthorized: missing OIDC token', {
      status: 401,
      headers: SECURITY_HEADERS,
    });
  }

  // Add security headers and pass user email downstream
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // Extract user email from JWT payload for downstream use
  if (oidcData) {
    try {
      const payloadB64 = oidcData.split('.')[1];
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
      if (payload.email) {
        response.headers.set('x-user-email', payload.email);
      }
    } catch {
      // Token parsing failed — ALB already verified it, continue without email
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
