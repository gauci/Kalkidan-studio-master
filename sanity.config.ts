import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { dashboardTool } from '@sanity/dashboard'
import { schemaTypes } from './sanity/schemas'
import { structure } from './sanity/structure'
import { Dashboard } from './sanity/components/Dashboard'

export default defineConfig({
  name: 'kalkidan-cms',
  title: 'Kalkidan CMS',
  
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  plugins: [
    dashboardTool({
      widgets: [Dashboard()],
    }),
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

  // Custom studio branding
  studio: {
    components: {
      logo: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🏛️</span>
          <span style={{ fontWeight: 600 }}>Kalkidan CMS</span>
        </div>
      ),
    },
  },
})