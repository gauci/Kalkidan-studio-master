import imageUrlBuilder from '@sanity/image-url'
import { sanityClient } from './sanity'

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  return builder.image(source)
}

// Helper function to get optimized image URL
export function getImageUrl(image: any, width?: number, height?: number) {
  if (!image?.asset) return null
  
  let urlBuilder = urlFor(image.asset)
  
  if (width) {
    urlBuilder = urlBuilder.width(width)
  }
  
  if (height) {
    urlBuilder = urlBuilder.height(height)
  }
  
  return urlBuilder.url()
}

// Get responsive image URLs
export function getResponsiveImageUrls(image: any) {
  if (!image?.asset) return null
  
  return {
    small: getImageUrl(image, 400),
    medium: getImageUrl(image, 800), 
    large: getImageUrl(image, 1200),
    original: getImageUrl(image)
  }
}