
import { downloadableFiles } from "@/lib/data";
import { FileCard } from "@/components/shared/file-card";

export function FeaturedForms() {
  const featuredFiles = downloadableFiles.filter(file => file.isFeatured);

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Get Started</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Essential documents to help you get started with our community.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {featuredFiles.map(file => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      </div>
    </section>
  );
}
