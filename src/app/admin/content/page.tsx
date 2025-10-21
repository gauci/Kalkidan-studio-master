'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ExternalLinkIcon, 
  PlusIcon, 
  SearchIcon, 
  RefreshCwIcon,
  FileTextIcon,
  MegaphoneIcon,
  CalendarIcon,
  FileIcon,
  EyeIcon,
  EditIcon
} from 'lucide-react'
import Link from 'next/link'
import { useAuthSafe } from '@/context/auth-context'
import { ContentStatus } from '@/components/shared/content-status'
import { ContentAnalytics } from '@/components/admin/content-analytics'

export default function AdminContentPage() {
  const { user } = useAuthSafe();
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true);
  }, []);
  const [contentStats, setContentStats] = useState({
    articles: { total: 12, published: 8, drafts: 4 },
    announcements: { total: 25, published: 20, drafts: 5 },
    events: { total: 8, published: 6, drafts: 2 },
    pages: { total: 15, published: 12, drafts: 3 },
  })

  const [recentContent, setRecentContent] = useState([
    {
      id: '1',
      type: 'article',
      title: 'Community Update: New Programs Launched',
      status: 'published',
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      author: 'Admin User',
    },
    {
      id: '2',
      type: 'announcement',
      title: 'Important: Meeting Schedule Change',
      status: 'published',
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      author: 'Admin User',
    },
    {
      id: '3',
      type: 'event',
      title: 'Annual Cultural Festival 2024',
      status: 'draft',
      lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      author: 'Admin User',
    },
  ])

  const handleRefreshContent = async () => {
    setIsLoading(true)
    // Simulate API call to refresh content from Sanity
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileTextIcon className="h-4 w-4" />
      case 'announcement': return <MegaphoneIcon className="h-4 w-4" />
      case 'event': return <CalendarIcon className="h-4 w-4" />
      case 'page': return <FileIcon className="h-4 w-4" />
      default: return <FileTextIcon className="h-4 w-4" />
    }
  }



  const refreshStats = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setContentStats({
        articles: { total: 12, published: 8, drafts: 4 },
        announcements: { total: 25, published: 20, drafts: 5 },
        events: { total: 8, published: 5, drafts: 3 },
        pages: { total: 6, published: 6, drafts: 0 },
      })
      setIsLoading(false)
    }, 1000)
  }

  useEffect(() => {
    if (isClient) {
      refreshStats()
    }
  }, [isClient])

  // Show loading state if not on client side yet
  if (!isClient) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading content management...</p>
      </div>
    )
  }

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
        <p className="text-muted-foreground">
          You need admin privileges to access content management.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-headline">Content Management</h1>
          <p className="text-muted-foreground">
            Manage articles, announcements, events, and pages
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshContent}
            disabled={isLoading}
          >
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="https://kalkidan-cms.sanity.studio" target="_blank">
              <ExternalLinkIcon className="h-4 w-4 mr-2" />
              Open Sanity Studio
            </Link>
          </Button>
        </div>
      </div>

      {/* Content Analytics */}
      <ContentAnalytics />

      {/* Content Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(contentStats).map(([type, stats]) => (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {type}
              </CardTitle>
              {getTypeIcon(type)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{stats.published} published</span>
                <span>{stats.drafts} drafts</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Management Tabs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Content</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Content</CardTitle>
                <div className="flex items-center space-x-2">
                  <SearchIcon className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentContent.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getTypeIcon(item.type)}
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span className="capitalize">{item.type}</span>
                          <span>•</span>
                          <span>{new Date(item.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <EditIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts">
          <Card>
            <CardHeader>
              <CardTitle>Draft Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No drafts available.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No scheduled content.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="https://kalkidan-cms.sanity.studio/structure/article" target="_blank">
                <FileTextIcon className="h-6 w-6 mb-2" />
                New Article
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="https://kalkidan-cms.sanity.studio/structure/announcement" target="_blank">
                <MegaphoneIcon className="h-6 w-6 mb-2" />
                New Announcement
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="https://kalkidan-cms.sanity.studio/structure/event" target="_blank">
                <CalendarIcon className="h-6 w-6 mb-2" />
                New Event
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="https://kalkidan-cms.sanity.studio/structure/page" target="_blank">
                <FileIcon className="h-6 w-6 mb-2" />
                New Page
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-headline">Content Management</h1>
          <p className="text-muted-foreground">
            Manage articles, announcements, events, and pages from Sanity CMS.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshStats} disabled={isLoading} variant="outline">
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href={process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || '/studio'} target="_blank">
            <Button>
              <ExternalLinkIcon className="h-4 w-4 mr-2" />
              Open Sanity Studio
            </Button>
          </Link>
        </div>
      </div>

      {/* Content Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Articles"
          icon={FileTextIcon}
          stats={contentStats.articles}
          createUrl="/studio/intent/create/template=article"
          viewUrl="/news/articles"
        />
        <StatCard
          title="Announcements"
          icon={MegaphoneIcon}
          stats={contentStats.announcements}
          createUrl="/studio/intent/create/template=announcement"
          viewUrl="/news/announcements"
        />
        <StatCard
          title="Events"
          icon={CalendarIcon}
          stats={contentStats.events}
          createUrl="/studio/intent/create/template=event"
          viewUrl="/events"
        />
        <StatCard
          title="Pages"
          icon={FileIcon}
          stats={contentStats.pages}
          createUrl="/studio/intent/create/template=page"
          viewUrl="/"
        />
      </div>

      {/* Content Management Tabs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Content</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Recent Content List */}
          <div className="space-y-4">
            {recentContent
              .filter(item => 
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.type.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((item) => (
                <ContentItem key={item.id} item={item} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="drafts">
          <Card>
            <CardHeader>
              <CardTitle>Draft Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Content in draft status will appear here. Connect to Sanity to see real data.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Content scheduled for future publication will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <ContentAnalytics />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <QuickActionButton
              title="New Article"
              description="Write a new article"
              icon={FileTextIcon}
              href="/studio/intent/create/template=article"
            />
            <QuickActionButton
              title="New Announcement"
              description="Create an announcement"
              icon={MegaphoneIcon}
              href="/studio/intent/create/template=announcement"
            />
            <QuickActionButton
              title="New Event"
              description="Schedule an event"
              icon={CalendarIcon}
              href="/studio/intent/create/template=event"
            />
            <QuickActionButton
              title="New Page"
              description="Create a new page"
              icon={FileIcon}
              href="/studio/intent/create/template=page"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ 
  title, 
  icon: Icon, 
  stats, 
  createUrl, 
  viewUrl 
}: {
  title: string
  icon: any
  stats: { total: number; published: number; drafts: number }
  createUrl: string
  viewUrl: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.total}</div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {stats.published} published
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {stats.drafts} drafts
          </Badge>
        </div>
        <div className="flex gap-2 mt-3">
          <Link href={createUrl} target="_blank">
            <Button variant="outline" size="sm" className="text-xs">
              <PlusIcon className="h-3 w-3 mr-1" />
              Create
            </Button>
          </Link>
          <Link href={viewUrl}>
            <Button variant="ghost" size="sm" className="text-xs">
              <EyeIcon className="h-3 w-3 mr-1" />
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function ContentItem({ item }: { item: any }) {
  const typeIcons = {
    article: FileTextIcon,
    announcement: MegaphoneIcon,
    event: CalendarIcon,
    page: FileIcon,
  }

  const Icon = typeIcons[item.type as keyof typeof typeIcons] || FileIcon

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{item.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={item.status === 'published' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {item.status}
                </Badge>
                <span className="text-xs text-muted-foreground capitalize">
                  {item.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  by {item.author}
                </span>
              </div>
              <ContentStatus 
                lastUpdated={item.lastUpdated}
                contentType={item.type}
                className="mt-2"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/studio/intent/edit/id=${item.id}`} target="_blank">
              <Button variant="ghost" size="sm">
                <EditIcon className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm">
              <EyeIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionButton({ 
  title, 
  description, 
  icon: Icon, 
  href 
}: {
  title: string
  description: string
  icon: any
  href: string
}) {
  return (
    <Link href={href} target="_blank">
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8 text-primary" />
            <div>
              <h4 className="font-medium">{title}</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}