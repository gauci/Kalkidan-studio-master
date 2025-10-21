# Deployment Setup Guide

## Environment Variables

### Required for Production

```bash
# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud

# Sanity Configuration (Optional - CMS features will be disabled if not set)
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-sanity-api-token

# Webhook Secrets (Optional)
SANITY_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_REVALIDATE_SECRET=your-revalidate-secret
```

### Vercel Deployment

1. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project settings
   - Add all required environment variables
   - Ensure `NEXT_PUBLIC_CONVEX_URL` is set correctly

2. **Deploy from GitHub:**
   - Connect your GitHub repository
   - Vercel will automatically deploy on push to master

### Build Troubleshooting

If you encounter build errors:

1. **"self is not defined" Error:**
   - This is fixed in the webpack configuration
   - Ensure you're using the latest next.config.ts

2. **Sanity Build Errors:**
   - The app will work without Sanity if not configured
   - CMS features will be disabled gracefully
   - Check that NEXT_PUBLIC_SANITY_PROJECT_ID is set correctly

3. **Hydration Errors:**
   - Client-side components are wrapped with proper error boundaries
   - Auth system has fallbacks for server-side rendering

### Testing Deployment

1. **Local Build Test:**
   ```bash
   npm run build
   npm start
   ```

2. **Check Console for Warnings:**
   - Open browser console
   - Look for any client-side errors
   - Verify all features work as expected

### Features Available

- ✅ User authentication (if Convex is configured)
- ✅ File management (if Convex is configured)
- ✅ Content management (if Sanity is configured)
- ✅ Static content (always available)
- ✅ Responsive design
- ✅ SEO optimization

### Rollback Strategy

If deployment fails:
1. Revert to previous commit
2. Check environment variables
3. Test build locally first
4. Deploy incrementally

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Ensure Convex deployment is active
4. Test with a fresh browser session