# Kalkidan CMS User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [User Registration and Login](#user-registration-and-login)
3. [File Management](#file-management)
4. [Privacy Settings](#privacy-settings)
5. [Reading News and Content](#reading-news-and-content)
6. [Troubleshooting](#troubleshooting)

## Getting Started

Welcome to Kalkidan CMS! This guide will help you navigate and use all the features available to you as a user.

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- JavaScript enabled

### Accessing the System
1. Open your web browser
2. Navigate to [your-domain.com]
3. Click "Login" or "Register" to get started

## User Registration and Login

### Creating an Account

1. **Navigate to Registration**
   - Click "Register" on the homepage
   - Or go directly to `/auth/register`

2. **Fill in Your Information**
   - **Name**: Your full name (required)
   - **Email**: Valid email address (required)
   - **Phone**: Phone number (optional)
   - **Address**: Your address (optional)
   - **Password**: Strong password (required)
   - **Confirm Password**: Re-enter your password

3. **Password Requirements**
   - At least 8 characters long
   - Must contain at least 3 of the following:
     - Uppercase letter (A-Z)
     - Lowercase letter (a-z)
     - Number (0-9)
     - Special character (!@#$%^&*)

4. **Complete Registration**
   - Click "Register"
   - You'll be redirected to the login page
   - Use your email and password to log in

### Logging In

1. **Access Login Page**
   - Click "Login" on the homepage
   - Or go directly to `/auth/login`

2. **Enter Credentials**
   - Email address
   - Password

3. **Security Features**
   - Rate limiting: Limited login attempts for security
   - Session management: Automatic logout after inactivity
   - Secure authentication: Your password is encrypted

### Forgot Password
Currently, password reset functionality is handled by administrators. Contact support if you need to reset your password.

## File Management

### Accessing File Management
1. Log in to your account
2. Go to your dashboard
3. Click "My Files" or navigate to `/dashboard/files`

### Uploading Files

1. **Supported File Types**
   - Images: JPEG, PNG, GIF, WebP
   - Documents: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)
   - Text files: Plain text (.txt), CSV

2. **File Size Limits**
   - Images: Up to 5MB each
   - Documents: Up to 10MB each
   - Archives: Up to 50MB each

3. **Upload Process**
   - Click "Upload Files" button
   - Select files from your computer or drag and drop
   - Add optional description for each file
   - Choose privacy setting (private or public)
   - Click "Upload"

4. **Upload Progress**
   - Progress bar shows upload status
   - Success/error messages appear after upload
   - Files appear in your file list immediately

### Managing Your Files

1. **File List View**
   - See all your uploaded files
   - View file details (name, size, upload date)
   - See file privacy status (private/public)

2. **File Actions**
   - **Download**: Click the download button to save file to your computer
   - **Delete**: Remove files you no longer need
   - **Edit Details**: Update file name and description
   - **Change Privacy**: Make files public or private

3. **File Organization**
   - Files are sorted by upload date (newest first)
   - Use the search function to find specific files
   - Filter by file type or privacy status

### File Privacy Settings

- **Private Files**: Only you can access these files
- **Public Files**: Anyone with the link can access these files
- You can change privacy settings at any time

### Storage Quota
- Each user has a 1GB storage limit
- Monitor your usage in the file management dashboard
- Delete unused files to free up space

## Privacy Settings

### Accessing Privacy Settings
1. Go to your dashboard
2. Click "Privacy" or navigate to `/dashboard/privacy`

### Data Usage Preferences

Control how your data is used:

1. **Analytics**
   - Allow anonymous usage data collection
   - Helps improve the service
   - No personal information is shared

2. **Marketing Communications**
   - Receive emails about updates and features
   - Promotional content and newsletters
   - You can unsubscribe at any time

3. **Data Sharing**
   - Allow anonymized data sharing for research
   - No personal information is included
   - Helps improve the platform

### Exporting Your Data

You have the right to download all your personal data:

1. **Request Data Export**
   - Click "Download My Data" in privacy settings
   - System generates a JSON file with all your data
   - Includes: profile info, files metadata, activity logs

2. **What's Included**
   - Personal information (name, email, etc.)
   - File metadata (names, upload dates, sizes)
   - Login history and activity logs
   - Privacy preferences and settings

3. **What's NOT Included**
   - Actual file contents (download files separately)
   - Other users' data
   - System internal data

### Account Deletion

You can permanently delete your account:

1. **Request Deletion**
   - Go to Privacy Settings
   - Click "Request Account Deletion"
   - Type "DELETE MY ACCOUNT" to confirm

2. **What Happens**
   - Account is immediately deactivated
   - You're logged out of all sessions
   - Data is permanently deleted within 30 days
   - This action cannot be undone

3. **Grace Period**
   - 30-day period before permanent deletion
   - Contact support within 30 days to recover account
   - After 30 days, recovery is not possible

## Reading News and Content

### Accessing News
1. Navigate to `/news` from the main menu
2. Or click "Latest News" from your dashboard

### Content Types

1. **Articles**
   - In-depth content and analysis
   - Located at `/news/articles`

2. **Announcements**
   - Important updates and notifications
   - Located at `/news/announcements`

3. **Events**
   - Upcoming events and activities
   - Located at `/news/events`

### Reading Content
- Click on any article title to read the full content
- Use browser back button to return to the list
- Content is optimized for mobile and desktop reading

### Content Features
- **Rich Text**: Formatted text with headings, lists, and emphasis
- **Images**: Embedded images and media
- **Links**: External and internal links
- **Publication Date**: When content was published
- **Categories**: Content organized by topics

## Troubleshooting

### Common Issues

#### Login Problems

**Issue**: Can't log in with correct credentials
**Solutions**:
- Check if Caps Lock is on
- Ensure email is typed correctly
- Wait if you've exceeded login attempts (rate limiting)
- Clear browser cache and cookies
- Try a different browser

**Issue**: Forgot password
**Solutions**:
- Contact administrator for password reset
- Provide your registered email address
- Verify your identity as requested

#### File Upload Issues

**Issue**: File won't upload
**Solutions**:
- Check file size (must be under limits)
- Verify file type is supported
- Check internet connection
- Try uploading one file at a time
- Clear browser cache

**Issue**: Upload is slow
**Solutions**:
- Check internet connection speed
- Try uploading smaller files
- Upload during off-peak hours
- Close other browser tabs/applications

#### Page Loading Issues

**Issue**: Pages load slowly or not at all
**Solutions**:
- Check internet connection
- Refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache and cookies
- Try a different browser
- Disable browser extensions temporarily

#### File Access Issues

**Issue**: Can't download or access files
**Solutions**:
- Ensure you're logged in
- Check if file still exists (may have been deleted)
- Verify you have permission to access the file
- Try right-clicking and "Save As"

### Browser Compatibility

**Recommended Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features**:
- JavaScript enabled
- Cookies enabled
- Local storage enabled

### Getting Help

#### Self-Service Options
1. Check this user guide
2. Review error messages carefully
3. Try the troubleshooting steps above
4. Check system status page (if available)

#### Contact Support
If you still need help:
1. **Email**: support@your-domain.com
2. **Include in your message**:
   - Your email address
   - Description of the problem
   - Steps you've already tried
   - Browser and operating system
   - Screenshots (if helpful)

#### Response Times
- General inquiries: 24-48 hours
- Technical issues: 12-24 hours
- Urgent issues: 2-4 hours

### Security Best Practices

1. **Password Security**
   - Use a unique, strong password
   - Don't share your password
   - Log out when using shared computers
   - Report suspicious activity

2. **File Security**
   - Only upload files you own or have permission to share
   - Be careful with public file settings
   - Don't upload sensitive personal information
   - Regularly review and clean up old files

3. **Privacy Protection**
   - Review privacy settings regularly
   - Be cautious about what information you share
   - Understand how your data is used
   - Exercise your data rights when needed

## Frequently Asked Questions

### Account Questions

**Q: Can I change my email address?**
A: Currently, email changes must be handled by administrators. Contact support to request an email change.

**Q: How do I update my profile information?**
A: Go to your dashboard and click on your profile card to edit your information.

**Q: Can I have multiple accounts?**
A: Each person should have only one account. Multiple accounts may be disabled.

### File Questions

**Q: What happens to my files if I delete my account?**
A: All your files are permanently deleted along with your account after the 30-day grace period.

**Q: Can I share files with other users?**
A: You can make files public, which allows anyone with the link to access them. Direct user-to-user sharing is not currently available.

**Q: Is there a way to organize files into folders?**
A: Currently, files are organized by upload date and can be searched. Folder organization may be added in future updates.

### Privacy Questions

**Q: What data do you collect about me?**
A: We collect the information you provide (name, email, etc.), files you upload, and usage data. See our Privacy Policy for complete details.

**Q: Can I see what data you have about me?**
A: Yes, use the "Export Your Data" feature in Privacy Settings to download all your data.

**Q: How long do you keep my data?**
A: We keep your data as long as your account is active. Deleted accounts and data are permanently removed after 30 days.

---

**Last Updated**: [Current Date]  
**Version**: 1.0  
**Need Help?** Contact support@your-domain.com