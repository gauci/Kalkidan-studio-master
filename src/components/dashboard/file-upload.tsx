'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, File, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
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
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Safely use Convex hooks
  let generateUploadUrl, createFileRecord;
  try {
    generateUploadUrl = useMutation(api.files.generateUploadUrl);
    createFileRecord = useMutation(api.files.createFileRecord);
  } catch (error) {
    generateUploadUrl = null;
    createFileRecord = null;
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending' as const,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': uploadFile.file.type },
        body: uploadFile.file,
      });

      if (!result.ok) {
        throw new Error('Failed to upload file');
      }

      const { storageId } = await result.json();

      // Update progress
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, progress: 50 } : f
      ));

      // Create file record in database
      const sessionToken = typeof window !== 'undefined' ? localStorage.getItem('sessionToken') : null;
      if (!sessionToken) {
        throw new Error('No session token');
      }

      await createFileRecord({
        token: sessionToken,
        fileName: uploadFile.file.name,
        fileType: uploadFile.file.type,
        fileSize: uploadFile.file.size,
        storageId,
        isPublic,
        description: description.trim() || undefined,
      });

      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f
      ));

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f
      ));
    }
  };

  const uploadAllFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const file of files.filter(f => f.status === 'pending')) {
        await uploadFile(file);
      }

      const successCount = files.filter(f => f.status === 'success').length;
      if (successCount > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${successCount} file(s).`,
        });
        onUploadSuccess();
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Some files failed to upload. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-lg">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
            <p className="text-sm text-muted-foreground">
              Supports: Images, PDF, Word, Excel, Text files (max 10MB each)
            </p>
          </div>
        )}
      </div>

      {/* File Settings */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public">Make files public</Label>
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description for these files..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Files to upload:</h4>
          {files.map((uploadFile) => (
            <div key={uploadFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <File className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(uploadFile.file.size)}
                </p>
                {uploadFile.status === 'uploading' && (
                  <Progress value={uploadFile.progress} className="mt-1" />
                )}
                {uploadFile.status === 'error' && (
                  <p className="text-xs text-destructive mt-1">{uploadFile.error}</p>
                )}
              </div>
              {uploadFile.status === 'success' && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {uploadFile.status === 'pending' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(uploadFile.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex gap-2">
          <Button 
            onClick={uploadAllFiles}
            disabled={isUploading || files.every(f => f.status !== 'pending')}
            className="flex-1"
          >
            {isUploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} Files`}
          </Button>
          <Button 
            variant="outline"
            onClick={() => setFiles([])}
            disabled={isUploading}
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}