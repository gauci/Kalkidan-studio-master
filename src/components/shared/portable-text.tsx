import { PortableText, PortableTextComponents } from '@portabletext/react'
import { urlFor } from '@/lib/sanity'
import Image from 'next/image'
import Link from 'next/link'

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) {
        return null
      }
      
      return (
        <div className="my-6">
          <Image
            src={urlFor(value).width(800).height(600).fit('max').auto('format').url()}
            alt={value.alt || 'Image'}
            width={800}
            height={600}
            className="rounded-lg"
          />
          {value.caption && (
            <p className="text-sm text-muted-foreground mt-2 text-center italic">
              {value.caption}
            </p>
          )}
        </div>
      )
    },
    callToAction: ({ value }) => {
      if (!value?.text || !value?.url) {
        return null
      }
      
      const buttonStyles = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      }
      
      return (
        <div className="my-6 text-center">
          <Link
            href={value.url}
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
              buttonStyles[value.style as keyof typeof buttonStyles] || buttonStyles.primary
            }`}
          >
            {value.text}
          </Link>
        </div>
      )
    },
  },
  marks: {
    link: ({ children, value }) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
      const target = !value.href.startsWith('/') ? '_blank' : undefined
      
      return (
        <Link
          href={value.href}
          rel={rel}
          target={target}
          className="text-primary underline underline-offset-4 hover:text-primary/80"
        >
          {children}
        </Link>
      )
    },
  },
  block: {
    h1: ({ children }) => (
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-4">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 pl-6 italic">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
        {children}
      </ol>
    ),
  },
}

interface PortableTextRendererProps {
  content: any[]
  className?: string
}

export function PortableTextRenderer({ content, className }: PortableTextRendererProps) {
  if (!content || !Array.isArray(content)) {
    return null
  }

  return (
    <div className={className}>
      <PortableText value={content} components={components} />
    </div>
  )
}