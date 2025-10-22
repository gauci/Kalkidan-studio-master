import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route protection configuration
interface ProtectedRoute {
  pattern: RegExp;
  requiredRole: 'user' | 'admin';
  redirectTo: string;
}

const protectedRoutes: ProtectedRoute[] = [
  {
    pattern: /^\/admin(\/.*)?$/,
    requiredRole: 'admin',
    redirectTo: '/auth/login'
  },
  {
    pattern: /^\/dashboard(\/.*)?$/,
    requiredRole: 'user',
    redirectTo: '/auth/login'
  }
];

const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/news',
  '/privacy-policy',
  '/setup'
];

const authRoutes = [
  '/auth/login',
  '/auth/register'
];

// Helper function to validate session token with server-side validation
async function validateSessionToken(token: string, request: NextRequest): Promise<{ valid: boolean; user?: { id: string; role: string; email: string; name: string } }> {
  try {
    if (!token || token.length < 10) {
      return { valid: false };
    }

    // Make internal API call to validate token
    const validationUrl = new URL('/api/auth/validate', request.url);
    const response = await fetch(validationUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });

    if (!response.ok) {
      return { valid: false };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false };
  }
}

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number; blocked: boolean }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 60;
const MAX_AUTH_FAILURES_PER_MINUTE = 5;

// Suspicious activity tracking
const suspiciousActivity = new Map<string, {
  failedAttempts: number;
  lastFailure: number;
  patterns: string[];
}>();

// Security event logging with alerting
function logSecurityEvent(event: {
  type: 'unauthorized_access' | 'invalid_token' | 'role_violation' | 'rate_limit_exceeded' | 'suspicious_activity';
  path: string;
  ip: string;
  userAgent: string;
  timestamp: number;
  details?: any;
}) {
  const logEntry = {
    ...event,
    timestamp: new Date(event.timestamp).toISOString()
  };
  
  console.warn('Security Event:', logEntry);
  
  // Track suspicious activity patterns
  trackSuspiciousActivity(event);
  
  // In production, you would send this to your monitoring service
  // Example: sendToMonitoringService(logEntry);
}

// Track and detect suspicious activity patterns
function trackSuspiciousActivity(event: {
  type: string;
  ip: string;
  path: string;
  timestamp: number;
  details?: any;
}) {
  const activity = suspiciousActivity.get(event.ip) || {
    failedAttempts: 0,
    lastFailure: 0,
    patterns: []
  };
  
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  // Reset if more than an hour has passed
  if (now - activity.lastFailure > oneHour) {
    activity.failedAttempts = 0;
    activity.patterns = [];
  }
  
  // Track failed authentication attempts
  if (['unauthorized_access', 'invalid_token', 'role_violation'].includes(event.type)) {
    activity.failedAttempts++;
    activity.lastFailure = now;
    activity.patterns.push(`${event.type}:${event.path}`);
    
    // Alert on suspicious patterns
    if (activity.failedAttempts >= 10) {
      logSecurityEvent({
        type: 'suspicious_activity',
        path: event.path,
        ip: event.ip,
        userAgent: 'system',
        timestamp: now,
        details: {
          reason: 'Multiple authentication failures',
          failedAttempts: activity.failedAttempts,
          patterns: activity.patterns,
          timeWindow: '1 hour'
        }
      });
    }
  }
  
  suspiciousActivity.set(event.ip, activity);
}

