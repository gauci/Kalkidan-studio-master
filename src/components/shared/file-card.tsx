'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileIcon, DownloadIcon, TrashIcon } from 'lucide-react';

interface FileCardProps {
  file: {
    _id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: number;
    isPublic?: boolean;
  };
  onDownload?: (fileId: string) => void;
  onDelete?: (fileId: string) => void;
  showActions?: boolean;
}

export function FileCard({ file, onDownload, onDelete, showActions = true }: FileCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileIcon className="h-4 w-4" />
          {file.fileName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatFileSize(file.fileSize)}</span>
          <span>{formatDate(file.uploadedAt)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {file.fileType}
          </Badge>
          {file.isPublic && (
            <Badge variant="secondary" className="text-xs">
              Public
            </Badge>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2 pt-2">
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(file._id)}
                className="flex-1"
              >
                <DownloadIcon className="h-3 w-3 mr-1" />
                Download
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(file._id)}
                className="text-destructive hover:text-destructive"
              >
                <TrashIcon className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}