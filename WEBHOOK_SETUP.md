# Sanity Webhook Setup Guide

## Overview
This guide explains how to set up webhooks in Sanity Studio to enable real-time content updates on your website.

## 1. Generate Webhook Secret

First, generate a secure webhook secret:

```bash
# Generate a random secret
openssl rand -base64 32
```

Add this secret to your `.env.local` file:
```
SANITY_WEBHOOK_SECRET=your-generated-secret-here
```

## 2. Configure Webhook in Sanity Studio

1. Go to your Sanity project dashboard: https://sanity.io/manage
2. Select your project
3. Navigate to "API" → "Webhooks"
4. Click "Create webhook"

### Webhook Configuration:
- **Name**: `Next.js ISR Webhook`
- **URL**: `https://your-domain.com/api/revalidate`
- **Dataset**: `production` (or your dataset name)
- **Trigger on**: `Create`, `Update`, `Delete`
- **Filter**: Leave empty to trigger on all document types
- **Secret**: Use the secret you generated above
- **HTTP method**: `POST`

## 3. Test the Webhook

After setting up the webhook:

1. Create or update content in Sanity Studio
2. Check your Next.js application logs
3. Verify that pages are being revalidated
4. Content should update within 30-60 seconds

## 4. Webhook Payload

The webhook will send data in this format:
```json
{
  "_type": "article",
  "_id": "document-id",
  "slug": {
    "current": "article-slug"
  }
}
```

## 5. Manual Revalidation

You can also manually trigger revalidation by calling:
```bash
curl -X POST https://your-domain.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"_type": "article", "slug": {"current": "article-slug"}}'
```

## 6. Monitoring

- Check webhook delivery status in Sanity dashboard
- Monitor Next.js logs for revalidation events
- Use the content status indicators in your app

## Troubleshooting

### Webhook not triggering:
- Verify the webhook URL is correct
- Check that the secret matches
- Ensure your deployment is accessible

### Content not updating:
- Check ISR cache settings
- Verify revalidation paths are correct
- Clear browser cache

### Performance considerations:
- Webhooks trigger immediately on content changes
- ISR provides fast page loads with fresh content
- Consider rate limiting for high-traffic sites