// Rate limiting function
function checkRateLimit(ip: string, isAuthFailure: boolean = false): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const limit = isAuthFailure ? MAX_AUTH_FAILURES_PER_MINUTE : MAX_REQUESTS_PER_MINUTE;
  
  let entry = rateLimitStore.get(ip);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    entry = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
      blocked: false
    };
    rateLimitStore.set(ip, entry);
    return { allowed: true, remaining: limit - 1 };
  }
  
  entry.count++;
  
  if (entry.count > limit) {
    entry.blocked = true;
    return { allowed: false, remaining: 0 };
  }
  
  return { allowed: true, remaining: limit - entry.count };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Rate limiting check
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    logSecurityEvent({
      type: 'rate_limit_exceeded',
      path: pathname,
      ip,
      userAgent,
      timestamp: Date.now(),
      details: { limit: MAX_REQUESTS_PER_MINUTE, window: '1 minute' }
    });
    
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': MAX_REQUESTS_PER_MINUTE.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + 60).toString()
      }
    });
  }
  
  // Create response
  let response = NextResponse.next();

  // AUTHENTICATION AND AUTHORIZATION CHECKS
  
  // Skip auth checks for public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    // Continue to security headers
  } else {
    // Check if route requires protection
    const protectedRoute = protectedRoutes.find(route => route.pattern.test(pathname));
    
    if (protectedRoute) {
      // Get session token from cookie or header
      const sessionToken = request.cookies.get('sessionToken')?.value || 
                           request.headers.get('authorization')?.replace('Bearer ', '');
      
      if (!sessionToken) {
        // Check auth failure rate limiting
        const authRateLimit = checkRateLimit(ip, true);
        
        // No token - redirect to login
        logSecurityEvent({
          type: 'unauthorized_access',
          path: pathname,
          ip,
          userAgent,
          timestamp: Date.now(),
          details: { reason: 'No session token' }
        });
        
        if (!authRateLimit.allowed) {
          return new NextResponse('Too Many Authentication Failures', {
            status: 429,
            headers: {
              'Retry-After': '60',
              'X-RateLimit-Limit': MAX_AUTH_FAILURES_PER_MINUTE.toString(),
              'X-RateLimit-Remaining': '0'
            }
          });
        }
        
        const loginUrl = new URL(protectedRoute.redirectTo, request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      // Validate token with server-side validation
      const validation = await validateSessionToken(sessionToken, request);
      
      if (!validation.valid) {
        // Check auth failure rate limiting
        const authRateLimit = checkRateLimit(ip, true);
        
        // Invalid token - redirect to login
        logSecurityEvent({
          type: 'invalid_token',
          path: pathname,
          ip,
          userAgent,
          timestamp: Date.now(),
          details: { 
            token: sessionToken.substring(0, 10) + '...',
            reason: 'Server-side validation failed'
          }
        });
        
        if (!authRateLimit.allowed) {
          response = new NextResponse('Too Many Authentication Failures', {
            status: 429,
            headers: {
              'Retry-After': '60',
              'X-RateLimit-Limit': MAX_AUTH_FAILURES_PER_MINUTE.toString(),
              'X-RateLimit-Remaining': '0'
            }
          });
          response.cookies.delete('sessionToken');
          return response;
        }
        
        const loginUrl = new URL(protectedRoute.redirectTo, request.url);
        loginUrl.searchParams.set('redirect', pathname);
        response = NextResponse.redirect(loginUrl);
        
        // Clear invalid token
        response.cookies.delete('sessionToken');
        return response;
      }
      
      // Enhanced role-based access control
      if (validation.user) {
        const userRole = validation.user.role;
        const requiredRole = protectedRoute.requiredRole;
        
        // Check if user has required role
        let hasAccess = false;
        if (requiredRole === 'user') {
          hasAccess = userRole === 'user' || userRole === 'admin';
        } else if (requiredRole === 'admin') {
          hasAccess = userRole === 'admin';
        }
        
        if (!hasAccess) {
          // Insufficient permissions - redirect appropriately
          logSecurityEvent({
            type: 'role_violation',
            path: pathname,
            ip,
            userAgent,
            timestamp: Date.now(),
            details: { 
              userRole,
              requiredRole,
              userId: validation.user.id,
              userEmail: validation.user.email
            }
          });
          
          // Redirect based on user role
          const redirectUrl = userRole === 'user' ? '/dashboard' : '/auth/login';
          return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
        
        // Add comprehensive user info to headers for downstream use
        response.headers.set('X-User-ID', validation.user.id);
        response.headers.set('X-User-Role', validation.user.role);
        response.headers.set('X-User-Email', validation.user.email);
        response.headers.set('X-User-Name', validation.user.name);
        response.headers.set('X-Auth-Validated', 'true');
        response.headers.set('X-Auth-Timestamp', Date.now().toString());
      }
    }
  }
  
  // Redirect authenticated users away from auth pages
  if (authRoutes.includes(pathname)) {
    const sessionToken = request.cookies.get('sessionToken')?.value;
    if (sessionToken) {
      const validation = await validateSessionToken(sessionToken, request);
      if (validation.valid && validation.user) {
        // Log successful auth page redirect
        logSecurityEvent({
          type: 'unauthorized_access',
          path: pathname,
          ip,
          userAgent,
          timestamp: Date.now(),
          details: { 
            reason: 'Authenticated user accessing auth page',
            userId: validation.user.id,
            redirectedTo: validation.user.role === 'admin' ? '/admin' : '/dashboard'
          }
        });
        
        const redirectTo = validation.user.role === 'admin' ? '/admin' : '/dashboard';
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }
  }

  // SECURITY HEADERS
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sanity.io https://convex.cloud",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://cdn.sanity.io https://convex.cloud",
    "connect-src 'self' https://api.sanity.io https://convex.cloud wss://convex.cloud",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  // HSTS (HTTP Strict Transport Security)
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Rate limiting headers
  response.headers.set('X-RateLimit-Limit', MAX_REQUESTS_PER_MINUTE.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(Date.now() / 1000 + 60).toString());

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};