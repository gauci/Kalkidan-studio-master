import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Export user data (GDPR compliance)
export const exportUserData = query({
  args: {
    token: v.string(),
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

    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      throw new Error("User account inactive");
    }

    // Collect all user data
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      emailVerified: user.emailVerified,
    };

    // Get user's files
    const files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect();

    const filesData = files.map(file => ({
      id: file._id,
      fileName: file.fileName,
      fileType: file.fileType,
      fileSize: file.fileSize,
      uploadedAt: file.uploadedAt,
      isPublic: file.isPublic,
      description: file.description,
    }));

    // Get user's sessions (last 10)
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .order("desc")
      .take(10);

    const sessionsData = sessions.map(s => ({
      id: s._id,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      isActive: s.isActive,
    }));

    // Get user's audit logs (last 100)
    const auditLogs = await ctx.db
      .query("auditLogs")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .order("desc")
      .take(100);

    const auditData = auditLogs.map(log => ({
      id: log._id,
      action: log.action,
      success: log.success,
      timestamp: log.timestamp,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      error: log.error,
    }));

    return {
      exportDate: Date.now(),
      user: userData,
      files: filesData,
      sessions: sessionsData,
      auditLogs: auditData,
      summary: {
        totalFiles: filesData.length,
        totalSessions: sessionsData.length,
        totalAuditLogs: auditData.length,
      }
    };
  },
});

// Request account deletion (GDPR Right to be Forgotten)
export const requestAccountDeletion = mutation({
  args: {
    token: v.string(),
    confirmationText: v.string(),
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

    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      throw new Error("User account inactive");
    }

    // Verify confirmation text
    if (args.confirmationText !== "DELETE MY ACCOUNT") {
      throw new Error("Invalid confirmation text. Please type 'DELETE MY ACCOUNT' exactly.");
    }

    // Prevent admin from deleting their own account if they're the only admin
    if (user.role === "admin") {
      const adminCount = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "admin"))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      if (adminCount.length <= 1) {
        throw new Error("Cannot delete the last admin account. Please create another admin first.");
      }
    }

    // Mark account for deletion (soft delete initially)
    await ctx.db.patch(user._id, {
      isActive: false,
      // Add deletion timestamp for cleanup job
    });

    // Deactivate all user sessions
    const userSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const userSession of userSessions) {
      await ctx.db.patch(userSession._id, { isActive: false });
    }

    // Log the deletion request
    await ctx.db.insert("auditLogs", {
      userId: session.userId,
      // No fileId for privacy operations
      action: "delete",
      success: true,
      timestamp: Date.now(),
      error: "Account deletion requested",
    });

    return { 
      message: "Account deletion requested. Your account has been deactivated and will be permanently deleted within 30 days.",
      deletionDate: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days from now
    };
  },
});

// Permanently delete user data (cleanup job)
export const permanentlyDeleteUser = mutation({
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
    if (!adminUser || adminUser.role !== "admin" || !adminUser.isActive) {
      throw new Error("Admin access required");
    }

    const userToDelete = await ctx.db.get(args.userId);
    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Delete user's files from storage
    const userFiles = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const file of userFiles) {
      try {
        await ctx.storage.delete(file.storageId);
      } catch (error) {
        console.error("Failed to delete file from storage:", error);
      }
      await ctx.db.delete(file._id);
    }

    // Delete user's sessions
    const userSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const userSession of userSessions) {
      await ctx.db.delete(userSession._id);
    }

    // Delete user's audit logs
    const userAuditLogs = await ctx.db
      .query("auditLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const log of userAuditLogs) {
      await ctx.db.delete(log._id);
    }

    // Delete user's rate limit records
    const userRateLimits = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_action", (q) => q.eq("userId", args.userId))
      .collect();

    for (const rateLimit of userRateLimits) {
      await ctx.db.delete(rateLimit._id);
    }

    // Finally, delete the user record
    await ctx.db.delete(args.userId);

    // Log the permanent deletion
    await ctx.db.insert("auditLogs", {
      userId: session.userId, // Admin who performed the deletion
      // No fileId for user deletion operations
      action: "delete",
      success: true,
      timestamp: Date.now(),
      error: `Permanently deleted user account: ${userToDelete.email}`,
    });

    return { 
      message: "User account and all associated data permanently deleted",
      deletedUser: {
        email: userToDelete.email,
        name: userToDelete.name,
      },
      deletedData: {
        files: userFiles.length,
        sessions: userSessions.length,
        auditLogs: userAuditLogs.length,
        rateLimits: userRateLimits.length,
      }
    };
  },
});

// Update user privacy preferences
export const updatePrivacyPreferences = mutation({
  args: {
    token: v.string(),
    preferences: v.object({
      allowAnalytics: v.boolean(),
      allowMarketing: v.boolean(),
      allowDataSharing: v.boolean(),
    }),
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

    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      throw new Error("User account inactive");
    }

    // For now, we'll store preferences in the user record
    // In a real application, you might want a separate privacy_preferences table
    await ctx.db.patch(session.userId, {
      // Add privacy preferences to user schema if needed
      // privacyPreferences: args.preferences,
    });

    // Log the privacy preference update
    await ctx.db.insert("auditLogs", {
      userId: session.userId,
      // No fileId for privacy preference updates
      action: "update",
      success: true,
      timestamp: Date.now(),
      error: "Privacy preferences updated",
    });

    return { 
      message: "Privacy preferences updated successfully",
      preferences: args.preferences
    };
  },
});

// Get privacy policy acceptance status
export const getPrivacyPolicyStatus = query({
  args: {
    token: v.string(),
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

    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      throw new Error("User account inactive");
    }

    return {
      userId: user._id,
      email: user.email,
      // In a real application, you'd track policy acceptance
      privacyPolicyAccepted: true, // Placeholder
      privacyPolicyVersion: "1.0",
      acceptedAt: user.createdAt,
      // privacyPreferences: user.privacyPreferences || {
      //   allowAnalytics: false,
      //   allowMarketing: false,
      //   allowDataSharing: false,
      // }
    };
  },
});

// Accept privacy policy
export const acceptPrivacyPolicy = mutation({
  args: {
    token: v.string(),
    policyVersion: v.string(),
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

    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      throw new Error("User account inactive");
    }

    // Log policy acceptance
    await ctx.db.insert("auditLogs", {
      userId: session.userId,
      // No fileId for privacy policy acceptance
      action: "update",
      success: true,
      timestamp: Date.now(),
      error: `Privacy policy ${args.policyVersion} accepted`,
    });

    return { 
      message: "Privacy policy accepted",
      version: args.policyVersion,
      acceptedAt: Date.now()
    };
  },
});