'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface UserActivityProps {
  userId: Id<"users">;
  adminToken: string;
}

export default function UserActivity({ userId, adminToken }: UserActivityProps) {
  const [showDetails, setShowDetails] = useState(false);

  const activitySummary = useQuery(api.audit.getUserActivitySummary, {
    adminToken,
    userId,
  });

  const activityLogs = useQuery(
    api.audit.getUserAuditLogsAdmin,
    showDetails ? { adminToken, userId, limit: 20 } : 'skip'
  );
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionColor = (action: string, success: boolean) => {
    if (!success) return 'text-red-600';
    
    switch (action) {
      case 'upload': return 'text-green-600';
      case 'download': return 'text-blue-600';
      case 'delete': return 'text-red-600';
      case 'view': return 'text-gray-600';
      case 'update': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'upload': return '↑';
      case 'download': return '↓';
      case 'delete': return '×';
      case 'view': return '👁';
      case 'update': return '✏';
      default: return '•';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">User Activity</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {activitySummary ? (
        <>
          {showDetails ? (
            <div className="space-y-4">
              {/* Activity Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{activitySummary.totalActions}</div>
                  <div className="text-xs text-gray-500">Total Actions</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{activitySummary.successfulActions}</div>
                  <div className="text-xs text-gray-500">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600">{activitySummary.failedActions}</div>
                  <div className="text-xs text-gray-500">Failed</div>
                </div>
              </div>

              {/* Recent Activity Logs */}
              {activityLogs && activityLogs.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {activityLogs.map((log) => (
                      <div key={log._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getActionIcon(log.action)}</span>
                          <div>
                            <div className={`text-sm font-medium ${getActionColor(log.action, log.success)}`}>
                              {log.action.charAt(0).toUpperCase() + log.action.slice(1)} - {log.fileName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(log.timestamp)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {log.success ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Failed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-8">
                  No activity logs found for this user.
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{activitySummary.totalActions}</div>
                <div className="text-sm text-gray-500">Total Actions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {activitySummary.lastActivity ? formatDate(activitySummary.lastActivity) : 'Never'}
                </div>
                <div className="text-sm text-gray-500">Last Activity</div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="animate-pulse">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>
            <div className="text-center">
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}