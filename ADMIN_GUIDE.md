# Kalkidan CMS Admin Guide

## Table of Contents
1. [Admin Overview](#admin-overview)
2. [User Management](#user-management)
3. [Content Management](#content-management)
4. [Security Monitoring](#security-monitoring)
5. [System Administration](#system-administration)
6. [Troubleshooting](#troubleshooting)

## Admin Overview

### Admin Access
- Admin users have elevated privileges to manage the system
- Access admin panel at `/admin`
- Requires admin role assignment

### Admin Responsibilities
- User account management
- Content moderation and management
- Security monitoring and incident response
- System maintenance and updates
- Data privacy compliance

### Admin Dashboard Features
- User statistics and metrics
- Content management tools
- Security monitoring dashboard
- System health indicators

## User Management

### Accessing User Management
1. Navigate to `/admin/users`
2. Or click "User Management" from admin dashboard

### User Overview

**User Statistics Dashboard**:
- Total registered users
- Active/inactive accounts
- Admin vs regular users
- Email verification status

### Managing User Accounts

#### Viewing User Information
- Complete user list with details
- User activity summaries
- Account creation dates
- Last login information
- File upload statistics

#### User Actions

**Change User Roles**:
1. Click "Change Role" next to user
2. Select new role (User or Admin)
3. Confirm the change
4. User permissions update immediately

**Activate/Deactivate Accounts**:
1. Click "Activate" or "Deactivate" next to user
2. Confirm the action
3. Deactivated users cannot log in
4. All user sessions are terminated when deactivated

**View User Activity**:
1. Click "View Activity" next to user
2. See detailed activity logs
3. Monitor file operations
4. Review login history
5. Check for suspicious behavior

#### User Activity Monitoring

**Activity Types Tracked**:
- Login attempts (successful and failed)
- File uploads and downloads
- Account changes
- Privacy setting updates

**Activity Details Include**:
- Timestamp of action
- IP address (when available)
- User agent information
- Success/failure status
- Error messages (if applicable)

### User Security Management

#### Suspicious Activity Detection
- Multiple failed login attempts
- Unusual file upload patterns
- Access from new locations
- Rapid account changes

#### Security Actions
- Temporarily disable accounts
- Force password resets
- Review and investigate activity
- Block IP addresses (if needed)

## Content Management

### Sanity CMS Integration

#### Accessing Sanity Studio
1. Click "Open Sanity Studio" from admin dashboard
2. Or navigate directly to your Sanity Studio URL
3. Use your Sanity credentials to log in

#### Content Types Available

**Articles**:
- Long-form content and blog posts
- Rich text editing capabilities
- Featured images and media
- SEO metadata
- Publication scheduling

**Announcements**:
- Important updates and notices
- Priority levels
- Expiration dates
- Target audience settings

**Events**:
- Event information and details
- Date and time management
- Location information
- Registration links

**Pages**:
- Static content pages
- Custom layouts
- Navigation integration

### Content Workflow

#### Creating Content
1. **Access Sanity Studio**
2. **Select Content Type** (Article, Announcement, etc.)
3. **Fill in Content Details**:
   - Title and description
   - Main content (rich text)
   - Featured images
   - Categories and tags
   - SEO settings
4. **Set Publication Status**:
   - Draft: Not visible to users
   - Published: Live on website
   - Scheduled: Publish at specific time

#### Content Management Features

**Rich Text Editor**:
- Formatted text (bold, italic, headings)
- Lists and quotes
- Links and references
- Embedded media
- Code blocks

**Media Management**:
- Image uploads and optimization
- Alt text for accessibility
- Image cropping and resizing
- CDN delivery optimization

**SEO Optimization**:
- Meta titles and descriptions
- Open Graph tags
- Twitter Card metadata
- URL slug customization

#### Publishing and Updates

**Immediate Publishing**:
- Content goes live immediately
- Website updates automatically
- Cache invalidation handled automatically

**Scheduled Publishing**:
- Set future publication dates
- Content publishes automatically
- Email notifications (if configured)

**Content Updates**:
- Edit published content anytime
- Changes reflect immediately on website
- Version history maintained

### Content Analytics

**Available Metrics**:
- Content views and engagement
- Popular content identification
- User interaction patterns
- Content performance over time

## Security Monitoring

### Security Dashboard
Access at `/admin/security`

#### System Health Overview

**Health Indicators**:
- Overall security status (Healthy/Warning/Critical)
- Active user count
- Login success rates
- Open security incidents

**Recent Activity Metrics**:
- Successful logins (last 24 hours)
- Failed login attempts
- File uploads and downloads
- Failed operations

### Incident Management

#### Security Incident Types
- **Critical**: Data breaches, system compromise
- **High**: Unauthorized admin access, significant threats
- **Medium**: Multiple failed logins, unusual patterns
- **Low**: Minor security alerts, informational

#### Incident Response Workflow

1. **Detection**:
   - Automated threat detection
   - Manual reporting
   - System alerts

2. **Assessment**:
   - Classify incident severity
   - Identify affected systems/users
   - Determine scope of impact

3. **Response**:
   - Immediate containment actions
   - Investigation and analysis
   - Remediation steps

4. **Resolution**:
   - Implement fixes
   - Monitor for recurrence
   - Document lessons learned

#### Managing Security Incidents

**Creating Incidents**:
1. Click "Log New Incident"
2. Select incident type and severity
3. Provide detailed description
4. Assign to team member
5. Set initial status

**Updating Incidents**:
1. Change status (Open → Investigating → Resolved → Closed)
2. Add investigation notes
3. Document remediation actions
4. Set resolution details

**Incident Statuses**:
- **Open**: Newly reported, needs attention
- **Investigating**: Under active investigation
- **Resolved**: Issue fixed, monitoring for recurrence
- **Closed**: Fully resolved and documented

### Threat Detection

#### Automated Detection Features
- Multiple failed login attempts
- Unusual file upload patterns
- Suspicious IP addresses
- Rapid account changes

#### Manual Threat Detection
1. **Run Threat Detection**:
   - Click "Run Threat Detection" button
   - System analyzes recent activity
   - Generates threat report

2. **Review Results**:
   - Number of threats detected
   - Threat details and severity
   - Recommended actions

3. **Take Action**:
   - Investigate flagged activities
   - Create security incidents
   - Implement protective measures

### Security Best Practices

#### Regular Monitoring Tasks
- Daily security dashboard review
- Weekly incident report analysis
- Monthly security audit
- Quarterly security policy review

#### Preventive Measures
- Regular user access reviews
- Security awareness training
- System updates and patches
- Backup verification

## System Administration

### System Configuration

#### Environment Management
- Production vs development settings
- Environment variable configuration
- Service integration settings
- Performance optimization

#### Security Configuration
- Rate limiting settings
- File upload restrictions
- Access control policies
- Encryption settings

### Backup and Recovery

#### Automated Backups
- **Convex**: Automatic database backups
- **Sanity**: Content versioning and backups
- **Files**: Redundant storage with Convex

#### Manual Backup Procedures
```bash
# Export Sanity content
npx sanity dataset export production backup-$(date +%Y%m%d).tar.gz

# Backup user data (via admin interface)
# Use data export features in admin panel
```

#### Recovery Procedures
1. **Identify scope of data loss**
2. **Select appropriate backup**
3. **Coordinate with users if needed**
4. **Restore data from backup**
5. **Verify data integrity**
6. **Document incident and recovery**

### Performance Monitoring

#### Key Metrics to Monitor
- Page load times
- API response times
- File upload/download speeds
- User session duration
- Error rates

#### Performance Optimization
- CDN configuration
- Image optimization
- Caching strategies
- Database query optimization

### User Data Management

#### GDPR Compliance

**User Rights Management**:
- Data export requests
- Account deletion requests
- Data correction requests
- Privacy preference updates

**Data Processing Records**:
- User consent tracking
- Data processing activities
- Third-party data sharing
- Retention policy compliance

#### Data Export Process
1. **User Request**: User requests data export
2. **Verification**: Verify user identity
3. **Generation**: System generates export file
4. **Delivery**: Secure delivery to user
5. **Documentation**: Log export activity

#### Account Deletion Process
1. **User Request**: User requests account deletion
2. **Grace Period**: 30-day deactivation period
3. **Final Warning**: Notify user before permanent deletion
4. **Permanent Deletion**: Remove all user data
5. **Confirmation**: Confirm deletion completion

## Troubleshooting

### Common Admin Issues

#### User Management Issues

**Issue**: Cannot change user role
**Solutions**:
- Verify admin permissions
- Check if user is currently logged in
- Ensure user account is active
- Try refreshing admin session

**Issue**: User activity not showing
**Solutions**:
- Check if user has recent activity
- Verify audit logging is enabled
- Refresh the activity view
- Check system logs for errors

#### Content Management Issues

**Issue**: Sanity Studio not accessible
**Solutions**:
- Verify Sanity credentials
- Check CORS configuration
- Confirm API token permissions
- Test network connectivity

**Issue**: Content not updating on website
**Solutions**:
- Check webhook configuration
- Verify ISR settings
- Clear CDN cache
- Check deployment status

#### Security Monitoring Issues

**Issue**: Security alerts not working
**Solutions**:
- Verify monitoring configuration
- Check alert thresholds
- Test notification systems
- Review system logs

**Issue**: Threat detection not running
**Solutions**:
- Check system resources
- Verify database connectivity
- Review detection algorithms
- Test with known patterns

### System Diagnostics

#### Health Check Procedures
1. **Access Health Endpoint**: `/health`
2. **Review System Metrics**:
   - Memory usage
   - CPU utilization
   - Database connectivity
   - Storage availability

3. **Check Service Status**:
   - Convex backend status
   - Sanity CMS availability
   - CDN performance
   - External integrations

#### Log Analysis
- Application logs for errors
- Security logs for incidents
- Performance logs for optimization
- User activity logs for patterns

### Emergency Procedures

#### Security Incident Response
1. **Immediate Actions**:
   - Assess threat severity
   - Contain the incident
   - Notify stakeholders
   - Document everything

2. **Investigation**:
   - Gather evidence
   - Analyze attack vectors
   - Identify affected data
   - Determine root cause

3. **Recovery**:
   - Implement fixes
   - Restore services
   - Verify security
   - Monitor for recurrence

#### System Outage Response
1. **Assessment**:
   - Identify affected services
   - Determine impact scope
   - Estimate recovery time
   - Communicate status

2. **Recovery**:
   - Follow recovery procedures
   - Test system functionality
   - Verify data integrity
   - Resume normal operations

3. **Post-Incident**:
   - Document incident details
   - Analyze root cause
   - Implement improvements
   - Update procedures

### Maintenance Schedules

#### Daily Tasks
- Review security dashboard
- Check system health metrics
- Monitor user activity
- Address urgent incidents

#### Weekly Tasks
- User access review
- Content moderation
- Security incident analysis
- Performance optimization

#### Monthly Tasks
- Security audit
- Backup verification
- User data cleanup
- System updates

#### Quarterly Tasks
- Comprehensive security review
- Policy updates
- Training and documentation
- Disaster recovery testing

---

**Last Updated**: [Current Date]  
**Version**: 1.0  
**For Technical Support**: admin@your-domain.com