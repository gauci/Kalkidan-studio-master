'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Download, Trash2, Shield, Eye, FileText } from 'lucide-react';

export default function PrivacySettings() {
  const { user, token } = useAuth();
  const [confirmationText, setConfirmationText] = useState('');
  const [privacyPreferences, setPrivacyPreferences] = useState({
    allowAnalytics: false,
    allowMarketing: false,
    allowDataSharing: false,
  });

  // Queries and mutations
  const privacyStatus = useQuery(api.privacy.getPrivacyPolicyStatus, 
    token ? { token } : 'skip'
  );
  
  const exportUserData = useQuery(api.privacy.exportUserData,
    token ? { token } : 'skip'
  );

  const requestDeletion = useMutation(api.privacy.requestAccountDeletion);
  const updatePreferences = useMutation(api.privacy.updatePrivacyPreferences);

  const handleExportData = () => {
    if (exportUserData) {
      const dataStr = JSON.stringify(exportUserData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleDeleteAccount = async () => {
    if (!token || confirmationText !== 'DELETE MY ACCOUNT') {
      alert('Please type "DELETE MY ACCOUNT" exactly to confirm.');
      return;
    }

    try {
      await requestDeletion({
        token,
        confirmationText,
      });
      alert('Account deletion requested. You will be logged out.');
      // The user will be logged out automatically due to session deactivation
      window.location.href = '/';
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      alert('Failed to request account deletion. Please try again.');
    }
  };

  const handleUpdatePreferences = async () => {
    if (!token) return;

    try {
      await updatePreferences({
        token,
        preferences: privacyPreferences,
      });
      alert('Privacy preferences updated successfully.');
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Failed to update privacy preferences. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please log in to access privacy settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Privacy & Data Settings</h1>
      </div>

      {/* Privacy Policy Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Privacy Policy</span>
          </CardTitle>
          <CardDescription>
            Your privacy policy acceptance status and data handling preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {privacyStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Policy Version:</span>
                <span className="text-sm text-gray-600">{privacyStatus.privacyPolicyVersion}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Accepted:</span>
                <span className="text-sm text-gray-600">
                  {new Date(privacyStatus.acceptedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Privacy policy accepted</span>
              </div>
            </div>
          ) : (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Data Usage Preferences</span>
          </CardTitle>
          <CardDescription>
            Control how your data is used for analytics, marketing, and sharing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics">Analytics</Label>
                <p className="text-sm text-gray-500">
                  Allow us to collect anonymous usage data to improve our services.
                </p>
              </div>
              <Switch
                id="analytics"
                checked={privacyPreferences.allowAnalytics}
                onCheckedChange={(checked) =>
                  setPrivacyPreferences(prev => ({ ...prev, allowAnalytics: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing">Marketing Communications</Label>
                <p className="text-sm text-gray-500">
                  Receive emails about new features, updates, and promotional content.
                </p>
              </div>
              <Switch
                id="marketing"
                checked={privacyPreferences.allowMarketing}
                onCheckedChange={(checked) =>
                  setPrivacyPreferences(prev => ({ ...prev, allowMarketing: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sharing">Data Sharing</Label>
                <p className="text-sm text-gray-500">
                  Allow sharing of anonymized data with trusted partners for research.
                </p>
              </div>
              <Switch
                id="sharing"
                checked={privacyPreferences.allowDataSharing}
                onCheckedChange={(checked) =>
                  setPrivacyPreferences(prev => ({ ...prev, allowDataSharing: checked }))
                }
              />
            </div>
          </div>

          <Button onClick={handleUpdatePreferences} className="w-full">
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Your Data</span>
          </CardTitle>
          <CardDescription>
            Download a copy of all your personal data stored in our system (GDPR compliance).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exportUserData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Your Data Summary:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Personal Information: Name, email, phone, address</li>
                  <li>• Files: {exportUserData.summary.totalFiles} uploaded files</li>
                  <li>• Sessions: {exportUserData.summary.totalSessions} login sessions</li>
                  <li>• Activity: {exportUserData.summary.totalAuditLogs} audit log entries</li>
                </ul>
              </div>
            )}
            
            <Button onClick={handleExportData} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download My Data (JSON)
            </Button>
            
            <p className="text-xs text-gray-500">
              The export includes all personal data, uploaded files metadata, login history, 
              and activity logs. File contents are not included in the export.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            <span>Delete Account</span>
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">What will be deleted:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Your account and profile information</li>
                <li>• All uploaded files and documents</li>
                <li>• Login sessions and activity history</li>
                <li>• Privacy preferences and settings</li>
              </ul>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Request Account Deletion
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers within 30 days.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="confirmation">
                      Type "DELETE MY ACCOUNT" to confirm:
                    </Label>
                    <Input
                      id="confirmation"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="DELETE MY ACCOUNT"
                      className="mt-2"
                    />
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmationText('')}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={confirmationText !== 'DELETE MY ACCOUNT'}
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <p className="text-xs text-gray-500">
              Account deletion requests are processed within 30 days. During this period, 
              your account will be deactivated but data can still be recovered if you contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}