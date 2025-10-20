import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

export async function POST(request: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{
      _type: string
      slug?: { current: string }
      _id: string
    }>(request, process.env.SANITY_WEBHOOK_SECRET)

    // Verify the webhook signature
    if (!isValidSignature) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    if (!body?._type) {
      return new NextResponse('Bad Request', { status: 400 })
    }

    // Revalidate based on content type
    switch (body._type) {
      case 'article':
        // Revalidate article pages
        revalidatePath('/news')
        revalidatePath('/news/articles')
        if (body.slug?.current) {
          revalidatePath(`/news/articles/${body.slug.current}`)
        }
        revalidateTag('articles')
        break

      case 'announcement':
        // Revalidate announcement pages
        revalidatePath('/news')
        revalidatePath('/news/announcements')
        if (body.slug?.current) {
          revalidatePath(`/news/announcements/${body.slug.current}`)
        }
        revalidateTag('announcements')
        break

      case 'event':
        // Revalidate event pages
        revalidatePath('/events')
        if (body.slug?.current) {
          revalidatePath(`/events/${body.slug.current}`)
        }
        revalidateTag('events')
        break

      case 'page':
        // Revalidate general pages
        if (body.slug?.current) {
          revalidatePath(`/${body.slug.current}`)
        }
        revalidateTag('pages')
        break

      case 'category':
        // Revalidate all content when categories change
        revalidatePath('/news')
        revalidatePath('/news/articles')
        revalidatePath('/news/announcements')
        revalidateTag('categories')
        break

      default:
        // Revalidate main pages for any other content type
        revalidatePath('/news')
        break
    }

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      body,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}