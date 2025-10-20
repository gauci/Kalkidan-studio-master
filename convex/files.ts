import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { InputValidator, ALLOWED_FILE_TYPES, MAX_FILE_SIZES } from "./validation";

// Helper function to validate file with enhanced security
function validateFile(fileName: string, fileType: string, fileSize: number) {
  // Validate file name
  const fileNameValidation = InputValidator.validateFileName(fileName);
  if (!fileNameValidation.isValid) {
    throw new Error(fileNameValidation.message);
  }

  // Check file type against allowed types
  const allAllowedTypes = [
    ...ALLOWED_FILE_TYPES.IMAGES,
    ...ALLOWED_FILE_TYPES.DOCUMENTS,
    ...ALLOWED_FILE_TYPES.ARCHIVES
  ];
  
  if (!allAllowedTypes.includes(fileType)) {
    throw new Error(`File type ${fileType} is not allowed for security reasons`);
  }

  // Check file size based on type
  let maxSize = MAX_FILE_SIZES.DOCUMENT; // Default
  if (ALLOWED_FILE_TYPES.IMAGES.includes(fileType)) {
    maxSize = MAX_FILE_SIZES.IMAGE;
  } else if (ALLOWED_FILE_TYPES.ARCHIVES.includes(fileType)) {
    maxSize = MAX_FILE_SIZES.ARCHIVE;
  }

  if (fileSize > maxSize) {
    throw new Error(`File size exceeds limit of ${Math.round(maxSize / (1024 * 1024))}MB for this file type`);
  }

  // Additional security checks
  if (fileSize <= 0) {
    throw new Error("Invalid file size");
  }

  if (fileSize > 100 * 1024 * 1024) { // 100MB absolute maximum
    throw new Error("File size exceeds absolute maximum of 100MB");
  }

  return fileNameValidation.sanitized;
}

// Generate upload URL for file
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Upload file metadata (after file is uploaded to storage)
export const createFileRecord = mutation({
  args: {
    token: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    storageId: v.id("_storage"),
    isPublic: v.optional(v.boolean()),
    description: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
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

    // Validate IP address and user agent
    const ipValidation = InputValidator.validateIPAddress(args.ipAddress);
    if (!ipValidation.isValid) {
      throw new Error("Invalid request source");
    }

    const userAgentValidation = InputValidator.validateUserAgent(args.userAgent);
    if (!userAgentValidation.isValid) {
      throw new Error("Invalid request format");
    }

    // Validate and sanitize file
    const sanitizedFileName = validateFile(args.fileName, args.fileType, args.fileSize);

    // Validate and sanitize description
    const sanitizedDescription = args.description 
      ? InputValidator.sanitizeText(args.description, 500)
      : undefined;

    // Check user's file quota (example: 1GB total)
    const userFiles = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect();
    
    const totalSize = userFiles.reduce((sum, file) => sum + file.fileSize, 0);
    const quotaLimit = 1024 * 1024 * 1024; // 1GB
    
    if (totalSize + args.fileSize > quotaLimit) {
      throw new Error("Storage quota exceeded. Please delete some files or upgrade your plan.");
    }

    try {
      // Create file record
      const fileId = await ctx.db.insert("files", {
        userId: session.userId,
        fileName: sanitizedFileName!,
        fileType: args.fileType,
        fileSize: args.fileSize,
        storageId: args.storageId,
        isPublic: args.isPublic || false,
        description: sanitizedDescription,
        uploadedAt: Date.now(),
      });

      // Log successful upload
      await ctx.db.insert("auditLogs", {
        userId: session.userId,
        fileId,
        action: "upload",
        success: true,
        timestamp: Date.now(),
        ipAddress: args.ipAddress,
        userAgent: userAgentValidation.sanitized,
      });

      return { fileId, message: "File uploaded successfully" };
    } catch (error) {
      // Log failed upload
      await ctx.db.insert("auditLogs", {
        userId: session.userId,
        fileId: session.userId as any, // Placeholder
        action: "upload",
        success: false,
        timestamp: Date.now(),
        ipAddress: args.ipAddress,
        userAgent: userAgentValidation.sanitized,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  },
});

// Get user's files
export const getUserFiles = query({
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

    const files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .order("desc")
      .collect();

    return files.map(file => ({
      id: file._id,
      fileName: file.fileName,
      fileType: file.fileType,
      fileSize: file.fileSize,
      uploadedAt: file.uploadedAt,
      isPublic: file.isPublic,
      description: file.description,
      storageId: file.storageId,
    }));
  },
});

// Get file by ID (with permission check)
export const getFile = query({
  args: {
    token: v.string(),
    fileId: v.id("files"),
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

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Check if user owns the file or if file is public
    if (file.userId !== session.userId && !file.isPublic) {
      throw new Error("Access denied");
    }

    return {
      id: file._id,
      fileName: file.fileName,
      fileType: file.fileType,
      fileSize: file.fileSize,
      uploadedAt: file.uploadedAt,
      isPublic: file.isPublic,
      description: file.description,
      storageId: file.storageId,
    };
  },
});

// Delete file
export const deleteFile = mutation({
  args: {
    token: v.string(),
    fileId: v.id("files"),
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

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Check if user owns the file
    if (file.userId !== session.userId) {
      throw new Error("Access denied");
    }

    // Log the deletion
    await ctx.db.insert("auditLogs", {
      userId: session.userId,
      fileId: args.fileId,
      action: "delete",
      success: true,
      timestamp: Date.now(),
    });

    // Delete from storage
    await ctx.storage.delete(file.storageId);
    
    // Delete file record
    await ctx.db.delete(args.fileId);

    return { message: "File deleted successfully" };
  },
});

// Get public files
export const getPublicFiles = query({
  handler: async (ctx) => {
    const files = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();

    return files.map(file => ({
      id: file._id,
      fileName: file.fileName,
      fileType: file.fileType,
      fileSize: file.fileSize,
      uploadedAt: file.uploadedAt,
      description: file.description,
      storageId: file.storageId,
    }));
  },
});

// Get download URL for file
export const getFileUrl = mutation({
  args: {
    token: v.string(),
    fileId: v.id("files"),
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

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Check if user owns the file or if file is public
    if (file.userId !== session.userId && !file.isPublic) {
      throw new Error("Access denied");
    }

    // Log the download access
    await ctx.db.insert("auditLogs", {
      userId: session.userId,
      fileId: args.fileId,
      action: "download",
      success: true,
      timestamp: Date.now(),
    });

    // Generate download URL
    const url = await ctx.storage.getUrl(file.storageId);
    return { url, fileName: file.fileName };
  },
});

// Update file metadata
export const updateFile = mutation({
  args: {
    token: v.string(),
    fileId: v.id("files"),
    fileName: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
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

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Check if user owns the file
    if (file.userId !== session.userId) {
      throw new Error("Access denied");
    }

    // Prepare updates
    const updates: any = {};
    if (args.fileName !== undefined) updates.fileName = args.fileName.trim();
    if (args.description !== undefined) updates.description = args.description?.trim();
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    if (Object.keys(updates).length === 0) {
      throw new Error("No updates provided");
    }

    await ctx.db.patch(args.fileId, updates);
    return { message: "File updated successfully" };
  },
});

// Get file statistics for user
export const getFileStats = query({
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

    const files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect();

    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
    const publicFiles = files.filter(file => file.isPublic).length;
    const privateFiles = totalFiles - publicFiles;

    return {
      totalFiles,
      totalSize,
      publicFiles,
      privateFiles,
      formattedSize: formatFileSize(totalSize),
    };
  },
});

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}