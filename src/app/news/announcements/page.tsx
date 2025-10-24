import { getAnnouncements } from '@/lib/sanity-queries'
import { getImageUrl } from '@/lib/sanity-image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarIcon, SearchIcon, ArrowLeftIcon, AlertTriangleIcon, UsersIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Announcements - Kalkidan',
  description: 'Important announcements and updates from the Kalkidan community.',
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements()

  // Separate pinned and regular announcements
  const pinnedAnnouncements = announcements.filter((a: any) => a.isPinned)
  const regularAnnouncements = announcements.filter((a: any) => !a.isPinned)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        {/* Navigation */}
        <Link href="/news">
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to News
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-headline">📢 Community Announcements</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay informed with important updates and announcements from our community.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search announcements..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Pinned Announcements */}
        {pinnedAnnouncements.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              📌 Pinned Announcements
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pinnedAnnouncements.map((announcement) => (
                <AnnouncementCard key={announcement._id} announcement={announcement} />
              ))}
            </div>
          </section>
        )}

        {/* Regular Announcements */}
        {regularAnnouncements.length > 0 && (
          <section className="space-y-4">
            {pinnedAnnouncements.length > 0 && (
              <h2 className="text-xl font-semibold">Recent Announcements</h2>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {regularAnnouncements.map((announcement) => (
                <AnnouncementCard key={announcement._id} announcement={announcement} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {announcements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-xl font-semibold mb-2">No announcements available</h3>
            <p className="text-muted-foreground">
              Check back soon for important updates from our community.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function AnnouncementCard({ announcement }: { announcement: any }) {
  const priorityColors = {
    urgent: 'destructive',
    high: 'secondary',
    normal: 'outline',
    low: 'outline',
  }

  const priorityEmojis = {
    urgent: '🚨',
    high: '⚠️',
    normal: '📢',
    low: '💬',
  }

  const isExpiringSoon = announcement.expiresAt && 
    new Date(announcement.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 // 7 days

  return (
    <Link href={`/news/announcements/${announcement.slug.current}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
        {announcement.bannerImage && (
          <div className="relative w-full h-48">
            <Image
              src={getImageUrl(announcement.bannerImage, 400, 200) || ''}
              alt={announcement.bannerImage.alt || announcement.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-lg line-clamp-2">
              {announcement.title}
            </CardTitle>
            {announcement.isPinned && (
              <Badge variant="secondary" className="shrink-0">
                📌
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={priorityColors[announcement.priority as keyof typeof priorityColors]}>
              {priorityEmojis[announcement.priority as keyof typeof priorityEmojis]} {announcement.priority}
            </Badge>
            {isExpiringSoon && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                <AlertTriangleIcon className="h-3 w-3 mr-1" />
                Expires Soon
              </Badge>
            )}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {new Date(announcement.publishedAt).toLocaleDateString()}
            {announcement.expiresAt && (
              <>
                <span className="mx-2">•</span>
                <span>Expires {new Date(announcement.expiresAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {announcement.summary}
          </p>
          
          {announcement.targetAudience && (
            <div className="flex items-center gap-2 mb-3">
              <UsersIcon className="h-3 w-3 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {announcement.targetAudience.slice(0, 2).map((audience: string) => (
                  <Badge key={audience} variant="outline" className="text-xs">
                    {audience === 'all' ? 'All Members' : 
                     audience === 'board' ? 'Board' :
                     audience === 'committee' ? 'Committee' :
                     audience === 'volunteers' ? 'Volunteers' :
                     audience === 'donors' ? 'Donors' : audience}
                  </Badge>
                ))}
                {announcement.targetAudience.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{announcement.targetAudience.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {announcement.attachments && announcement.attachments.length > 0 && (
            <div className="text-xs text-muted-foreground">
              📎 {announcement.attachments.length} attachment{announcement.attachments.length > 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}