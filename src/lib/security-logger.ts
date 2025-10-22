/**
 * Comprehensive Security Event Logging System
 * Logs authentication attempts, unauthorized access, and permission violations
 */

export interface SecurityEvent {
  id: string;
  type: 'auth_success' | 'auth_failure' | 'unauthorized_access' | 'role_violation' | 'session_expired' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress: string;
  userAgent: string;
  path: string;
  details: Record<string, any>;
  sessionId?: string;
}

export interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  recentEvents: SecurityEvent[];
  suspiciousIPs: string[];
  failedLoginAttempts: number;
  lastUpdated: number;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory
  private suspiciousActivityThreshold = 5;
  private timeWindow = 60 * 60 * 1000; // 1 hour

  /**
   * Log a security event
   */
  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): SecurityEvent {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: Date.now(),
    };

    // Add to events array
    this.events.push(securityEvent);

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console with appropriate level
    this.logToConsole(securityEvent);

    // Check for suspicious patterns
    this.checkSuspiciousActivity(securityEvent);

    // In production, you would also send to external logging service
    // this.sendToExternalService(securityEvent);

    return securityEvent;
  }

  /**
   * Log successful authentication
   */
  logAuthSuccess(data: {
    userId: string;
    userEmail: string;
    userRole: string;
    ipAddress: string;
    userAgent: string;
    path: string;
    sessionId?: string;
    details?: Record<string, any>;
  }): SecurityEvent {
    return this.logEvent({
      type: 'auth_success',
      severity: 'low',
      userId: data.userId,
      userEmail: data.userEmail,
      userRole: data.userRole,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      path: data.path,
      sessionId: data.sessionId,
      details: {
        method: 'login',
        ...data.details,
      },
    });
  }

  /**
   * Log failed authentication attempt
   */
  logAuthFailure(data: {
    userEmail?: string;
    ipAddress: string;
    userAgent: string;
    path: string;
    reason: string;
    details?: Record<string, any>;
  }): SecurityEvent {
    return this.logEvent({
      type: 'auth_failure',
      severity: 'medium',
      userEmail: data.userEmail,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      path: data.path,
      details: {
        reason: data.reason,
        ...data.details,
      },
    });
  }

  /**
   * Log unauthorized access attempt
   */
  logUnauthorizedAccess(data: {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    ipAddress: string;
    userAgent: string;
    path: string;
    requiredRole?: string;
    details?: Record<string, any>;
  }): SecurityEvent {
    return this.logEvent({
      type: 'unauthorized_access',
      severity: 'high',
      userId: data.userId,
      userEmail: data.userEmail,
      userRole: data.userRole,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      path: data.path,
      details: {
        requiredRole: data.requiredRole,
        ...data.details,
      },
    });
  }

  /**
   * Log role/permission violation
   */
  logRoleViolation(data: {
    userId: string;
    userEmail: string;
    userRole: string;
    requiredRole: string;
    ipAddress: string;
    userAgent: string;
    path: string;
    details?: Record<string, any>;
  }): SecurityEvent {
    return this.logEvent({
      type: 'role_violation',
      severity: 'high',
      userId: data.userId,
      userEmail: data.userEmail,
      userRole: data.userRole,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      path: data.path,
      details: {
        requiredRole: data.requiredRole,
        attemptedEscalation: data.userRole !== data.requiredRole,
        ...data.details,
      },
    });
  }

  /**
   * Log session expiration
   */
  logSessionExpired(data: {
    userId: string;
    userEmail: string;
    ipAddress: string;
    userAgent: string;
    path: string;
    sessionId: string;
    details?: Record<string, any>;
  }): SecurityEvent {
    return this.logEvent({
      type: 'session_expired',
      severity: 'medium',
      userId: data.userId,
      userEmail: data.userEmail,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      path: data.path,
      sessionId: data.sessionId,
      details: {
        reason: 'session_timeout',
        ...data.details,
      },
    });
  }

  /**
   * Log suspicious activity
   */
  logSuspiciousActivity(data: {
    ipAddress: string;
    userAgent: string;
    path: string;
    pattern: string;
    details?: Record<string, any>;
  }): SecurityEvent {
    return this.logEvent({
      type: 'suspicious_activity',
      severity: 'critical',
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      path: data.path,
      details: {
        pattern: data.pattern,
        ...data.details,
      },
    });
  }

  /**
   * Get security metrics
   */
  getMetrics(): SecurityMetrics {
    const now = Date.now();
    const recentEvents = this.events.filter(
      event => now - event.timestamp < this.timeWindow
    );

    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};

    recentEvents.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      ipCounts[event.ipAddress] = (ipCounts[event.ipAddress] || 0) + 1;
    });

    const suspiciousIPs = Object.entries(ipCounts)
      .filter(([, count]) => count >= this.suspiciousActivityThreshold)
      .map(([ip]) => ip);

    const failedLoginAttempts = eventsByType['auth_failure'] || 0;

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      recentEvents: recentEvents.slice(-50), // Last 50 recent events
      suspiciousIPs,
      failedLoginAttempts,
      lastUpdated: now,
    };
  }

  /**
   * Get events by criteria
   */
  getEvents(criteria: {
    type?: SecurityEvent['type'];
    severity?: SecurityEvent['severity'];
    userId?: string;
    ipAddress?: string;
    timeRange?: { start: number; end: number };
    limit?: number;
  }): SecurityEvent[] {
    let filteredEvents = [...this.events];

    if (criteria.type) {
      filteredEvents = filteredEvents.filter(event => event.type === criteria.type);
    }

    if (criteria.severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === criteria.severity);
    }

    if (criteria.userId) {
      filteredEvents = filteredEvents.filter(event => event.userId === criteria.userId);
    }

    if (criteria.ipAddress) {
      filteredEvents = filteredEvents.filter(event => event.ipAddress === criteria.ipAddress);
    }

    if (criteria.timeRange) {
      filteredEvents = filteredEvents.filter(
        event => event.timestamp >= criteria.timeRange!.start && 
                 event.timestamp <= criteria.timeRange!.end
      );
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => b.timestamp - a.timestamp);

    if (criteria.limit) {
      filteredEvents = filteredEvents.slice(0, criteria.limit);
    }

    return filteredEvents;
  }

  /**
   * Check for suspicious activity patterns
   */
  private checkSuspiciousActivity(event: SecurityEvent): void {
    const recentEvents = this.events.filter(
      e => e.ipAddress === event.ipAddress && 
           Date.now() - e.timestamp < this.timeWindow
    );

    // Check for multiple failed login attempts
    const failedLogins = recentEvents.filter(e => e.type === 'auth_failure').length;
    if (failedLogins >= this.suspiciousActivityThreshold) {
      this.logSuspiciousActivity({
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        path: event.path,
        pattern: 'multiple_failed_logins',
        details: {
          failedAttempts: failedLogins,
          timeWindow: this.timeWindow,
        },
      });
    }

    // Check for rapid successive requests
    const recentRequests = recentEvents.filter(
      e => Date.now() - e.timestamp < 60000 // Last minute
    );
    if (recentRequests.length >= 20) {
      this.logSuspiciousActivity({
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        path: event.path,
        pattern: 'rapid_requests',
        details: {
          requestCount: recentRequests.length,
          timeWindow: 60000,
        },
      });
    }

    // Check for role escalation attempts
    const roleViolations = recentEvents.filter(e => e.type === 'role_violation').length;
    if (roleViolations >= 3) {
      this.logSuspiciousActivity({
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        path: event.path,
        pattern: 'role_escalation_attempts',
        details: {
          violations: roleViolations,
          timeWindow: this.timeWindow,
        },
      });
    }
  }

  /**
   * Log to console with appropriate level
   */
  private logToConsole(event: SecurityEvent): void {
    const logData = {
      id: event.id,
      type: event.type,
      severity: event.severity,
      timestamp: new Date(event.timestamp).toISOString(),
      user: event.userId ? `${event.userEmail} (${event.userId})` : 'anonymous',
      ip: event.ipAddress,
      path: event.path,
      details: event.details,
    };

    switch (event.severity) {
      case 'critical':
        console.error('🚨 CRITICAL SECURITY EVENT:', logData);
        break;
      case 'high':
        console.warn('⚠️  HIGH SECURITY EVENT:', logData);
        break;
      case 'medium':
        console.warn('⚡ MEDIUM SECURITY EVENT:', logData);
        break;
      case 'low':
        console.info('ℹ️  SECURITY EVENT:', logData);
        break;
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear old events (for maintenance)
   */
  clearOldEvents(olderThan: number): number {
    const initialCount = this.events.length;
    this.events = this.events.filter(event => event.timestamp > olderThan);
    return initialCount - this.events.length;
  }

  /**
   * Export events for external analysis
   */
  exportEvents(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['id', 'type', 'severity', 'timestamp', 'userId', 'userEmail', 'ipAddress', 'path', 'details'];
      const csvRows = [
        headers.join(','),
        ...this.events.map(event => [
          event.id,
          event.type,
          event.severity,
          new Date(event.timestamp).toISOString(),
          event.userId || '',
          event.userEmail || '',
          event.ipAddress,
          event.path,
          JSON.stringify(event.details).replace(/"/g, '""'),
        ].join(','))
      ];
      return csvRows.join('\n');
    }

    return JSON.stringify(this.events, null, 2);
  }
}

// Singleton instance
export const securityLogger = new SecurityLogger();

// Convenience functions
export const logAuthSuccess = securityLogger.logAuthSuccess.bind(securityLogger);
export const logAuthFailure = securityLogger.logAuthFailure.bind(securityLogger);
export const logUnauthorizedAccess = securityLogger.logUnauthorizedAccess.bind(securityLogger);
export const logRoleViolation = securityLogger.logRoleViolation.bind(securityLogger);
export const logSessionExpired = securityLogger.logSessionExpired.bind(securityLogger);
export const logSuspiciousActivity = securityLogger.logSuspiciousActivity.bind(securityLogger);
export const getSecurityMetrics = securityLogger.getMetrics.bind(securityLogger);
export const getSecurityEvents = securityLogger.getEvents.bind(securityLogger);