import { Suspense } from 'react'
import { getArticles, getAnnouncements } from '@/lib/sanity-queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarIcon, ClockIcon, UserIcon, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export const metadata = {
  title: 'News & Announcements - Kalkidan',
  description: 'Stay updated with the latest news, announcements, and articles from the Kalkidan community.',
}

export default async function NewsPage() {
  const [articles, announcements] = await Promise.all([
    getArticles(),
    getAnnouncements(),
  ])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-headline">News & Updates</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest news, announcements, and stories from our community.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search articles and announcements..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">📢 Community Announcements</h2>
              <Link href="/news/announcements">
                <Button variant="outline" size="sm">
                  View All Announcements
                </Button>
              </Link>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {announcements.slice(0, 6).map((announcement: Announcement) => (
                <AnnouncementCard key={announcement._id} announcement={announcement} />
              ))}
            </div>
          </section>
        )}

        {/* Articles Section */}
        {articles.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">📝 Latest Articles</h2>
              <Link href="/news/articles">
                <Button variant="outline" size="sm">
                  View All Articles
                </Button>
              </Link>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.slice(0, 6).map((article: Article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {articles.length === 0 && announcements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold mb-2">No content available yet</h3>
            <p className="text-muted-foreground">
              Check back soon for the latest news and announcements from our community.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface Announcement {
  _id: string
  title: string
  slug: { current: string }
  summary: string
  priority: 'urgent' | 'high' | 'normal' | 'low'
  targetAudience: string[]
  publishedAt: string
  isPinned: boolean
}

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
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

  return (
    <Link href={`/news/announcements/${announcement.slug.current}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2">
              {announcement.title}
            </CardTitle>
            {announcement.isPinned && (
              <Badge variant="secondary" className="shrink-0">
                📌 Pinned
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={priorityColors[announcement.priority] as "destructive" | "secondary" | "outline"}>
              {priorityEmojis[announcement.priority]} {announcement.priority}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {new Date(announcement.publishedAt).toLocaleDateString()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {announcement.summary}
          </p>
          {announcement.targetAudience && (
            <div className="mt-3 flex flex-wrap gap-1">
              {announcement.targetAudience.slice(0, 2).map((audience: string) => (
                <Badge key={audience} variant="outline" className="text-xs">
                  {audience === 'all' ? 'All Members' : audience}
                </Badge>
              ))}
              {announcement.targetAudience.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{announcement.targetAudience.length - 2} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

interface Article {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  content: any[]
  featuredImage?: any
  categories?: Array<{ title: string; slug: { current: string } }>
  publishedAt: string
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/news/articles/${article.slug.current}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
        {article.featuredImage && (
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={urlFor(article.featuredImage).width(400).height(225).fit('crop').auto('format').url()}
              alt={article.featuredImage.alt || article.title}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          </div>
        )}
        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-2">
            {article.title}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {new Date(article.publishedAt).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" />
              {Math.ceil(article.content?.length / 200) || 1} min read
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {article.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {article.excerpt}
            </p>
          )}
          {article.categories && article.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {article.categories.slice(0, 3).map((category: any) => (
                <Badge key={category.slug.current} variant="outline" className="text-xs">
                  {category.title}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}