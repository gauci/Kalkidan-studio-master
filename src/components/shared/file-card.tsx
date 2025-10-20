
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import type { DownloadableFile } from "@/lib/data";

type FileCardProps = {
  file: DownloadableFile;
};

export function FileCard({ file }: FileCardProps) {
  return (
    <Card className="flex flex-col border-primary/20 hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start gap-4">
        <FileText className="h-8 w-8 text-primary mt-1" />
        <div>
          <CardTitle className="text-xl">{file.name}</CardTitle>
          <CardDescription className="mt-1">{file.description}</CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="mt-auto">
        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href={file.url} target="_blank" download>
            <Download className="mr-2 h-4 w-4" /> Download
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
