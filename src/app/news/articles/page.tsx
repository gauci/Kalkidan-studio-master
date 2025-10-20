import { getArticles } from '@/lib/sanity-queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarIcon, ClockIcon, SearchIcon, ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export const metadata = {
  title: 'Articles - Kalkidan News',
  description: 'Read the latest articles and stories from the Kalkidan community.',
}

export default async function ArticlesPage() {
  const articles = await getArticles()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        {/* Navigation */}
        <Link href="/news">
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to News
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-headline">📝 Articles</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            In-depth stories, insights, and updates from our community.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search articles..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No articles available yet</h3>
            <p className="text-muted-foreground">
              Check back soon for the latest articles from our community.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ArticleCard({ article }: { article: any }) {
  const readingTime = Math.ceil((article.content?.length || 0) / 200)

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
              {readingTime} min read
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {article.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {article.excerpt}
            </p>
          )}
          {article.categories && article.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {article.categories.slice(0, 3).map((category: any) => (
                <Badge key={category.slug.current} variant="outline" className="text-xs">
                  {category.title}
                </Badge>
              ))}
              {article.categories.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{article.categories.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}