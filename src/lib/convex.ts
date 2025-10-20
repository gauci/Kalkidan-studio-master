import { ConvexReactClient } from "convex/react";

let convexClient: ConvexReactClient | null = null;

export function getConvexClient(): ConvexReactClient {
  if (typeof window === 'undefined') {
    // Server-side: return a mock client or throw an error
    throw new Error("Convex client should not be used on the server side");
  }

  if (!convexClient) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    
    if (!convexUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
    }

    convexClient = new ConvexReactClient(convexUrl);
  }

  return convexClient;
}

// For backward compatibility
export const convex = typeof window !== 'undefined' ? getConvexClient() : null;