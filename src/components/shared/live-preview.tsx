'use client'

import { useEffect, useState } from 'react'
import { sanityClient } from '@/lib/sanity'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCwIcon, EyeIcon, AlertCircleIcon } from 'lucide-react'

interface LivePreviewProps {
  query: string
  params?: Record<string, any>
  children: (data: any, isLoading: boolean) => React.ReactNode
  fallbackData?: any
  enabled?: boolean
}

export function LivePreview({ 
  query, 
  params = {}, 
  children, 
  fallbackData,
  enabled = false 
}: LivePreviewProps) {
  const [data, setData] = useState(fallbackData)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)
    
    try {
      const result = await sanityClient.fetch(query, params)
      setData(result)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!enabled) return

    // Initial fetch
    fetchData()

    // Set up polling for real-time updates
    const interval = setInterval(fetchData, 30000) // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [query, JSON.stringify(params), enabled])

  if (!enabled) {
    return <>{children(fallbackData, false)}</>
  }

  return (
    <div className="relative">
      {/* Live Preview Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <Card className="shadow-lg border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <EyeIcon className="h-4 w-4" />
              Live Preview
              <Badge variant="secondary" className="ml-auto">
                {isLoading ? 'Updating...' : 'Live'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
              {error && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircleIcon className="h-3 w-3" />
                  {error}
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchData}
                disabled={isLoading}
                className="w-full"
              >
                <RefreshCwIcon className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {children(data, isLoading)}
    </div>
  )
}

// Hook for using live preview in components
export function useLivePreview<T>(
  query: string, 
  params: Record<string, any> = {},
  initialData?: T,
  enabled: boolean = false
) {
  const [data, setData] = useState<T | undefined>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)
    
    try {
      const result = await sanityClient.fetch(query, params)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (enabled) {
      refresh()
      const interval = setInterval(refresh, 30000)
      return () => clearInterval(interval)
    }
  }, [query, JSON.stringify(params), enabled])

  return { data, isLoading, error, refresh }
}