# Kalkidan CMS API Documentation

## Overview

This document provides comprehensive documentation for the Kalkidan CMS API endpoints and integration points.

## Architecture

### Backend Services
- **Convex**: Database and serverless functions
- **Sanity**: Content management and delivery
- **Next.js**: Frontend and API routes

### Authentication
- Session-based authentication with secure tokens
- Role-based access control (User, Admin)
- Rate limiting and security measures

## Convex API Functions

### Authentication Functions

#### `registerUser`
Register a new user account.

**Parameters:**
```typescript
{
  email: string;
  name: string;
  phone?: string;
  address?: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}
```

**Returns:**
```typescript
{
  userId: Id<"users">;
  message: string;
}
```

**Example:**
```javascript
const result = await convex.mutation(api.auth.registerUser, {
  email: "user@example.com",
  name: "John Doe",
  password: "SecurePassword123!",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0..."
});
```

#### `loginUser`
Authenticate user and create session.

**Parameters:**
```typescript
{
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}
```

**Returns:**
```typescript
{
  sessionToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
    phone?: string;
    address?: string;
    emailVerified: boolean;
  };
}
```

#### `getCurrentUser`
Get current authenticated user information.

**Parameters:**
```typescript
{
  token: string;
}
```

**Returns:**
```typescript
{
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  phone?: string;
  address?: string;
  emailVerified: boolean;
} | null
```

#### `logoutUser`
Terminate user session.

**Parameters:**
```typescript
{
  token: string;
}
```

**Returns:**
```typescript
{
  message: string;
}
```

### File Management Functions

#### `generateUploadUrl`
Generate secure URL for file upload.

**Parameters:** None

**Returns:**
```typescript
string // Upload URL
```

#### `createFileRecord`
Create file metadata record after upload.

**Parameters:**
```typescript
{
  token: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageId: Id<"_storage">;
  isPublic?: boolean;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
}
```

**Returns:**
```typescript
{
  fileId: Id<"files">;
  message: string;
}
```

#### `getUserFiles`
Get user's uploaded files.

**Parameters:**
```typescript
{
  token: string;
}
```

**Returns:**
```typescript
Array<{
  id: Id<"files">;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: number;
  isPublic: boolean;
  description?: string;
  storageId: Id<"_storage">;
}>
```

#### `getFileUrl`
Generate secure download URL for file.

**Parameters:**
```typescript
{
  token: string;
  fileId: Id<"files">;
}
```

**Returns:**
```typescript
{
  url: string;
  fileName: string;
}
```

#### `deleteFile`
Delete user's file.

**Parameters:**
```typescript
{
  token: string;
  fileId: Id<"files">;
}
```

**Returns:**
```typescript
{
  message: string;
}
```

### Admin Functions

#### `getAllUsers`
Get all users (admin only).

**Parameters:**
```typescript
{
  adminToken: string;
  limit?: number;
  offset?: number;
}
```

**Returns:**
```typescript
{
  users: Array<{
    id: Id<"users">;
    email: string;
    name: string;
    role: "user" | "admin";
    createdAt: number;
    lastLogin?: number;
    isActive: boolean;
    emailVerified: boolean;
  }>;
  total: number;
  hasMore: boolean;
}
```

#### `updateUserRole`
Change user role (admin only).

**Parameters:**
```typescript
{
  adminToken: string;
  userId: Id<"users">;
  newRole: "user" | "admin";
}
```

**Returns:**
```typescript
{
  message: string;
  user: {
    id: Id<"users">;
    email: string;
    name: string;
    role: "user" | "admin";
  };
}
```

#### `toggleUserStatus`
Activate/deactivate user account (admin only).

**Parameters:**
```typescript
{
  adminToken: string;
  userId: Id<"users">;
}
```

**Returns:**
```typescript
{
  message: string;
  user: {
    id: Id<"users">;
    email: string;
    name: string;
    isActive: boolean;
  };
}
```

### Security Functions

#### `checkRateLimit`
Check rate limiting for user actions.

**Parameters:**
```typescript
{
  userId: Id<"users">;
  action: string;
  windowMinutes?: number;
  maxAttempts?: number;
}
```

**Returns:**
```typescript
{
  allowed: boolean;
}
```

#### `detectSuspiciousActivity`
Detect suspicious user activity (admin only).

**Parameters:**
```typescript
{
  token: string;
}
```

**Returns:**
```typescript
{
  suspiciousUsers: Array<{
    userId: string;
    failureCount: number;
  }>;
  totalFailures: number;
  timeWindow: string;
}
```

### Privacy Functions

#### `exportUserData`
Export all user data (GDPR compliance).

**Parameters:**
```typescript
{
  token: string;
}
```

**Returns:**
```typescript
{
  exportDate: number;
  user: UserData;
  files: FileData[];
  sessions: SessionData[];
  auditLogs: AuditLogData[];
  summary: {
    totalFiles: number;
    totalSessions: number;
    totalAuditLogs: number;
  };
}
```

#### `requestAccountDeletion`
Request account deletion (GDPR compliance).

**Parameters:**
```typescript
{
  token: string;
  confirmationText: string; // Must be "DELETE MY ACCOUNT"
}
```

**Returns:**
```typescript
{
  message: string;
  deletionDate: number;
}
```

### Monitoring Functions

#### `getSystemHealthMetrics`
Get system health and performance metrics (admin only).

**Parameters:**
```typescript
{
  adminToken: string;
}
```

**Returns:**
```typescript
{
  timestamp: number;
  metrics: {
    activeUsers: number;
    recentLogins: number;
    failedLogins: number;
    recentUploads: number;
    failedUploads: number;
    openIncidents: number;
    criticalIncidents: number;
  };
  health: {
    loginSuccessRate: number;
    uploadSuccessRate: number;
    securityStatus: "healthy" | "warning" | "critical";
  };
}
```

