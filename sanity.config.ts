import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'
import { structure } from './sanity/structure'

export default defineConfig({
  name: 'kalkidan-cms',
  title: 'Kalkidan CMS',
  
  projectId: 'w0wnv9ta',
  dataset: 'production',

  plugins: [
    structureTool({
      structure,
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    // Remove 'Settings' from new document options
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter((templateItem) => templateItem.templateId !== 'settings')
      }
      return prev
    },
  },

  // API configuration to fix connection issues
  api: {
    projectId: 'w0wnv9ta',
    dataset: 'production',
  },

  // CORS and connection settings
  cors: {
    credentials: true,
  },

})