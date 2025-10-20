
'use client'

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText, Trash2 } from "lucide-react";
import { downloadableFiles } from "@/lib/data";

export default function AdminFilesPage() {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload logic here
      console.log(e.dataTransfer.files[0]);
      toast({
        title: "File Uploaded",
        description: `${e.dataTransfer.files[0].name} has been uploaded.`,
      });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        console.log(e.target.files[0]);
        toast({
            title: "File Selected",
            description: `${e.target.files[0].name} is ready to be uploaded.`,
        });
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card onDragEnter={handleDrag}>
          <CardHeader>
            <CardTitle>Upload New File</CardTitle>
            <CardDescription>
              Upload PDF or DOC files (max 5MB).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label
              htmlFor="dropzone-file"
              className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted ${dragActive ? "border-primary" : "border-border"}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PDF, DOC (MAX. 5MB)</p>
              </div>
              <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
               {dragActive && <div className="absolute inset-0 w-full h-full" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
            </label>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Upload</Button>
          </CardFooter>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>Manage existing files.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {downloadableFiles.map(file => (
                <li key={file.id} className="flex items-center justify-between p-3 rounded-md border bg-secondary">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary"/>
                    <span className="font-medium">{file.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4"/>
                    <span className="sr-only">Delete file</span>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
