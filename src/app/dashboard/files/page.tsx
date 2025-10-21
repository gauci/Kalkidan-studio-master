'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Download, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { FileUpload } from '@/components/dashboard/file-upload';
import { FileList } from '@/components/dashboard/file-list';
import { FileStats } from '@/components/dashboard/file-stats';

export default function FilesPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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
  
  const { user } = authContext || { user: null };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    setRefreshTrigger(prev => prev + 1);
  };

  // Show loading state if not on client side yet
  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading file management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-headline">File Management</h1>
          <p className="text-muted-foreground">
            Upload, organize, and manage your files securely.
          </p>
        </div>
        <Button 
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {showUpload ? 'Cancel Upload' : 'Upload Files'}
        </Button>
      </div>

      {/* File Statistics */}
      <FileStats key={refreshTrigger} />

      {/* File Upload Section */}
      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </CardContent>
        </Card>
      )}

      {/* File List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileList key={refreshTrigger} onFileChange={() => setRefreshTrigger(prev => prev + 1)} />
        </CardContent>
      </Card>
    </div>
  );
}