# CMS Setup Instructions

## Convex Setup ✅
- Convex project initialized: `amiable-crocodile-485`
- Database schemas created for users, files, and sessions
- Authentication functions implemented
- File management functions created

## Sanity Setup (Next Steps)
1. Create a Sanity account at https://sanity.io
2. Create a new project
3. Update `.env.local` with your Sanity project ID:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-actual-project-id
   ```
4. Run `npm run sanity:dev` to start Sanity Studio

## Current Status
- ✅ Project structure set up
- ✅ Convex backend initialized and running
- ✅ Database schemas defined
- ✅ Authentication system created
- ✅ File management system created
- ✅ Next.js integration configured
- ⏳ Sanity CMS needs project ID configuration

## Routes Created
- `/dashboard` - User dashboard (preserves existing `/admin`)
- `/dashboard/files` - File management (to be created)
- `/dashboard/profile` - User profile (to be created)
- `/news` - Public news display (to be created)

## Environment Variables Needed
```
# Already configured
NEXT_PUBLIC_CONVEX_URL=https://amiable-crocodile-485.convex.cloud

# Need to be configured
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-sanity-token
```

## Next Steps
1. Configure Sanity project ID
2. Implement file upload UI
3. Create news display pages
4. Add admin content management interface