'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Upload, 
  LogIn, 
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function SecurityMonitoring() {
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Safely get auth context
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    // Auth context not available during SSR
    authContext = null;
  }
  
  const { token } = authContext || { token: null };

  // Safely use Convex hooks only on client side
  let healthMetrics, securityIncidents, suspiciousActivity, detectThreats, updateIncidentStatus;
  
  try {
    healthMetrics = isClient ? useQuery(api.monitoring?.getSystemHealthMetrics, 
      token ? { adminToken: token } : 'skip'
    ) : undefined;
    
    securityIncidents = isClient ? useQuery(api.monitoring?.getSecurityIncidents,
      token ? { adminToken: token, limit: 10 } : 'skip'
    ) : undefined;

    suspiciousActivity = isClient ? useQuery(api.security.detectSuspiciousActivity,
      token ? { token } : 'skip'
    ) : undefined;

    detectThreats = isClient ? useMutation(api.monitoring?.detectThreats) : null;
    updateIncidentStatus = isClient ? useMutation(api.monitoring?.updateIncidentStatus) : null;
  } catch (error) {
    // Convex not available
    healthMetrics = undefined;
    securityIncidents = undefined;
    suspiciousActivity = undefined;
    detectThreats = null;
    updateIncidentStatus = null;
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger re-fetch by updating a state variable or calling refetch if available
    }, 30000);

    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleRunThreatDetection = async () => {
    if (!detectThreats) {
      alert('Security monitoring service is not available. Please refresh the page.');
      return;
    }
    try {
      const result = await detectThreats({});
      alert(`Threat detection completed. ${result.threatsDetected} threats detected.`);
    } catch (error) {
      console.error('Error running threat detection:', error);
      alert('Failed to run threat detection.');
    }
  };

  const handleUpdateIncident = async (incidentId: string, status: string) => {
    if (!updateIncidentStatus || !token) {
      alert('Security monitoring service is not available. Please refresh the page.');
      return;
    }
    try {
      await updateIncidentStatus({
        adminToken: token,
        incidentId: incidentId as any,
        status: status as any,
      });
    } catch (error) {
      console.error('Error updating incident:', error);
      alert('Failed to update incident status.');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  // Show loading state if not on client side yet
  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Security Monitoring</h1>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading security monitoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Security Monitoring</h1>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRunThreatDetection} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Run Threat Detection
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {healthMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              {getHealthStatusIcon(healthMetrics.health.securityStatus)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {healthMetrics.health.securityStatus}
              </div>
              <p className="text-xs text-muted-foreground">
                Overall security health
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthMetrics.metrics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Currently active accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Login Success Rate</CardTitle>
              <LogIn className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthMetrics.health.loginSuccessRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Last hour success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {healthMetrics.metrics.openIncidents}
              </div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity Metrics */}
      {healthMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              System activity metrics for the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {healthMetrics.metrics.recentLogins}
                </div>
                <div className="text-sm text-gray-500">Successful Logins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {healthMetrics.metrics.failedLogins}
                </div>
                <div className="text-sm text-gray-500">Failed Logins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {healthMetrics.metrics.recentUploads}
                </div>
                <div className="text-sm text-gray-500">File Uploads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {healthMetrics.metrics.failedUploads}
                </div>
                <div className="text-sm text-gray-500">Failed Uploads</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suspicious Activity Alert */}
      {suspiciousActivity && suspiciousActivity.suspiciousUsers.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Suspicious Activity Detected</AlertTitle>
          <AlertDescription className="text-red-700">
            {suspiciousActivity.suspiciousUsers.length} user(s) with excessive failed attempts detected.
            Total failures in the last hour: {suspiciousActivity.totalFailures}
          </AlertDescription>
        </Alert>
      )}

      {/* Security Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Recent Security Incidents</span>
          </CardTitle>
          <CardDescription>
            Latest security incidents and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {securityIncidents && securityIncidents.length > 0 ? (
            <div className="space-y-4">
              {securityIncidents.map((incident) => (
                <div key={incident._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(incident.status)}>
                          {incident.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {incident.incidentType.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{incident.description}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(incident.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {incident.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateIncident(incident._id, 'investigating')}
                        >
                          Investigate
                        </Button>
                      )}
                      {incident.status === 'investigating' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateIncident(incident._id, 'resolved')}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No security incidents reported recently.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}