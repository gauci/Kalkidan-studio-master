
import { downloadableFiles } from "@/lib/data";
import { FileCard } from "@/components/shared/file-card";

export default function DownloadsPage() {
  const featuredFiles = downloadableFiles.filter((file) => file.isFeatured);
  const otherFiles = downloadableFiles.filter((file) => !file.isFeatured);

  return (
    <div className="bg-pattern">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Downloads
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
            Find all necessary forms, guides, and documents here.
          </p>
        </div>

        <section className="mt-12">
          <h2 className="text-3xl font-bold font-headline mb-8">
            Featured Documents
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {featuredFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </section>

        {otherFiles.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-bold font-headline mb-8">
              Other Documents
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {otherFiles.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
