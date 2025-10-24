import { NextResponse } from 'next/server'
import { getAnnouncements } from '@/lib/sanity-queries'

export async function GET() {
  try {
    console.log('Testing Sanity connection...')
    console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
    console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET)
    console.log('API Token exists:', !!process.env.SANITY_API_TOKEN)
    
    const announcements = await getAnnouncements()
    
    return NextResponse.json({
      success: true,
      count: announcements.length,
      announcements: announcements.map((a: any) => ({
        id: a._id,
        title: a.title,
        isPublished: a.isPublished,
        publishedAt: a.publishedAt
      })),
      config: {
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        hasToken: !!process.env.SANITY_API_TOKEN
      }
    })
  } catch (error) {
    console.error('Sanity test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        hasToken: !!process.env.SANITY_API_TOKEN
      }
    }, { status: 500 })
  }
}