import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'
import { structure } from './sanity/structure'

export default defineConfig({
  name: 'kalkidan-cms',
  title: 'Kalkidan CMS',
  
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

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
    
    // Custom actions
    actions: (prev, { schemaType }) => {
      // Add custom actions for content types that support publishing
      if (['article', 'announcement', 'event', 'page'].includes(schemaType)) {
        return [
          // Keep default actions but filter out the default publish
          ...prev.filter(action => action.name !== 'publish'),
          // Add our custom actions
          'PublishAction',
          'UnpublishAction', 
          'SchedulePublishAction',
        ]
      }
      return prev
    },
  },


})