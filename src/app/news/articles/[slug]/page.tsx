import { notFound } from 'next/navigation'
import { getArticleBySlug, getArticles } from '@/lib/sanity-queries'
import { PortableTextRenderer } from '@/components/shared/portable-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarIcon, ClockIcon, ArrowLeftIcon, ShareIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  try {
    const articles = await getArticles()
    if (!articles || articles.length === 0) {
      return []
    }
    return articles.map((article: any) => ({
      slug: article.slug?.current || article.slug,
    })).filter((param: any) => param.slug) // Filter out any invalid slugs
  } catch (error) {
    console.warn('Failed to generate static params for articles:', error)
    return []
  }
}

export async function generateMetadata({ params }: ArticlePageProps) {
  try {
    const article = await getArticleBySlug(params.slug)
    
    if (!article) {
      return {
        title: 'Article Not Found - Kalkidan News',
        description: 'The requested article could not be found.',
      }
    }

    return {
      title: `${article.title} - Kalkidan News`,
      description: article.excerpt || `Read ${article.title} on Kalkidan News`,
      openGraph: {
        title: article.title,
        description: article.excerpt,
        images: article.featuredImage ? [
          {
            url: urlFor(article.featuredImage).width(1200).height(630).fit('crop').auto('format').url(),
            width: 1200,
            height: 630,
            alt: article.featuredImage.alt || article.title,
          }
        ] : [],
      },
    }
  } catch (error) {
    console.error('Error generating metadata for article:', error)
    return {
      title: 'Article - Kalkidan News',
      description: 'Kalkidan community news and articles.',
    }
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  try {
    const article = await getArticleBySlug(params.slug)

    if (!article) {
      notFound()
    }

    const readingTime = Math.ceil((article.content?.length || 0) / 200)

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

        {/* Article Header */}
        <header className="mb-8 space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-headline leading-tight">
              {article.title}
            </h1>
            
            {article.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-2" />
              {readingTime} min read
            </div>
            <Button variant="ghost" size="sm">
              <ShareIcon className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Categories */}
          {article.categories && Array.isArray(article.categories) && article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.categories.map((category: any, index: number) => (
                <Badge key={category?.slug?.current || index} variant="secondary">
                  {category?.title || 'Category'}
                </Badge>
              ))}
            </div>
          )}

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <Image
                src={urlFor(article.featuredImage).width(1200).height(675).fit('crop').auto('format').url()}
                alt={article.featuredImage.alt || article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <PortableTextRenderer content={article.content} />
        </article>

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date(article._updatedAt).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <ShareIcon className="h-4 w-4 mr-2" />
                Share Article
              </Button>
              <Link href="/news">
                <Button variant="outline" size="sm">
                  More Articles
                </Button>
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
  } catch (error) {
    console.error('Error rendering article page:', error)
    
    // Return a fallback error page
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-headline mb-4">Article Unavailable</h1>
          <p className="text-muted-foreground mb-6">
            We're sorry, but this article is currently unavailable. This might be due to a temporary issue with our content system.
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