import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Audit log for file access and operations
export const logFileAccess = mutation({
  args: {
    userId: v.id("users"),
    fileId: v.id("files"),
    action: v.union(
      v.literal("upload"),
      v.literal("download"),
      v.literal("delete"),
      v.literal("view"),
      v.literal("update")
    ),
    success: v.boolean(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLogs", {
      userId: args.userId,
      fileId: args.fileId,
      action: args.action,
      success: args.success,
      timestamp: Date.now(),
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      error: args.error,
    });
  },
});

// Get audit logs for admin users
export const getAuditLogs = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
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

    const logs = await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(args.limit || 100);

    return logs;
  },
});

// Get user's own file access logs
export const getUserAuditLogs = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify user session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .order("desc")
      .take(args.limit || 50);

    return logs;
  },
});

// Get audit logs for a specific user (admin only)
export const getUserAuditLogsAdmin = query({
  args: {
    adminToken: v.string(),
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify admin session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired admin session");
    }

    const adminUser = await ctx.db.get(session.userId);
    if (!adminUser || !adminUser.isActive || adminUser.role !== "admin") {
      throw new Error("Admin access required");
    }

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 100);

    // Get file details for each log
    const logsWithDetails = await Promise.all(
      logs.map(async (log) => {
        const file = log.fileId ? await ctx.db.get(log.fileId) : null;
        const user = await ctx.db.get(log.userId);
        return {
          ...log,
          fileName: file?.fileName || 'Unknown File',
          userName: user?.name || 'Unknown User',
        };
      })
    );

    return logsWithDetails;
  },
});

// Get user activity summary (admin only)
export const getUserActivitySummary = query({
  args: {
    adminToken: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired admin session");
    }

    const adminUser = await ctx.db.get(session.userId);
    if (!adminUser || !adminUser.isActive || adminUser.role !== "admin") {
      throw new Error("Admin access required");
    }

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const totalActions = logs.length;
    const successfulActions = logs.filter(log => log.success).length;
    const failedActions = totalActions - successfulActions;
    const lastActivity = logs.length > 0 ? Math.max(...logs.map(log => log.timestamp)) : null;

    const actionCounts = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActions,
      successfulActions,
      failedActions,
      lastActivity,
      actionCounts,
    };
  },
});