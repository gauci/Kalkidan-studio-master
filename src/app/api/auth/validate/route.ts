import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'No token provided' },
        { status: 400 }
      );
    }

    // Validate token with Convex
    const user = await convex.query(api.auth.getCurrentUser, { token });
    
    if (!user) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Return user info without sensitive data
    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Token validation failed' },
      { status: 500 }
    );
  }
}

// Rate limiting for validation endpoint
const validationAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_VALIDATION_ATTEMPTS = 10;
const VALIDATION_WINDOW = 60 * 1000; // 1 minute

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  
  // Check rate limiting
  const attempts = validationAttempts.get(ip);
  if (attempts) {
    if (now < attempts.resetTime) {
      if (attempts.count >= MAX_VALIDATION_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Too many validation attempts' },
          { status: 429 }
        );
      }
      attempts.count++;
    } else {
      // Reset window
      validationAttempts.set(ip, { count: 1, resetTime: now + VALIDATION_WINDOW });
    }
  } else {
    validationAttempts.set(ip, { count: 1, resetTime: now + VALIDATION_WINDOW });
  }

  return NextResponse.json({ message: 'Token validation endpoint' });
}