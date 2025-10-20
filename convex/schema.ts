import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    passwordHash: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
    createdAt: v.number(),
    lastLogin: v.optional(v.number()),
    isActive: v.boolean(),
    emailVerified: v.boolean(),
    profileImage: v.optional(v.id("_storage")),
  }).index("by_email", ["email"])
    .index("by_role", ["role"]),

  files: defineTable({
    userId: v.id("users"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    storageId: v.id("_storage"),
    uploadedAt: v.number(),
    isPublic: v.boolean(),
    description: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
    isActive: v.boolean(),
  }).index("by_token", ["token"])
    .index("by_user", ["userId"]),

  auditLogs: defineTable({
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
    timestamp: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    error: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_file", ["fileId"])
    .index("by_timestamp", ["timestamp"]),

  rateLimits: defineTable({
    userId: v.id("users"),
    action: v.string(),
    timestamp: v.number(),
  }).index("by_user_action", ["userId", "action"])
    .index("by_timestamp", ["timestamp"]),

  securityIncidents: defineTable({
    incidentType: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    description: v.string(),
    reportedBy: v.id("users"),
    affectedUserId: v.optional(v.id("users")),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    additionalData: v.optional(v.string()),
    status: v.union(v.literal("open"), v.literal("investigating"), v.literal("resolved"), v.literal("closed")),
    createdAt: v.number(),
    updatedAt: v.number(),
    resolvedBy: v.optional(v.id("users")),
    resolvedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("by_timestamp", ["createdAt"])
    .index("by_severity", ["severity"])
    .index("by_status", ["status"])
    .index("by_affected_user", ["affectedUserId"]),
});