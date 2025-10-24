import { sanityClient } from './sanity'

// Check if Sanity is properly configured
const isSanityConfigured = () => {
  return process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && 
         process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'dummy-project-id'
}

// GROQ queries for different content types
export const ARTICLE_QUERY = `*[_type == "article" && isPublished == true] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  content,
  featuredImage{
    asset->{
      _id,
      url,
      metadata {
        dimensions
      }
    },
    alt
  },
  categories[]->{
    title,
    slug
  },
  publishedAt,
  _updatedAt
}`

export const ARTICLE_BY_SLUG_QUERY = `*[_type == "article" && slug.current == $slug && isPublished == true][0] {
  _id,
  title,
  slug,
  excerpt,
  content,
  featuredImage{
    asset->{
      _id,
      url,
      metadata {
        dimensions
      }
    },
    alt
  },
  categories[]->{
    title,
    slug
  },
  publishedAt,
  _updatedAt
}`

export const ANNOUNCEMENT_QUERY = `*[_type == "announcement" && isPublished == true && (!defined(expiresAt) || expiresAt > now())] | order(isPinned desc, priority desc, publishedAt desc) {
  _id,
  title,
  slug,
  summary,
  content,
  bannerImage{
    asset->{
      _id,
      url,
      metadata {
        dimensions
      }
    },
    alt
  },
  priority,
  targetAudience,
  attachments,
  publishedAt,
  expiresAt,
  isPinned,
  _updatedAt
}`

export const ANNOUNCEMENT_BY_SLUG_QUERY = `*[_type == "announcement" && slug.current == $slug && isPublished == true][0] {
  _id,
  title,
  slug,
  summary,
  content,
  bannerImage{
    asset->{
      _id,
      url,
      metadata {
        dimensions
      }
    },
    alt
  },
  priority,
  targetAudience,
  attachments,
  publishedAt,
  expiresAt,
  isPinned,
  _updatedAt
}`

export const EVENT_QUERY = `*[_type == "event" && isPublished == true && startDate > now()] | order(startDate asc) {
  _id,
  title,
  slug,
  description,
  content,
  featuredImage,
  startDate,
  endDate,
  location,
  eventType,
  registrationRequired,
  registrationLink,
  maxAttendees,
  contactPerson,
  categories[]->{
    title,
    slug
  },
  isFeatured,
  _updatedAt
}`

export const EVENT_BY_SLUG_QUERY = `*[_type == "event" && slug.current == $slug && isPublished == true][0] {
  _id,
  title,
  slug,
  description,
  content,
  featuredImage,
  startDate,
  endDate,
  location,
  eventType,
  registrationRequired,
  registrationLink,
  maxAttendees,
  contactPerson,
  categories[]->{
    title,
    slug
  },
  isFeatured,
  _updatedAt
}`

export const PAGE_BY_SLUG_QUERY = `*[_type == "page" && slug.current == $slug && isPublished == true][0] {
  _id,
  title,
  slug,
  metaDescription,
  content,
  featuredImage,
  showInNavigation,
  navigationOrder,
  publishedAt,
  _updatedAt
}`

export const NAVIGATION_PAGES_QUERY = `*[_type == "page" && isPublished == true && showInNavigation == true] | order(navigationOrder asc) {
  _id,
  title,
  slug,
  navigationOrder
}`

// Fetch functions with ISR caching
export async function getArticles() {
  if (!isSanityConfigured()) {
    console.warn('Sanity not configured, returning empty articles array')
    return []
  }
  
  try {
    return await sanityClient.fetch(ARTICLE_QUERY, {}, {
      next: { 
        revalidate: 60, // Revalidate every 60 seconds
        tags: ['articles'] 
      }
    })
  } catch (error) {
    console.warn('Failed to fetch articles from Sanity, returning empty array:', error)
    return []
  }
}

