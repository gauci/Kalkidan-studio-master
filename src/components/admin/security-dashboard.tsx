'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Eye, 
  Download,
  RefreshCw,
  Clock,
  MapPin,
  User
} from 'lucide-react';
import { getSecurityMetrics, getSecurityEvents, SecurityEvent, SecurityMetrics } from '@/lib/security-logger';

interface SecurityDashboardProps {
  className?: string;
}

export function SecurityDashboard({ className }: SecurityDashboardProps) {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load security data
  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const securityMetrics = getSecurityMetrics();
      const recentEvents = getSecurityEvents({ limit: 100 });
      
      setMetrics(securityMetrics);
      setEvents(recentEvents);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    loadSecurityData();
    
    if (autoRefresh) {
      const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Filter events by type
  const filteredEvents = selectedEventType === 'all' 
    ? events 
    : events.filter(event => event.type === selectedEventType);

  // Get severity color
  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  // Get event type icon
  const getEventTypeIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'auth_success': return <Shield className="h-4 w-4 text-green-500" />;
      case 'auth_failure': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'unauthorized_access': return <Eye className="h-4 w-4 text-orange-500" />;
      case 'role_violation': return <Users className="h-4 w-4 text-red-500" />;
      case 'session_expired': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  // Export security data
  const exportData = (format: 'json' | 'csv') => {
    const data = format === 'json' 
      ? JSON.stringify(events, null, 2)
      : events.map(event => ({
          id: event.id,
          type: event.type,
          severity: event.severity,
          timestamp: new Date(event.timestamp).toISOString(),
          user: event.userEmail || 'anonymous',
          ip: event.ipAddress,
          path: event.path,
          details: JSON.stringify(event.details)
        }));

    const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data)], {
      type: format === 'json' ? 'application/json' : 'text/csv'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-events-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading security data...</span>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load security metrics.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Monitoring</h2>
          <p className="text-muted-foreground">
            Monitor authentication events and security threats
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
          </Button>
          <Button variant="outline" size="sm" onClick={loadSecurityData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {metrics.suspiciousIPs.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Suspicious Activity Detected</AlertTitle>
          <AlertDescription>
            {metrics.suspiciousIPs.length} IP address(es) showing suspicious behavior: {metrics.suspiciousIPs.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.failedLoginAttempts}</div>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.eventsBySeverity.critical || 0}
            </div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious IPs</CardTitle>
            <MapPin className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.suspiciousIPs.length}
            </div>
            <p className="text-xs text-muted-foreground">Flagged for review</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed View */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {/* Event Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Filter by type:</span>
            <Button
              variant={selectedEventType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedEventType('all')}
            >
              All ({events.length})
            </Button>
            {Object.entries(metrics.eventsByType).map(([type, count]) => (
              <Button
                key={type}
                variant={selectedEventType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedEventType(type)}
              >
                {type.replace('_', ' ')} ({count})
              </Button>
            ))}
          </div>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                Recent security events and authentication attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredEvents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No events found for the selected filter.
                  </p>
                ) : (
                  filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50"
                    >
                      <div className="mt-1">
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {event.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <Badge variant={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-4">
                            {event.userEmail && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {event.userEmail}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.ipAddress}
                            </span>
                            <span>{event.path}</span>
                          </div>
                          {Object.keys(event.details).length > 0 && (
                            <details className="text-xs">
                              <summary className="cursor-pointer hover:text-foreground">
                                View details
                              </summary>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                {JSON.stringify(event.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Events by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics.eventsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{type.replace('_', ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Events by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics.eventsBySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{severity}</span>
                      <Badge variant={getSeverityColor(severity as SecurityEvent['severity'])}>
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Security Data</CardTitle>
              <CardDescription>
                Download security events for external analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={() => exportData('json')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
                <Button variant="outline" onClick={() => exportData('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Exports include all security events with timestamps, user information, 
                IP addresses, and event details for comprehensive analysis.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}