import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Security incident types
const INCIDENT_TYPES = {
  SUSPICIOUS_LOGIN: "suspicious_login",
  MULTIPLE_FAILED_LOGINS: "multiple_failed_logins",
  UNUSUAL_FILE_ACTIVITY: "unusual_file_activity",
  POTENTIAL_DATA_BREACH: "potential_data_breach",
  UNAUTHORIZED_ACCESS_ATTEMPT: "unauthorized_access_attempt",
  MALICIOUS_FILE_UPLOAD: "malicious_file_upload",
} as const;

// Log security incident
export const logSecurityIncident = mutation({
  args: {
    adminToken: v.string(),
    incidentType: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    description: v.string(),
    affectedUserId: v.optional(v.id("users")),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    additionalData: v.optional(v.string()),
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
    if (!adminUser || adminUser.role !== "admin" || !adminUser.isActive) {
      throw new Error("Admin access required");
    }

    // Create incident record
    const incidentId = await ctx.db.insert("securityIncidents", {
      incidentType: args.incidentType,
      severity: args.severity,
      description: args.description,
      reportedBy: session.userId,
      affectedUserId: args.affectedUserId,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      additionalData: args.additionalData,
      status: "open",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { incidentId, message: "Security incident logged successfully" };
  },
});

// Get security incidents (admin only)
export const getSecurityIncidents = query({
  args: {
    adminToken: v.string(),
    limit: v.optional(v.number()),
    severity: v.optional(v.string()),
    status: v.optional(v.string()),
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
    if (!adminUser || adminUser.role !== "admin" || !adminUser.isActive) {
      throw new Error("Admin access required");
    }

    let query = ctx.db.query("securityIncidents").order("desc");
    
    const incidents = await query.take(args.limit || 50);

    // Filter by severity and status if provided
    const filteredIncidents = incidents.filter(incident => {
      if (args.severity && incident.severity !== args.severity) return false;
      if (args.status && incident.status !== args.status) return false;
      return true;
    });

    return filteredIncidents;
  },
});

// Update incident status
export const updateIncidentStatus = mutation({
  args: {
    adminToken: v.string(),
    incidentId: v.id("securityIncidents"),
    status: v.union(v.literal("open"), v.literal("investigating"), v.literal("resolved"), v.literal("closed")),
    notes: v.optional(v.string()),
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
    if (!adminUser || adminUser.role !== "admin" || !adminUser.isActive) {
      throw new Error("Admin access required");
    }

    const incident = await ctx.db.get(args.incidentId);
    if (!incident) {
      throw new Error("Incident not found");
    }

    await ctx.db.patch(args.incidentId, {
      status: args.status,
      updatedAt: Date.now(),
      resolvedBy: args.status === "resolved" || args.status === "closed" ? session.userId : undefined,
      resolvedAt: args.status === "resolved" || args.status === "closed" ? Date.now() : undefined,
      notes: args.notes,
    });

    return { message: "Incident status updated successfully" };
  },
});

// Get system health metrics
export const getSystemHealthMetrics = query({
  args: {
    adminToken: v.string(),
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
    if (!adminUser || adminUser.role !== "admin" || !adminUser.isActive) {
      throw new Error("Admin access required");
    }

    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    // Get recent activity metrics
    const recentLogins = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", oneHourAgo))
      .filter((q) => q.eq(q.field("action"), "view"))
      .filter((q) => q.eq(q.field("success"), true))
      .collect();

    const failedLogins = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", oneHourAgo))
      .filter((q) => q.eq(q.field("action"), "view"))
      .filter((q) => q.eq(q.field("success"), false))
      .collect();

    const recentUploads = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", oneDayAgo))
      .filter((q) => q.eq(q.field("action"), "upload"))
      .filter((q) => q.eq(q.field("success"), true))
      .collect();

    const failedUploads = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", oneDayAgo))
      .filter((q) => q.eq(q.field("action"), "upload"))
      .filter((q) => q.eq(q.field("success"), false))
      .collect();

    // Get active users
    const activeUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get recent incidents
    const recentIncidents = await ctx.db
      .query("securityIncidents")
      .withIndex("by_timestamp", (q) => q.gte("createdAt", oneDayAgo))
      .collect();

    return {
      timestamp: now,
      metrics: {
        activeUsers: activeUsers.length,
        recentLogins: recentLogins.length,
        failedLogins: failedLogins.length,
        recentUploads: recentUploads.length,
        failedUploads: failedUploads.length,
        openIncidents: recentIncidents.filter(i => i.status === "open").length,
        criticalIncidents: recentIncidents.filter(i => i.severity === "critical").length,
      },
      health: {
        loginSuccessRate: recentLogins.length > 0 ? 
          (recentLogins.length / (recentLogins.length + failedLogins.length)) * 100 : 100,
        uploadSuccessRate: recentUploads.length > 0 ? 
          (recentUploads.length / (recentUploads.length + failedUploads.length)) * 100 : 100,
        securityStatus: recentIncidents.filter(i => i.severity === "critical").length > 0 ? "critical" :
                       recentIncidents.filter(i => i.severity === "high").length > 0 ? "warning" : "healthy",
      }
    };
  },
});

// Automated threat detection
export const detectThreats = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Detect multiple failed login attempts
    const failedLogins = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", oneHourAgo))
      .filter((q) => q.eq(q.field("action"), "view"))
      .filter((q) => q.eq(q.field("success"), false))
      .collect();

    // Group by user
    const failuresByUser = failedLogins.reduce((acc, log) => {
      const userId = log.userId;
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const threats = [];

    // Check for users with excessive failed attempts
    for (const [userId, count] of Object.entries(failuresByUser)) {
      if (count >= 5) {
        threats.push({
          type: INCIDENT_TYPES.MULTIPLE_FAILED_LOGINS,
          severity: count >= 10 ? "high" : "medium",
          description: `User ${userId} has ${count} failed login attempts in the last hour`,
          affectedUserId: userId,
        });
      }
    }

    // Check for unusual file activity patterns
    const recentUploads = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", oneHourAgo))
      .filter((q) => q.eq(q.field("action"), "upload"))
      .collect();

    const uploadsByUser = recentUploads.reduce((acc, log) => {
      const userId = log.userId;
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (const [userId, count] of Object.entries(uploadsByUser)) {
      if (count >= 20) {
        threats.push({
          type: INCIDENT_TYPES.UNUSUAL_FILE_ACTIVITY,
          severity: count >= 50 ? "high" : "medium",
          description: `User ${userId} has uploaded ${count} files in the last hour`,
          affectedUserId: userId,
        });
      }
    }

    return { threatsDetected: threats.length, threats };
  },
});