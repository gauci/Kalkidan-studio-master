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
  // Add request timeout to prevent hanging
  requestTagPrefix: 'kalkidan',
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  try {
    if (!source) {
      // Return a chainable placeholder object that mimics the image builder
      const placeholderUrl = 'https://placehold.co/800x600/e2e8f0/64748b?text=Image+Not+Available'
      const createChainableObject = (url: string): any => ({
        url: () => url,
        width: (w: number) => createChainableObject(`https://placehold.co/${w}x600/e2e8f0/64748b?text=Image+Not+Available`),
        height: (h: number) => createChainableObject(`https://placehold.co/800x${h}/e2e8f0/64748b?text=Image+Not+Available`),
        fit: (f: string) => createChainableObject(url),
        auto: (a: string) => createChainableObject(url),
      })
      return createChainableObject(placeholderUrl)
    }
    return builder.image(source)
  } catch (error) {
    console.warn('Error building image URL:', error)
    // Return a chainable placeholder object on error
    const errorUrl = 'https://placehold.co/800x600/e2e8f0/64748b?text=Image+Error'
    const createChainableObject = (url: string): any => ({
      url: () => url,
      width: (w: number) => createChainableObject(`https://placehold.co/${w}x600/e2e8f0/64748b?text=Image+Error`),
      height: (h: number) => createChainableObject(`https://placehold.co/800x${h}/e2e8f0/64748b?text=Image+Error`),
      fit: (f: string) => createChainableObject(url),
      auto: (a: string) => createChainableObject(url),
    })
    return createChainableObject(errorUrl)
  }
}