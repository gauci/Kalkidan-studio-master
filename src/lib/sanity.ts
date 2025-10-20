import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

if (!projectId) {
  console.warn('NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Sanity features will be disabled.')
}

export const sanityClient = createClient({
  projectId: projectId || 'dummy-project-id',
  dataset: dataset,
  useCdn: true,
  apiVersion: '2024-01-01',
  // Ignore errors if project ID is missing (for build time)
  ignoreBrowserTokenWarning: true,
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  return builder.image(source)
}