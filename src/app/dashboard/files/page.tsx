import dynamic from 'next/dynamic';

const DynamicFilesPage = dynamic(() => import('./files-client'), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading file management...</p>
      </div>
    </div>
  ),
});

export default function FilesPage() {
  return <DynamicFilesPage />;
}