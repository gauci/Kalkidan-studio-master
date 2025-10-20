'use client'

// Client-side content refresh utilities
export class ContentRefresh {
  private static refreshCallbacks: Map<string, (() => void)[]> = new Map()

  // Register a callback for content type updates
  static subscribe(contentType: string, callback: () => void) {
    const callbacks = this.refreshCallbacks.get(contentType) || []
    callbacks.push(callback)
    this.refreshCallbacks.set(contentType, callbacks)

    // Return unsubscribe function
    return () => {
      const updatedCallbacks = this.refreshCallbacks.get(contentType) || []
      const index = updatedCallbacks.indexOf(callback)
      if (index > -1) {
        updatedCallbacks.splice(index, 1)
        this.refreshCallbacks.set(contentType, updatedCallbacks)
      }
    }
  }

  // Trigger refresh for a content type
  static refresh(contentType: string) {
    const callbacks = this.refreshCallbacks.get(contentType) || []
    callbacks.forEach(callback => callback())
  }

  // Refresh all content
  static refreshAll() {
    this.refreshCallbacks.forEach((callbacks) => {
      callbacks.forEach(callback => callback())
    })
  }

  // Manual page refresh via API
  static async refreshPage(path: string) {
    try {
      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path,
          secret: process.env.NEXT_PUBLIC_REVALIDATE_SECRET,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to refresh page')
      }

      return await response.json()
    } catch (error) {
      console.error('Page refresh error:', error)
      throw error
    }
  }
}

// Hook for subscribing to content updates
export function useContentRefresh(contentType: string, callback: () => void) {
  const { useEffect } = require('react')
  
  useEffect(() => {
    const unsubscribe = ContentRefresh.subscribe(contentType, callback)
    return unsubscribe
  }, [contentType, callback])
}

// Utility for checking if content is stale
export function isContentStale(lastUpdated: string | Date, maxAge: number = 300000): boolean {
  const lastUpdateTime = new Date(lastUpdated).getTime()
  const now = Date.now()
  return (now - lastUpdateTime) > maxAge
}

// Format last updated time
export function formatLastUpdated(date: string | Date): string {
  const updateDate = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - updateDate.getTime()
  
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) {
    return 'Just now'
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }
}