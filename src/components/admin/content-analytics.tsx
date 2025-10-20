'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUpIcon, 
  EyeIcon, 
  ClockIcon, 
  CalendarIcon,
  BarChart3Icon 
} from 'lucide-react'

interface ContentAnalyticsProps {
  timeRange?: '7d' | '30d' | '90d'
}

export function ContentAnalytics({ timeRange = '30d' }: ContentAnalyticsProps) {
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalContent: 0,
    publishedThisMonth: 0,
    averageReadTime: 0,
    topContent: [],
    contentByType: {
      articles: 0,
      announcements: 0,
      events: 0,
      pages: 0,
    },
    publishingTrend: [],
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalytics = async () => {
      setIsLoading(true)
      
      // Mock data - replace with real analytics API
      setTimeout(() => {
        setAnalytics({
          totalViews: 12450,
          totalContent: 51,
          publishedThisMonth: 8,
          averageReadTime: 3.2,
          topContent: [
            { title: 'Community Update: New Programs', views: 1250, type: 'article' },
            { title: 'Important Meeting Notice', views: 980, type: 'announcement' },
            { title: 'Cultural Festival 2024', views: 750, type: 'event' },
          ],
          contentByType: {
            articles: 12,
            announcements: 25,
            events: 8,
            pages: 6,
          },
          publishingTrend: [
            { date: '2024-01-01', count: 3 },
            { date: '2024-01-08', count: 5 },
            { date: '2024-01-15', count: 2 },
            { date: '2024-01-22', count: 4 },
          ],
        })
        setIsLoading(false)
      }, 1000)
    }

    loadAnalytics()
  }, [timeRange])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Views"
          value={analytics.totalViews.toLocaleString()}
          icon={EyeIcon}
          trend="+12%"
          trendUp={true}
        />
        <MetricCard
          title="Total Content"
          value={analytics.totalContent.toString()}
          icon={BarChart3Icon}
          trend="+3 this month"
          trendUp={true}
        />
        <MetricCard
          title="Published This Month"
          value={analytics.publishedThisMonth.toString()}
          icon={CalendarIcon}
          trend="8 pieces"
          trendUp={true}
        />
        <MetricCard
          title="Avg. Read Time"
          value={`${analytics.averageReadTime} min`}
          icon={ClockIcon}
          trend="+0.3 min"
          trendUp={true}
        />
      </div>

      {/* Content Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content by Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analytics.contentByType).map(([type, count]) => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{type}</span>
                  <span>{count}</span>
                </div>
                <Progress 
                  value={(count / analytics.totalContent) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.topContent.map((content, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{content.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {content.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {content.views} views
                    </span>
                  </div>
                </div>
                <TrendingUpIcon className="h-4 w-4 text-green-500" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Publishing Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Content published over the last {timeRange}
          </div>
          <div className="h-32 flex items-end justify-between gap-2">
            {analytics.publishingTrend.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div 
                  className="bg-primary rounded-t w-8"
                  style={{ height: `${(item.count / 5) * 100}%` }}
                ></div>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp 
}: {
  title: string
  value: string
  icon: any
  trend: string
  trendUp: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </p>
      </CardContent>
    </Card>
  )
}