#### `logSecurityIncident`
Log a security incident (admin only).

**Parameters:**
```typescript
{
  adminToken: string;
  incidentType: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  affectedUserId?: Id<"users">;
  ipAddress?: string;
  userAgent?: string;
  additionalData?: string;
}
```

**Returns:**
```typescript
{
  incidentId: Id<"securityIncidents">;
  message: string;
}
```

## Next.js API Routes

### Rate Limiting

#### `POST /api/rate-limit`
Check rate limiting for specific endpoints.

**Request Body:**
```typescript
{
  endpoint: string;
  identifier: string;
}
```

**Response:**
```typescript
{
  allowed: boolean;
  remaining?: number;
  resetTime?: number;
  error?: string;
}
```

### Health Check

#### `GET /api/health`
System health check endpoint.

**Response:**
```typescript
{
  status: "healthy" | "warning" | "unhealthy";
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: string;
    storage: string;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}
```

#### `HEAD /api/health`
Simple health check for load balancers.

**Response:** HTTP 200 status only

### Content Revalidation

#### `POST /api/revalidate`
Revalidate content pages (Sanity webhook).

**Request Body:**
```typescript
{
  _type: string;
  slug?: {
    current: string;
  };
}
```

**Response:**
```typescript
{
  revalidated: boolean;
  message: string;
}
```

## Sanity API Integration

### Content Queries

#### Get All Articles
```javascript
const query = `*[_type == "article" && defined(slug.current)] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage,
  author->{name, image}
}`;

const articles = await sanityClient.fetch(query);
```

#### Get Single Article
```javascript
const query = `*[_type == "article" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  publishedAt,
  body,
  mainImage,
  author->{name, image, bio}
}`;

const article = await sanityClient.fetch(query, { slug });
```

#### Get Announcements
```javascript
const query = `*[_type == "announcement" && publishedAt <= now()] | order(publishedAt desc) {
  _id,
  title,
  content,
  publishedAt,
  priority,
  expiresAt
}`;

const announcements = await sanityClient.fetch(query);
```

### Content Types Schema

#### Article Schema
```javascript
{
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' }
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    },
    {
      name: 'body',
      title: 'Body',
      type: 'blockContent'
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true }
    }
  ]
}
```

## Error Handling

### Common Error Responses

#### Authentication Errors
```typescript
{
  error: "Invalid or expired session";
  code: "AUTH_ERROR";
  status: 401;
}
```

#### Permission Errors
```typescript
{
  error: "Insufficient permissions - admin access required";
  code: "PERMISSION_DENIED";
  status: 403;
}
```

#### Rate Limit Errors
```typescript
{
  error: "Rate limit exceeded. Too many login attempts.";
  code: "RATE_LIMIT_EXCEEDED";
  status: 429;
  retryAfter: number;
}
```

#### Validation Errors
```typescript
{
  error: "Invalid email format";
  code: "VALIDATION_ERROR";
  status: 400;
  field: "email";
}
```

### Error Codes Reference

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_ERROR` | Authentication failed | 401 |
| `PERMISSION_DENIED` | Insufficient permissions | 403 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `NOT_FOUND` | Resource not found | 404 |
| `FILE_TOO_LARGE` | File exceeds size limit | 413 |
| `UNSUPPORTED_FILE_TYPE` | File type not allowed | 415 |
| `QUOTA_EXCEEDED` | Storage quota exceeded | 507 |

## Security Considerations

### Authentication
- All API calls require valid session tokens
- Tokens expire after 24 hours of inactivity
- Rate limiting prevents brute force attacks

### Data Validation
- All inputs are validated and sanitized
- File uploads are scanned for malicious content
- SQL injection and XSS prevention measures

### Privacy Compliance
- GDPR-compliant data handling
- User consent tracking
- Data export and deletion capabilities

### Monitoring
- All API calls are logged for security monitoring
- Suspicious activity detection and alerting
- Comprehensive audit trails

## Integration Examples

### Frontend Integration (React)

```typescript
// Authentication hook
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (email: string, password: string) => {
    const result = await convex.mutation(api.auth.loginUser, {
      email,
      password,
      ipAddress: getClientIP(),
      userAgent: navigator.userAgent
    });
    
    setToken(result.sessionToken);
    setUser(result.user);
    localStorage.setItem('token', result.sessionToken);
  };

  return { user, token, login };
};
```

### File Upload Example

```typescript
const uploadFile = async (file: File, token: string) => {
  // Get upload URL
  const uploadUrl = await convex.mutation(api.files.generateUploadUrl);
  
  // Upload file to storage
  const result = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  
  const { storageId } = await result.json();
  
  // Create file record
  return await convex.mutation(api.files.createFileRecord, {
    token,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    storageId,
    isPublic: false,
  });
};
```

### Content Fetching Example

```typescript
const getArticles = async () => {
  const query = `*[_type == "article" && defined(slug.current)] | order(publishedAt desc)`;
  return await sanityClient.fetch(query);
};
```

## Rate Limits

### Default Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/login` | 5 attempts | 15 minutes |
| `/auth/register` | 3 attempts | 1 hour |
| `/api/files/upload` | 20 uploads | 1 hour |
| `/api/*` (general) | 60 requests | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Sanity Content Webhooks

**Endpoint:** `POST /api/revalidate`

**Payload:**
```typescript
{
  _type: "article" | "announcement" | "event";
  _id: string;
  slug?: {
    current: string;
  };
}
```

**Configuration:**
- URL: `https://your-domain.com/api/revalidate`
- Events: Create, Update, Delete
- Include drafts: No

---

**Last Updated**: [Current Date]  
**Version**: 1.0  
**API Version**: v1