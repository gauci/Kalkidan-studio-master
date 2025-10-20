import { article } from './article'
import { category } from './category'
import { announcement } from './announcement'
import { event } from './event'
import { page } from './page'

export const schemaTypes = [
  // Content types
  article,
  announcement,
  event,
  page,
  
  // Taxonomy
  category,
]