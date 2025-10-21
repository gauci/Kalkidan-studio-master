import { notFound } from 'next/navigation'
import { getAnnouncementBySlug, getAnnouncements } from '@/lib/sanity-queries'
import { PortableTextRenderer } from '@/components/shared/portable-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, ArrowLeftIcon, ShareIcon, DownloadIcon, UsersIcon, AlertTriangleIcon } from 'lucide-react'
import Link from 'next/link'

interface AnnouncementPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  try {
    const announcements = await getAnnouncements()
    if (!announcements || announcements.length === 0) {
      return []
    }
    return announcements.map((announcement: any) => ({
      slug: announcement.slug?.current || announcement.slug,
    })).filter((param: any) => param.slug) // Filter out any invalid slugs
  } catch (error) {
    console.warn('Failed to generate static params for announcements:', error)
    return []
  }
}

export async function generateMetadata({ params }: AnnouncementPageProps) {
  try {
    const announcement = await getAnnouncementBySlug(params.slug)
    
    if (!announcement) {
      return {
        title: 'Announcement Not Found - Kalkidan',
        description: 'The requested announcement could not be found.',
      }
    }

    return {
      title: `${announcement.title} - Kalkidan Announcements`,
      description: announcement.summary || `Read ${announcement.title} announcement from Kalkidan`,
    }
  } catch (error) {
    console.error('Error generating metadata for announcement:', error)
    return {
      title: 'Announcement - Kalkidan',
      description: 'Kalkidan community announcements.',
    }
  }
}

export default async function AnnouncementPage({ params }: AnnouncementPageProps) {
  try {
    const announcement = await getAnnouncementBySlug(params.slug)

    if (!announcement) {
      notFound()
    }

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
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/news">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to News
            </Button>
          </Link>
        </div>

        {/* Announcement Header */}
        <header className="mb-8 space-y-6">
          {/* Priority and Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={priorityColors[announcement.priority as keyof typeof priorityColors] as "destructive" | "secondary" | "outline" | "default"} className="text-sm">
              {priorityEmojis[announcement.priority as keyof typeof priorityEmojis]} {announcement.priority.toUpperCase()} PRIORITY
            </Badge>
            {announcement.isPinned && (
              <Badge variant="secondary">
                📌 Pinned
              </Badge>
            )}
            {isExpiringSoon && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                <AlertTriangleIcon className="h-3 w-3 mr-1" />
                Expires Soon
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-headline leading-tight">
              {announcement.title}
            </h1>
            
            {announcement.summary && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {announcement.summary}
              </p>
            )}
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Published: {new Date(announcement.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            {announcement.expiresAt && (
              <div className="flex items-center">
                <AlertTriangleIcon className="h-4 w-4 mr-2" />
                Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
              </div>
            )}
            <Button variant="ghost" size="sm">
              <ShareIcon className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Target Audience */}
          {announcement.targetAudience && announcement.targetAudience.length > 0 && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Target Audience
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {announcement.targetAudience.map((audience: string) => (
                    <Badge key={audience} variant="outline">
                      {audience === 'all' ? 'All Members' : 
                       audience === 'board' ? 'Board Members' :
                       audience === 'committee' ? 'Committee Members' :
                       audience === 'volunteers' ? 'Volunteers' :
                       audience === 'donors' ? 'Donors' : audience}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </header>

        {/* Announcement Content */}
        <article className="prose prose-lg max-w-none mb-8">
          <PortableTextRenderer content={announcement.content} />
        </article>

        {/* Attachments */}
        {announcement.attachments && announcement.attachments.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DownloadIcon className="h-5 w-5 mr-2" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {announcement.attachments.map((attachment: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{attachment.title || `Attachment ${index + 1}`}</h4>
                      {attachment.description && (
                        <p className="text-sm text-muted-foreground">{attachment.description}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Announcement Footer */}
        <footer className="pt-8 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date(announcement._updatedAt).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <ShareIcon className="h-4 w-4 mr-2" />
                Share Announcement
              </Button>
              <Link href="/news">
                <Button variant="outline" size="sm">
                  More Announcements
                </Button>
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
  } catch (error) {
    console.error('Error rendering announcement page:', error)
    
    // Return a fallback error page
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-headline mb-4">Announcement Unavailable</h1>
          <p className="text-muted-foreground mb-6">
            We're sorry, but this announcement is currently unavailable. This might be due to a temporary issue with our content system.
          </p>
          <Link href="/news">
            <Button>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to News
            </Button>
          </Link>
        </div>
      </div>
    )
  }
}