export async function getArticleBySlug(slug: string) {
  if (!isSanityConfigured()) {
    console.warn('Sanity not configured, returning null for article')
    return null
  }
  
  try {
    return await sanityClient.fetch(ARTICLE_BY_SLUG_QUERY, { slug }, {
      next: { 
        revalidate: 3600, // Revalidate every hour for individual articles
        tags: ['articles', `article-${slug}`] 
      }
    })
  } catch (error) {
    console.warn(`Failed to fetch article with slug ${slug} from Sanity:`, error)
    return null
  }
}

export async function getAnnouncements() {
  if (!isSanityConfigured()) {
    console.warn('Sanity not configured, returning empty announcements array')
    return []
  }
  
  try {
    return await sanityClient.fetch(ANNOUNCEMENT_QUERY, {}, {
      next: { 
        revalidate: 30, // Revalidate every 30 seconds for announcements (more urgent)
        tags: ['announcements'] 
      }
    })
  } catch (error) {
    console.warn('Failed to fetch announcements from Sanity, returning empty array:', error)
    return []
  }
}

export async function getAnnouncementBySlug(slug: string) {
  if (!isSanityConfigured()) {
    console.warn('Sanity not configured, returning null for announcement')
    return null
  }
  
  try {
    return await sanityClient.fetch(ANNOUNCEMENT_BY_SLUG_QUERY, { slug }, {
      next: { 
        revalidate: 300, // Revalidate every 5 minutes for individual announcements
        tags: ['announcements', `announcement-${slug}`] 
      }
    })
  } catch (error) {
    console.warn(`Failed to fetch announcement with slug ${slug} from Sanity:`, error)
    return null
  }
}

export async function getEvents() {
  try {
    return await sanityClient.fetch(EVENT_QUERY, {}, {
      next: { 
        revalidate: 300, // Revalidate every 5 minutes
        tags: ['events'] 
      }
    })
  } catch (error) {
    console.warn('Failed to fetch events from Sanity, returning empty array:', error)
    return []
  }
}

export async function getEventBySlug(slug: string) {
  try {
    return await sanityClient.fetch(EVENT_BY_SLUG_QUERY, { slug }, {
      next: { 
        revalidate: 3600, // Revalidate every hour for individual events
        tags: ['events', `event-${slug}`] 
      }
    })
  } catch (error) {
    console.warn(`Failed to fetch event with slug ${slug} from Sanity:`, error)
    return null
  }
}

export async function getPageBySlug(slug: string) {
  try {
    return await sanityClient.fetch(PAGE_BY_SLUG_QUERY, { slug }, {
      next: { 
        revalidate: 3600, // Revalidate every hour for pages
        tags: ['pages', `page-${slug}`] 
      }
    })
  } catch (error) {
    console.warn(`Failed to fetch page with slug ${slug} from Sanity:`, error)
    return null
  }
}

export async function getNavigationPages() {
  try {
    return await sanityClient.fetch(NAVIGATION_PAGES_QUERY, {}, {
      next: { 
        revalidate: 1800, // Revalidate every 30 minutes
        tags: ['pages', 'navigation'] 
      }
    })
  } catch (error) {
    console.warn('Failed to fetch navigation pages from Sanity, returning empty array:', error)
    return []
  }
}

// Search function
export async function searchContent(query: string) {
  const searchQuery = `*[
    _type in ["article", "announcement", "event", "page"] && 
    isPublished == true && 
    (title match $searchTerm || content[].children[].text match $searchTerm)
  ] | order(_score desc) {
    _id,
    _type,
    title,
    slug,
    "excerpt": select(
      _type == "article" => excerpt,
      _type == "announcement" => summary,
      _type == "event" => description,
      _type == "page" => metaDescription
    ),
    publishedAt,
    _updatedAt
  }`
  
  try {
    return await sanityClient.fetch(searchQuery, { searchTerm: `${query}*` })
  } catch (error) {
    console.warn(`Failed to search content for query "${query}" from Sanity:`, error)
    return []
  }
}