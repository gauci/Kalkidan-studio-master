import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Rate limiting for file operations
export const checkRateLimit = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    windowMinutes: v.optional(v.number()),
    maxAttempts: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const windowMs = (args.windowMinutes || 60) * 60 * 1000; // Default 1 hour
    const maxAttempts = args.maxAttempts || 10; // Default 10 attempts
    const now = Date.now();
    const windowStart = now - windowMs;

    // Count recent attempts
    const recentAttempts = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_action", (q) => 
        q.eq("userId", args.userId).eq("action", args.action)
      )
      .filter((q) => q.gte(q.field("timestamp"), windowStart))
      .collect();

    if (recentAttempts.length >= maxAttempts) {
      throw new Error(`Rate limit exceeded. Too many ${args.action} attempts. Please try again later.`);
    }

    // Record this attempt
    await ctx.db.insert("rateLimits", {
      userId: args.userId,
      action: args.action,
      timestamp: now,
    });

    return { allowed: true };
  },
});

// Clean up old rate limit records
export const cleanupRateLimits = mutation({
  args: {},
  handler: async (ctx) => {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    const oldRecords = await ctx.db
      .query("rateLimits")
      .filter((q) => q.lt(q.field("timestamp"), oneDayAgo))
      .collect();

    for (const record of oldRecords) {
      await ctx.db.delete(record._id);
    }

    return { cleaned: oldRecords.length };
  },
});

// Check for suspicious file activity
export const detectSuspiciousActivity = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    // Find users with excessive failed attempts
    const recentFailures = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", oneHourAgo))
      .filter((q) => q.eq(q.field("success"), false))
      .collect();

    // Group by user
    const failuresByUser = recentFailures.reduce((acc, log) => {
      const userId = log.userId;
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Find users with more than 5 failures in the last hour
    const suspiciousUsers = Object.entries(failuresByUser)
      .filter(([_, count]) => count > 5)
      .map(([userId, count]) => ({ userId, failureCount: count }));

    return {
      suspiciousUsers,
      totalFailures: recentFailures.length,
      timeWindow: "1 hour",
    };
  },
});