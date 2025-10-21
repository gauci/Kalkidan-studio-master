'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  File, 
  Download, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  EyeOff,
  FileText,
  FileImage,
  FileSpreadsheet,
} from 'lucide-react';

interface FileListProps {
  onFileChange: () => void;
}

export function FileList({ onFileChange }: FileListProps) {
  // Safely get auth context
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    // Auth context not available
    authContext = null;
  }
  
  const { user } = authContext || { user: null };
  const { toast } = useToast();
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);

  const sessionToken = typeof window !== 'undefined' ? localStorage.getItem('sessionToken') : null;
  
  // Safely use Convex hooks
  let files, getFileUrl, deleteFile;
  try {
    files = useQuery(
      api.files.getUserFiles,
      sessionToken ? { token: sessionToken } : 'skip'
    );
    getFileUrl = useMutation(api.files.getFileUrl);
    deleteFile = useMutation(api.files.deleteFile);
  } catch (error) {
    files = undefined;
    getFileUrl = null;
    deleteFile = null;
  }

  const handleDownload = async (fileId: string) => {
    if (!sessionToken) return;
    
    try {
      const result = await getFileUrl({ token: sessionToken, fileId: fileId as any });
      if (result.url) {
        // Create a temporary link and click it to download
        const link = document.createElement('a');
        link.href = result.url;
        link.download = result.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      toast({
        title: "Download Error",
        description: error instanceof Error ? error.message : "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!sessionToken) return;
    
    try {
      await deleteFile({ token: sessionToken, fileId: fileId as any });
      toast({
        title: "File Deleted",
        description: "File has been successfully deleted.",
      });
      onFileChange();
    } catch (error) {
      toast({
        title: "Delete Error",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
    } finally {
      setDeleteFileId(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FileImage className="h-4 w-4" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return <FileSpreadsheet className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!files) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No files uploaded yet</h3>
        <p className="text-muted-foreground">
          Upload your first file to get started with file management.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.fileType)}
                    <span className="truncate max-w-[200px]" title={file.fileName}>
                      {file.fileName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {file.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                  </Badge>
                </TableCell>
                <TableCell>{formatFileSize(file.fileSize)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {file.isPublic ? (
                      <>
                        <Eye className="h-3 w-3" />
                        <span className="text-xs">Public</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span className="text-xs">Private</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(file.uploadedAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(file.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteFileId(file.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteFileId} onOpenChange={() => setDeleteFileId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteFileId && handleDelete(deleteFileId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}