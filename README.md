# Kalkidan CMS

A modern, secure, and scalable Content Management System built with Next.js, Convex, and Sanity CMS.

## 🚀 Features

### User Management
- **Secure Authentication**: Email/password with session management
- **Role-Based Access Control**: User and Admin roles with granular permissions
- **User Dashboard**: Personal file management and privacy controls
- **Profile Management**: Update personal information and preferences

### File Management
- **Secure File Upload**: Support for images, documents, and archives
- **File Organization**: Private and public file sharing options
- **Storage Quota Management**: 1GB per user with usage tracking
- **File Security**: Malware scanning and type validation

### Content Management
- **Sanity CMS Integration**: Professional content management interface
- **Rich Content Types**: Articles, announcements, events, and pages
- **Real-time Updates**: Automatic content synchronization
- **SEO Optimization**: Built-in SEO tools and meta management

### Security & Privacy
- **GDPR Compliance**: Data export, deletion, and privacy controls
- **Security Monitoring**: Real-time threat detection and incident management
- **Rate Limiting**: Protection against abuse and attacks
- **Audit Logging**: Comprehensive activity tracking

### Admin Features
- **User Management**: Complete user administration interface
- **Security Dashboard**: Real-time security monitoring and alerts
- **Content Moderation**: Full content management capabilities
- **System Health**: Performance metrics and system diagnostics

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Convex (serverless functions and database)
- **CMS**: Sanity Studio for content management
- **Authentication**: Custom session-based auth with Convex
- **File Storage**: Convex file storage with CDN delivery
- **Deployment**: Vercel (recommended) or Docker

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- [Convex](https://convex.dev) account
- [Sanity](https://sanity.io) account
- [Vercel](https://vercel.com) account (for deployment)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd kalkidan-cms
npm install
```

### 2. Environment Setup

Copy the environment template:
```bash
cp .env.production .env.local
```

Fill in your environment variables:
```bash
# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=your-convex-deployment-url
CONVEX_DEPLOY_KEY=your-convex-deploy-key

# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=development
SANITY_API_TOKEN=your-sanity-api-token

# Security
NEXTAUTH_SECRET=your-secure-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Set Up Services

**Initialize Convex:**
```bash
npx convex dev
```

**Set up Sanity:**
```bash
npx sanity init
npx sanity dev
```

### 4. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application.

### 5. Create First Admin

Visit `/setup` to create your first admin user, or use the Convex dashboard to run the `createFirstAdmin` function.

## 📖 Documentation

- **[User Guide](USER_GUIDE.md)** - Complete guide for end users
- **[Admin Guide](ADMIN_GUIDE.md)** - Administration and management guide
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions

## 🔧 Available Scripts

```bash
# Development
npm run dev                    # Start development server
npm run convex:dev            # Start Convex development
npm run sanity:dev            # Start Sanity Studio

# Building
npm run build                 # Build for production
npm run type-check            # TypeScript type checking
npm run lint                  # ESLint checking

# Deployment
npm run deploy:all            # Deploy all services
npm run deploy:convex         # Deploy Convex functions
npm run deploy:sanity         # Deploy Sanity Studio
npm run deploy:vercel         # Deploy to Vercel

# Docker
npm run docker:build          # Build Docker image
npm run docker:run            # Run Docker container
npm run docker:compose        # Start with Docker Compose
```

## 🔒 Security Features

### Authentication & Authorization
- Secure session management with automatic expiration
- Role-based access control (RBAC)
- Rate limiting on authentication endpoints
- IP address and user agent tracking

### Data Protection
- Input validation and sanitization
- File type and size validation
- Malware scanning for uploads
- HTTPS enforcement with security headers

### Privacy Compliance
- GDPR-compliant data handling
- User data export functionality
- Account deletion with grace period
- Privacy preference management

### Monitoring & Incident Response
- Real-time security monitoring
- Automated threat detection
- Comprehensive audit logging
- Incident management system

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment Variables**: Add all required environment variables
3. **Deploy**: Automatic deployment on push to main branch

### Docker

```bash
# Build and run with Docker
npm run docker:build
npm run docker:run

# Or use Docker Compose
npm run docker:compose
```

### Manual Deployment

See the [Deployment Guide](DEPLOYMENT.md) for detailed instructions.

## 📊 Monitoring

### Health Checks
- **Endpoint**: `/api/health`
- **Metrics**: Memory usage, uptime, service status
- **Monitoring**: Automated health monitoring

### Security Monitoring
- **Dashboard**: `/admin/security`
- **Features**: Real-time alerts, incident tracking
- **Metrics**: Login attempts, file activity, system health

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

### Documentation
- [User Guide](USER_GUIDE.md) - For end users
- [Admin Guide](ADMIN_GUIDE.md) - For administrators
- [API Documentation](API_DOCUMENTATION.md) - For developers

### Getting Help
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Email**: support@your-domain.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Convex](https://convex.dev) - Backend platform
- [Sanity](https://sanity.io) - Content management
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Radix UI](https://radix-ui.com) - UI components

---

**Built with ❤️ by the Kalkidan CMS Team**
