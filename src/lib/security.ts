// Frontend security utilities

export class SecurityUtils {
  // Get client IP address (best effort)
  static getClientIP(): string | undefined {
    // In a real application, this would be handled server-side
    // This is just for demonstration
    return undefined;
  }

  // Get user agent
  static getUserAgent(): string {
    return typeof window !== 'undefined' ? window.navigator.userAgent : '';
  }

  // Sanitize input for display (prevent XSS)
  static sanitizeForDisplay(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate file before upload
  static validateFileForUpload(file: File): { isValid: boolean; error?: string } {
    // File size limits
    const MAX_SIZES = {
      'image/jpeg': 5 * 1024 * 1024, // 5MB
      'image/png': 5 * 1024 * 1024,  // 5MB
      'image/gif': 5 * 1024 * 1024,  // 5MB
      'image/webp': 5 * 1024 * 1024, // 5MB
      'application/pdf': 10 * 1024 * 1024, // 10MB
      'text/plain': 1 * 1024 * 1024, // 1MB
      'application/msword': 10 * 1024 * 1024, // 10MB
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 10 * 1024 * 1024, // 10MB
    };

    // Allowed file types
    const ALLOWED_TYPES = Object.keys(MAX_SIZES);

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`
      };
    }

    // Check file size
    const maxSize = MAX_SIZES[file.type as keyof typeof MAX_SIZES];
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds limit of ${Math.round(maxSize / (1024 * 1024))}MB for ${file.type}`
      };
    }

    // Check file name
    if (!file.name || file.name.trim().length === 0) {
      return { isValid: false, error: 'File name is required' };
    }

    // Check for dangerous file extensions
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
      '.app', '.deb', '.pkg', '.dmg', '.rpm', '.msi', '.run', '.bin'
    ];

    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (dangerousExtensions.includes(extension)) {
      return { isValid: false, error: 'File type not allowed for security reasons' };
    }

    // Check for path traversal in filename
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      return { isValid: false, error: 'Invalid characters in file name' };
    }

    return { isValid: true };
  }

  // Rate limiting check
  static async checkRateLimit(endpoint: string, identifier: string): Promise<{
    allowed: boolean;
    remaining?: number;
    resetTime?: number;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/rate-limit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint, identifier }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { allowed: false, error: data.error || 'Rate limit check failed' };
      }

      return data;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true }; // Fail open for better UX
    }
  }

  // Generate secure random string
  static generateSecureId(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
    } else {
      // Fallback for environments without crypto.getRandomValues
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    
    return result;
  }

  // Validate email format (client-side)
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    if (email.length > 254) {
      return { isValid: false, error: 'Email address is too long' };
    }

    return { isValid: true };
  }

  // Validate password strength (client-side)
  static validatePassword(password: string): { isValid: boolean; error?: string; strength?: string } {
    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }

    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }

    if (password.length > 128) {
      return { isValid: false, error: 'Password is too long (max 128 characters)' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteriaMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

    if (criteriaMet < 3) {
      return {
        isValid: false,
        error: 'Password must contain at least 3 of: uppercase letter, lowercase letter, number, special character'
      };
    }

    // Determine strength
    let strength = 'Weak';
    if (criteriaMet === 4 && password.length >= 12) {
      strength = 'Very Strong';
    } else if (criteriaMet === 4 || password.length >= 10) {
      strength = 'Strong';
    } else if (criteriaMet >= 3) {
      strength = 'Medium';
    }

    return { isValid: true, strength };
  }

  // Check for common passwords
  static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  }

  // Secure localStorage wrapper
  static secureStorage = {
    setItem: (key: string, value: string): void => {
      if (typeof window !== 'undefined') {
        try {
          // In a real application, you might want to encrypt the value
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Failed to store item securely:', error);
        }
      }
    },

    getItem: (key: string): string | null => {
      if (typeof window !== 'undefined') {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error('Failed to retrieve item securely:', error);
          return null;
        }
      }
      return null;
    },

    removeItem: (key: string): void => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Failed to remove item securely:', error);
        }
      }
    },

    clear: (): void => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
        } catch (error) {
          console.error('Failed to clear storage securely:', error);
        }
      }
    }
  };
}