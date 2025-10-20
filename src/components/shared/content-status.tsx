'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCwIcon, ClockIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react'
import { formatLastUpdated, isContentStale } from '@/lib/content-refresh'

interface ContentStatusProps {
  lastUpdated: string | Date
  contentType: string
  onRefresh?: () => Promise<void>
  className?: string
}

export function ContentStatus({ 
  lastUpdated, 
  contentType, 
  onRefresh,
  className = '' 
}: ContentStatusProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    if (!onRefresh) return

    setIsRefreshing(true)
    setRefreshError(null)

    try {
      await onRefresh()
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : 'Refresh failed')
    } finally {
      setIsRefreshing(false)
    }
  }

  const isStale = isContentStale(lastUpdated)
  const formattedTime = formatLastUpdated(lastUpdated)

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {/* Status Indicator */}
      <div className="flex items-center gap-1">
        {isStale ? (
          <AlertCircleIcon className="h-3 w-3 text-orange-500" />
        ) : (
          <CheckCircleIcon className="h-3 w-3 text-green-500" />
        )}
        <ClockIcon className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">{formattedTime}</span>
      </div>

      {/* Status Badge */}
      <Badge 
        variant={isStale ? "secondary" : "outline"}
        className="text-xs"
      >
        {isStale ? 'May be outdated' : 'Up to date'}
      </Badge>

      {/* Refresh Button */}
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-6 px-2"
        >
          <RefreshCwIcon className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      )}

      {/* Error Message */}
      {refreshError && (
        <Badge variant="destructive" className="text-xs">
          {refreshError}
        </Badge>
      )}
    </div>
  )
}

// Simplified version for inline use
export function InlineContentStatus({ lastUpdated }: { lastUpdated: string | Date }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const isStale = isContentStale(lastUpdated)
  const formattedTime = formatLastUpdated(lastUpdated)

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {isStale ? (
        <AlertCircleIcon className="h-3 w-3 text-orange-500" />
      ) : (
        <CheckCircleIcon className="h-3 w-3 text-green-500" />
      )}
      <span>Updated {formattedTime}</span>
    </div>
  )
}