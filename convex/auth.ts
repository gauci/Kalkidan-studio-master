import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword, verifyPassword, generateSessionToken, isValidEmail, isStrongPassword } from "./utils";
import { InputValidator, RATE_LIMITS } from "./validation";

// Register a new user
export const registerUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    password: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate and sanitize email
    const emailValidation = InputValidator.validateEmail(args.email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.message);
    }

    // Validate and sanitize name
    const nameValidation = InputValidator.validateName(args.name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.message);
    }

    // Validate and sanitize phone
    const phoneValidation = InputValidator.validatePhone(args.phone);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.message);
    }

    // Validate IP address
    const ipValidation = InputValidator.validateIPAddress(args.ipAddress);
    if (!ipValidation.isValid) {
      throw new Error(ipValidation.message);
    }

    // Validate user agent
    const userAgentValidation = InputValidator.validateUserAgent(args.userAgent);
    if (!userAgentValidation.isValid) {
      throw new Error(userAgentValidation.message);
    }

    // Validate password strength
    const passwordCheck = isStrongPassword(args.password);
    if (!passwordCheck.isValid) {
      throw new Error(passwordCheck.message || "Password is not strong enough");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password and create new user
    const passwordHash = hashPassword(args.password);
    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      name: nameValidation.sanitized!,
      phone: phoneValidation.sanitized,
      address: args.address ? InputValidator.sanitizeText(args.address, 200) : undefined,
      passwordHash,
      role: "user",
      createdAt: Date.now(),
      isActive: true,
      emailVerified: false,
    });

    return { userId, message: "User registered successfully" };
  },
});

// Login user
export const loginUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate and sanitize email
    const emailValidation = InputValidator.validateEmail(args.email);
    if (!emailValidation.isValid) {
      throw new Error("Invalid email format");
    }

    // Validate IP address
    const ipValidation = InputValidator.validateIPAddress(args.ipAddress);
    if (!ipValidation.isValid) {
      throw new Error("Invalid request source");
    }

    // Validate user agent
    const userAgentValidation = InputValidator.validateUserAgent(args.userAgent);
    if (!userAgentValidation.isValid) {
      throw new Error("Invalid request format");
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user || !user.isActive) {
      // Log failed login attempt
      if (user) {
        await ctx.db.insert("auditLogs", {
          userId: user._id,
          fileId: user._id as any, // Using user ID as placeholder
          action: "view", // Login attempt
          success: false,
          timestamp: Date.now(),
          ipAddress: args.ipAddress,
          userAgent: userAgentValidation.sanitized,
          error: "Account inactive",
        });
      }
      throw new Error("Invalid credentials or account inactive");
    }

    // Verify password
    if (!verifyPassword(args.password, user.passwordHash)) {
      // Log failed login attempt
      await ctx.db.insert("auditLogs", {
        userId: user._id,
        fileId: user._id as any, // Using user ID as placeholder
        action: "view", // Login attempt
        success: false,
        timestamp: Date.now(),
        ipAddress: args.ipAddress,
        userAgent: userAgentValidation.sanitized,
        error: "Invalid password",
      });
      throw new Error("Invalid credentials");
    }

    // Generate secure session token
    const sessionToken = generateSessionToken();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    // Deactivate any existing sessions for this user
    const existingSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const session of existingSessions) {
      await ctx.db.patch(session._id, { isActive: false });
    }

    // Create new session
    const sessionId = await ctx.db.insert("sessions", {
      userId: user._id,
      token: sessionToken,
      createdAt: Date.now(),
      expiresAt,
      isActive: true,
    });

    // Update last login
    await ctx.db.patch(user._id, {
      lastLogin: Date.now(),
    });

    // Log successful login
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      fileId: user._id as any, // Using user ID as placeholder
      action: "view", // Login attempt
      success: true,
      timestamp: Date.now(),
      ipAddress: args.ipAddress,
      userAgent: userAgentValidation.sanitized,
    });

    return {
      sessionToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        address: user.address,
        emailVerified: user.emailVerified,
      },
    };
  },
});

// Verify session
export const verifySession = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      return null;
    }

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },
});

// Logout user
export const logoutUser = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        isActive: false,
      });
    }

    return { message: "Logged out successfully" };
  },
});

// Get current user
export const getCurrentUser = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      address: user.address,
      emailVerified: user.emailVerified,
    };
  },
});

