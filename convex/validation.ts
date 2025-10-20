import { v } from "convex/values";

// Input validation and sanitization utilities
export class InputValidator {
  // Email validation with comprehensive checks
  static validateEmail(email: string): { isValid: boolean; message?: string } {
    if (!email || typeof email !== 'string') {
      return { isValid: false, message: 'Email is required' };
    }

    // Trim and convert to lowercase
    email = email.trim().toLowerCase();

    // Length check
    if (email.length > 254) {
      return { isValid: false, message: 'Email address is too long' };
    }

    // Basic format validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Invalid email format' };
    }

    // Check for dangerous characters
    const dangerousChars = ['<', '>', '"', "'", '&', '\n', '\r', '\t'];
    if (dangerousChars.some(char => email.includes(char))) {
      return { isValid: false, message: 'Email contains invalid characters' };
    }

    return { isValid: true };
  }

  // Name validation and sanitization
  static validateName(name: string): { isValid: boolean; sanitized?: string; message?: string } {
    if (!name || typeof name !== 'string') {
      return { isValid: false, message: 'Name is required' };
    }

    // Trim whitespace
    name = name.trim();

    // Length checks
    if (name.length < 1) {
      return { isValid: false, message: 'Name cannot be empty' };
    }
    if (name.length > 100) {
      return { isValid: false, message: 'Name is too long (max 100 characters)' };
    }

    // Remove potentially dangerous characters but keep international characters
    const sanitized = name.replace(/[<>\"'&\n\r\t]/g, '');
    
    // Check for script injection attempts
    const scriptPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i
    ];
    
    if (scriptPatterns.some(pattern => pattern.test(sanitized))) {
      return { isValid: false, message: 'Name contains invalid content' };
    }

    return { isValid: true, sanitized };
  }

  // Phone number validation and sanitization
  static validatePhone(phone?: string): { isValid: boolean; sanitized?: string; message?: string } {
    if (!phone) {
      return { isValid: true, sanitized: undefined };
    }

    if (typeof phone !== 'string') {
      return { isValid: false, message: 'Phone must be a string' };
    }

    // Remove all non-digit characters except + and spaces
    const sanitized = phone.replace(/[^\d+\s()-]/g, '');

    // Length check (international format)
    if (sanitized.length > 20) {
      return { isValid: false, message: 'Phone number is too long' };
    }

    // Basic format check (allow various international formats)
    const phoneRegex = /^[\+]?[\d\s\(\)-]{7,20}$/;
    if (!phoneRegex.test(sanitized)) {
      return { isValid: false, message: 'Invalid phone number format' };
    }

    return { isValid: true, sanitized };
  }

  // File name validation and sanitization
  static validateFileName(fileName: string): { isValid: boolean; sanitized?: string; message?: string } {
    if (!fileName || typeof fileName !== 'string') {
      return { isValid: false, message: 'File name is required' };
    }

    // Length check
    if (fileName.length > 255) {
      return { isValid: false, message: 'File name is too long' };
    }

    // Remove path traversal attempts and dangerous characters
    let sanitized = fileName.replace(/[<>:"|?*\\/]/g, '_');
    sanitized = sanitized.replace(/\.\./g, '_');
    sanitized = sanitized.replace(/^\.+/, ''); // Remove leading dots

    // Ensure file has an extension
    if (!sanitized.includes('.')) {
      return { isValid: false, message: 'File must have an extension' };
    }

    // Check for executable extensions
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
      '.app', '.deb', '.pkg', '.dmg', '.rpm', '.msi', '.run', '.bin'
    ];
    
    const extension = sanitized.toLowerCase().substring(sanitized.lastIndexOf('.'));
    if (dangerousExtensions.includes(extension)) {
      return { isValid: false, message: 'File type not allowed for security reasons' };
    }

    return { isValid: true, sanitized };
  }

  // Content validation for rich text (basic XSS prevention)
  static validateContent(content: string): { isValid: boolean; sanitized?: string; message?: string } {
    if (!content || typeof content !== 'string') {
      return { isValid: true, sanitized: '' };
    }

    // Length check
    if (content.length > 50000) {
      return { isValid: false, message: 'Content is too long (max 50,000 characters)' };
    }

    // Basic XSS prevention - remove script tags and event handlers
    let sanitized = content;
    
    // Remove script tags
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove javascript: protocols
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Remove data: URLs that could contain HTML
    sanitized = sanitized.replace(/data:text\/html[^"'\s>]*/gi, '');

    return { isValid: true, sanitized };
  }

  // IP address validation
  static validateIPAddress(ip?: string): { isValid: boolean; message?: string } {
    if (!ip) {
      return { isValid: true };
    }

    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IPv6 validation (basic)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
      return { isValid: false, message: 'Invalid IP address format' };
    }

    return { isValid: true };
  }

  // User agent validation
  static validateUserAgent(userAgent?: string): { isValid: boolean; sanitized?: string; message?: string } {
    if (!userAgent) {
      return { isValid: true, sanitized: undefined };
    }

    if (typeof userAgent !== 'string') {
      return { isValid: false, message: 'User agent must be a string' };
    }

    // Length check
    if (userAgent.length > 500) {
      return { isValid: false, message: 'User agent string is too long' };
    }

    // Remove potentially dangerous characters
    const sanitized = userAgent.replace(/[<>\"'\n\r\t]/g, '');

    return { isValid: true, sanitized };
  }

  // Generic text sanitization
  static sanitizeText(text: string, maxLength: number = 1000): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    // Trim and limit length
    text = text.trim().substring(0, maxLength);

    // Remove dangerous characters
    text = text.replace(/[<>\"'\n\r\t]/g, '');

    // Remove script injection attempts
    text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/javascript:/gi, '');
    text = text.replace(/on\w+\s*=/gi, '');

    return text;
  }
}

// Rate limiting configuration
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: { window: 15, max: 5 }, // 5 attempts per 15 minutes
  REGISTRATION: { window: 60, max: 3 }, // 3 registrations per hour
  FILE_UPLOAD: { window: 60, max: 20 }, // 20 uploads per hour
  FILE_DOWNLOAD: { window: 60, max: 100 }, // 100 downloads per hour
  PASSWORD_RESET: { window: 60, max: 3 }, // 3 reset attempts per hour
} as const;

// File type validation
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ],
  ARCHIVES: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
} as const;

export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  ARCHIVE: 50 * 1024 * 1024, // 50MB
} as const;