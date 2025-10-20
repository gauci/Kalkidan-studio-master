import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMITS = {
  '/api/auth/login': { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
  '/api/auth/register': { windowMs: 60 * 60 * 1000, max: 3 }, // 3 registrations per hour
  '/api/files/upload': { windowMs: 60 * 60 * 1000, max: 20 }, // 20 uploads per hour
  default: { windowMs: 60 * 1000, max: 60 }, // 60 requests per minute default
};

export async function POST(request: NextRequest) {
  try {
    const { endpoint, identifier } = await request.json();
    
    if (!endpoint || !identifier) {
      return NextResponse.json(
        { error: 'Missing endpoint or identifier' },
        { status: 400 }
      );
    }

    // Get rate limit config for endpoint
    const config = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;
    
    // Create unique key for this identifier and endpoint
    const key = `${identifier}:${endpoint}`;
    const now = Date.now();
    
    // Get current rate limit data
    const current = rateLimitMap.get(key);
    
    // If no data or window has expired, reset
    if (!current || now > current.resetTime) {
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      
      return NextResponse.json({
        allowed: true,
        remaining: config.max - 1,
        resetTime: now + config.windowMs,
      });
    }
    
    // Check if limit exceeded
    if (current.count >= config.max) {
      return NextResponse.json({
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        error: 'Rate limit exceeded',
      }, { status: 429 });
    }
    
    // Increment count
    current.count++;
    rateLimitMap.set(key, current);
    
    return NextResponse.json({
      allowed: true,
      remaining: config.max - current.count,
      resetTime: current.resetTime,
    });
    
  } catch (error) {
    console.error('Rate limit check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cleanup function to remove expired entries
function cleanup() {
  const now = Date.now();
  for (const [key, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000);