// Helper function to check if user has required role
export const checkUserRole = query({
  args: {
    token: v.string(),
    requiredRole: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      return { hasAccess: false, reason: "Invalid or expired session" };
    }

    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      return { hasAccess: false, reason: "User account inactive" };
    }

    // Admin has access to everything
    if (user.role === "admin") {
      return { hasAccess: true, user: { id: user._id, role: user.role } };
    }

    // Check if user has required role
    if (user.role === args.requiredRole) {
      return { hasAccess: true, user: { id: user._id, role: user.role } };
    }

    return { hasAccess: false, reason: "Insufficient permissions" };
  },
});

// Create first admin user (only if no admins exist)
export const createFirstAdmin = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if any admin users already exist
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .first();

    if (existingAdmin) {
      throw new Error("Admin user already exists");
    }

    // Validate email format
    if (!isValidEmail(args.email)) {
      throw new Error("Invalid email format");
    }

    // Validate password strength
    const passwordCheck = isStrongPassword(args.password);
    if (!passwordCheck.isValid) {
      throw new Error(passwordCheck.message || "Password is not strong enough");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password and create admin user
    const passwordHash = hashPassword(args.password);
    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      name: args.name.trim(),
      passwordHash,
      role: "admin",
      createdAt: Date.now(),
      isActive: true,
      emailVerified: true, // Admin is pre-verified
    });

    return { userId, message: "First admin user created successfully" };
  },
});

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    adminToken: v.string(),
    userId: v.id("users"),
    newRole: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    // Verify admin permissions
    const adminCheck = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();

    if (!adminCheck || !adminCheck.isActive || adminCheck.expiresAt < Date.now()) {
      throw new Error("Invalid or expired admin session");
    }

    const adminUser = await ctx.db.get(adminCheck.userId);
    if (!adminUser || adminUser.role !== "admin" || !adminUser.isActive) {
      throw new Error("Insufficient permissions - admin access required");
    }

    // Get target user
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Prevent admin from demoting themselves
    if (adminUser._id === args.userId && args.newRole !== "admin") {
      throw new Error("Cannot change your own admin role");
    }

    // Update user role
    await ctx.db.patch(args.userId, {
      role: args.newRole,
    });

    return { 
      message: `User role updated to ${args.newRole}`,
      user: {
        id: targetUser._id,
        email: targetUser.email,
        name: targetUser.name,
        role: args.newRole,
      }
    };
  },
});

// Get all users (admin only)
export const getAllUsers = query({
  args: {
    adminToken: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify admin permissions
    const adminCheck = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();

    if (!adminCheck || !adminCheck.isActive || adminCheck.expiresAt < Date.now()) {
      throw new Error("Invalid or expired admin session");
    }

    const adminUser = await ctx.db.get(adminCheck.userId);
    if (!adminUser || adminUser.role !== "admin" || !adminUser.isActive) {
      throw new Error("Insufficient permissions - admin access required");
    }

    // Get users with pagination
    const limit = args.limit || 50;
    const offset = args.offset || 0;

    const users = await ctx.db
      .query("users")
      .order("desc")
      .collect();

    const paginatedUsers = users.slice(offset, offset + limit);

    return {
      users: paginatedUsers.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
      })),
      total: users.length,
      hasMore: offset + limit < users.length,
    };
  },
});

// Toggle user active status (admin only)
export const toggleUserStatus = mutation({
  args: {
    adminToken: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin permissions
    const adminCheck = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();

    if (!adminCheck || !adminCheck.isActive || adminCheck.expiresAt < Date.now()) {
      throw new Error("Invalid or expired admin session");
    }

    const adminUser = await ctx.db.get(adminCheck.userId);
    if (!adminUser || adminUser.role !== "admin" || !adminUser.isActive) {
      throw new Error("Insufficient permissions - admin access required");
    }

    // Get target user
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Prevent admin from deactivating themselves
    if (adminUser._id === args.userId) {
      throw new Error("Cannot deactivate your own account");
    }

    // Toggle user status
    const newStatus = !targetUser.isActive;
    await ctx.db.patch(args.userId, {
      isActive: newStatus,
    });

    // If deactivating user, also deactivate their sessions
    if (!newStatus) {
      const userSessions = await ctx.db
        .query("sessions")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      for (const session of userSessions) {
        await ctx.db.patch(session._id, { isActive: false });
      }
    }

    return { 
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: targetUser._id,
        email: targetUser.email,
        name: targetUser.name,
        isActive: newStatus,
      }
    };
  },
});