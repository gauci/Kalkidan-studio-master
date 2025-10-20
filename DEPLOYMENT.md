# Deployment Guide

## Overview

This guide covers the deployment of the Kalkidan CMS system, which consists of:
- Next.js frontend application
- Convex backend database and functions
- Sanity CMS for content management

## Prerequisites

### Required Accounts
- [Vercel](https://vercel.com) account for Next.js deployment
- [Convex](https://convex.dev) account for backend services
- [Sanity](https://sanity.io) account for content management
- Domain name and DNS access
- SSL certificate (handled automatically by Vercel)

### Required Tools
- Node.js 18+ and npm/yarn
- Git for version control
- Convex CLI: `npm install -g convex`
- Sanity CLI: `npm install -g @sanity/cli`

## Step 1: Convex Backend Deployment

### 1.1 Create Production Convex Project

```bash
# Login to Convex
npx convex login

# Create new production project
npx convex deploy --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL

# Note the deployment URL for environment variables
```

### 1.2 Configure Convex Environment

```bash
# Set up production environment variables in Convex dashboard
# Go to https://dashboard.convex.dev/your-project/settings

# Configure the following:
# - NEXTAUTH_SECRET
# - SANITY_API_TOKEN
# - SMTP credentials (if using email notifications)
```

### 1.3 Deploy Convex Functions

```bash
# Deploy all Convex functions to production
npx convex deploy --prod

# Verify deployment
npx convex dashboard
```

## Step 2: Sanity CMS Deployment

### 2.1 Create Production Sanity Project

```bash
# Login to Sanity
npx sanity login

# Create new project (if not already created)
npx sanity init

# Deploy Sanity Studio
npx sanity deploy
```

### 2.2 Configure Sanity Production Dataset

```bash
# Create production dataset
npx sanity dataset create production

# Import schema to production
npx sanity schema deploy --dataset production

# Configure CORS for your production domain
npx sanity cors add https://your-domain.com --credentials
```

### 2.3 Set Up Sanity Webhooks

```bash
# Create webhook for content updates
# Go to Sanity Management Console
# Add webhook URL: https://your-domain.com/api/revalidate
# Select events: Create, Update, Delete
```

## Step 3: Next.js Frontend Deployment

### 3.1 Prepare Environment Variables

Create `.env.local` with production values:

```bash
# Copy production template
cp .env.production .env.local

# Fill in your actual production values:
# - NEXT_PUBLIC_CONVEX_URL (from Step 1)
# - NEXT_PUBLIC_SANITY_PROJECT_ID
# - SANITY_API_TOKEN
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
```

### 3.2 Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Configure environment variables in Vercel dashboard
# Go to https://vercel.com/your-project/settings/environment-variables
```

### 3.3 Configure Custom Domain

```bash
# Add custom domain in Vercel dashboard
# Update DNS records as instructed
# SSL certificate will be automatically provisioned
```

## Step 4: Post-Deployment Configuration

### 4.1 Create First Admin User

```bash
# Use the setup page to create first admin
# Visit: https://your-domain.com/setup
# Or use Convex dashboard to run createFirstAdmin function
```

### 4.2 Configure Security Settings

```bash
# Update CSP headers for your domain
# Configure rate limiting
# Set up monitoring and alerting
# Test all security features
```

### 4.3 Content Migration (if applicable)

```bash
# Export content from development
npx sanity dataset export development backup.tar.gz

# Import to production
npx sanity dataset import backup.tar.gz production --replace
```

## Step 5: Monitoring and Maintenance

### 5.1 Set Up Monitoring

- Configure Vercel Analytics
- Set up Sentry for error tracking
- Monitor Convex function performance
- Set up uptime monitoring

### 5.2 Backup Strategy

```bash
# Automated Convex backups (built-in)
# Sanity content backups
npx sanity dataset export production backup-$(date +%Y%m%d).tar.gz

# File storage backups (Convex handles this automatically)
```

### 5.3 Update Procedures

```bash
# Update Convex functions
npx convex deploy --prod

# Update Next.js application
git push origin main  # Triggers Vercel deployment

# Update Sanity schema
npx sanity schema deploy --dataset production
```

## Environment-Specific Configurations

### Development Environment

```bash
# Use development Convex deployment
NEXT_PUBLIC_CONVEX_URL=https://your-dev-deployment.convex.cloud

# Use development Sanity dataset
NEXT_PUBLIC_SANITY_DATASET=development

# Relaxed security settings for development
NODE_ENV=development
```

### Staging Environment

```bash
# Use staging Convex deployment
NEXT_PUBLIC_CONVEX_URL=https://your-staging-deployment.convex.cloud

# Use staging Sanity dataset
NEXT_PUBLIC_SANITY_DATASET=staging

# Production-like security settings
NODE_ENV=production
```

### Production Environment

```bash
# Use production Convex deployment
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud

# Use production Sanity dataset
NEXT_PUBLIC_SANITY_DATASET=production

# Full security settings
NODE_ENV=production
```

## Security Checklist

### Pre-Deployment Security

- [ ] All environment variables are properly configured
- [ ] HTTPS is enforced across all services
- [ ] CSP headers are configured for your domain
- [ ] Rate limiting is enabled and configured
- [ ] File upload restrictions are in place
- [ ] Admin accounts use strong passwords
- [ ] Sanity CORS is configured for production domain only

### Post-Deployment Security

- [ ] Test all authentication flows
- [ ] Verify file upload security
- [ ] Test rate limiting functionality
- [ ] Verify admin access controls
- [ ] Test incident response procedures
- [ ] Verify data export/deletion functionality
- [ ] Check security monitoring dashboard

## Troubleshooting

### Common Issues

**Convex Connection Issues:**
```bash
# Check environment variables
echo $NEXT_PUBLIC_CONVEX_URL

# Verify Convex deployment
npx convex dashboard

# Check function logs in Convex dashboard
```

**Sanity Content Issues:**
```bash
# Verify API token permissions
# Check CORS configuration
# Verify webhook configuration
# Check dataset permissions
```

**Next.js Deployment Issues:**
```bash
# Check Vercel build logs
# Verify environment variables
# Check function timeouts
# Verify domain configuration
```

### Performance Optimization

**Convex Optimization:**
- Use appropriate indexes for queries
- Implement pagination for large datasets
- Monitor function execution times
- Use caching where appropriate

**Next.js Optimization:**
- Enable ISR for content pages
- Optimize images with Next.js Image component
- Use dynamic imports for large components
- Implement proper caching headers

**Sanity Optimization:**
- Use GROQ queries efficiently
- Implement proper image optimization
- Use CDN for asset delivery
- Configure appropriate cache headers

## Rollback Procedures

### Emergency Rollback

```bash
# Rollback Vercel deployment
vercel rollback

# Rollback Convex functions (if needed)
# Use Convex dashboard to revert to previous deployment

# Rollback Sanity content (if needed)
npx sanity dataset import previous-backup.tar.gz production --replace
```

### Planned Rollback

```bash
# Create backup before rollback
npx sanity dataset export production pre-rollback-backup.tar.gz

# Coordinate rollback across all services
# Test functionality after rollback
# Update monitoring and alerts
```

## Support and Maintenance

### Regular Maintenance Tasks

- Weekly security updates
- Monthly dependency updates
- Quarterly security audits
- Regular backup verification
- Performance monitoring review

### Support Contacts

- Convex Support: [Convex documentation](https://docs.convex.dev)
- Sanity Support: [Sanity documentation](https://www.sanity.io/docs)
- Vercel Support: [Vercel documentation](https://vercel.com/docs)

---

**Last Updated:** [Current Date]  
**Version:** 1.0  
**Maintained By:** Development Team