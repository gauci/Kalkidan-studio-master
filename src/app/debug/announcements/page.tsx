import { getAnnouncements } from '@/lib/sanity-queries'

export default async function DebugAnnouncementsPage() {
  let announcements = []
  let error = null

  try {
    announcements = await getAnnouncements()
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error'
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug: Announcements from Sanity</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Environment Check:</h2>
        <p>Project ID: {process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'NOT SET'}</p>
        <p>Dataset: {process.env.NEXT_PUBLIC_SANITY_DATASET || 'NOT SET'}</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Announcements Count: {announcements.length}</h2>
      </div>

      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement: any) => (
            <div key={announcement._id} className="border p-4 rounded">
              <h3 className="font-semibold">{announcement.title}</h3>
              <p className="text-sm text-gray-600">ID: {announcement._id}</p>
              <p className="text-sm text-gray-600">Published: {announcement.isPublished ? 'Yes' : 'No'}</p>
              <p className="text-sm text-gray-600">Summary: {announcement.summary}</p>
              <p className="text-sm text-gray-600">Priority: {announcement.priority}</p>
              <p className="text-sm text-gray-600">Published At: {announcement.publishedAt}</p>
              <p className="text-sm text-gray-600">Banner Image: {announcement.bannerImage ? 'Yes' : 'No'}</p>
              {announcement.bannerImage && (
                <p className="text-sm text-gray-600">Image URL: {announcement.bannerImage.asset?.url}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No announcements found. This could mean:</p>
      )}
      
      <div className="mt-8 text-sm text-gray-600">
        <h3 className="font-semibold">Troubleshooting:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Check if announcements are published in Sanity Studio</li>
          <li>Verify the isPublished field is set to true</li>
          <li>Check if SANITY_API_TOKEN is properly configured</li>
          <li>Ensure the Sanity project ID and dataset are correct</li>
        </ul>
      </div>
    </div>
  )
}