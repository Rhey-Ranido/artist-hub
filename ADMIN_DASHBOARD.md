# Admin Dashboard Documentation

## Overview

The Admin Dashboard is a comprehensive management interface that allows administrators to manage users, artworks, providers, and tutorials. It's only accessible to users with the `admin` role.

## Features

### 🔐 Access Control
- Only users with `admin` role can access the dashboard
- Automatic redirect to login if not authenticated
- Automatic redirect to home if not an admin

### 📊 Dashboard Overview
- **Statistics Cards**: Display total users, pending providers, artworks, and tutorials
- **Recent Activity**: Show recent provider registrations
- **Quick Actions**: Access to all management sections

### 👥 User Management
- **View All Users**: List all registered users with pagination
- **Search Users**: Search by username, email, or name
- **Filter by Role**: Filter users by role (user, admin)
- **Suspend/Activate Users**: Toggle user account status
- **Delete Users**: Remove users and their associated data
- **User Details**: View detailed user information

### 🎨 Artwork Management
- **View All Artworks**: List all artworks with pagination
- **Search Artworks**: Search by title, description, or tags
- **Filter by Status**: Filter by public/private status
- **Make Public/Private**: Toggle artwork visibility
- **Delete Artworks**: Remove artworks from the platform
- **Artwork Details**: View detailed artwork information

### 👨‍💼 Provider Management
- **View All Providers**: List all service providers with pagination
- **Search Providers**: Search by name, bio, or location
- **Filter by Status**: Filter by approval status (pending, approved, rejected, suspended)
- **Approve/Reject Providers**: Manage provider applications
- **Suspend Providers**: Temporarily disable provider accounts
- **Delete Providers**: Remove providers and their services
- **Provider Details**: View detailed provider information

### 📚 Tutorial Management
- **View All Tutorials**: List all tutorials with pagination
- **Search Tutorials**: Search by title, description, or tags
- **Filter by Status**: Filter by published/draft status
- **Create Tutorials**: Add new tutorials with rich content
- **Edit Tutorials**: Modify existing tutorials
- **Delete Tutorials**: Remove tutorials from the platform
- **Tutorial Cards**: Beautiful card-based display for tutorials

## API Endpoints

### Dashboard Statistics
```
GET /api/admin/dashboard/stats
```

### User Management
```
GET /api/admin/users
PATCH /api/admin/users/:id/status
DELETE /api/admin/users/:id
```

### Artwork Management
```
GET /api/admin/artworks
PATCH /api/admin/artworks/:id/status
DELETE /api/admin/artworks/:id
```

### Provider Management
```
GET /api/admin/providers
GET /api/admin/providers/:id
PATCH /api/admin/providers/:id/status
DELETE /api/admin/providers/:id
```

### Tutorial Management
```
GET /api/admin/tutorials
POST /api/admin/tutorials
PUT /api/admin/tutorials/:id
DELETE /api/admin/tutorials/:id
```

## Database Models

### User Model Updates
- Added `isActive` field for account suspension
- Added `suspensionReason` field for admin notes
- Added `statusUpdatedAt` field for tracking changes

### Artwork Model Updates
- Added `adminNote` field for admin comments
- Added `statusUpdatedAt` field for tracking changes

### Tutorial Model (New)
- Complete tutorial management with rich content
- Support for thumbnails, categories, difficulty levels
- Step-by-step tutorial creation
- Materials and tags support

## Setup Instructions

### 1. Create Admin User
Run the admin creation script:
```bash
cd backend
node scripts/createAdmin.js
```

### 2. Login as Admin
Use the created admin credentials:
- Email: `admin@artcaps.com`
- Password: `admin123`

### 3. Access Dashboard
Navigate to `/admin` in the frontend application.

## Security Features

- **Role-based Access**: Only admin users can access
- **Authentication Required**: Must be logged in
- **CSRF Protection**: All requests require valid tokens
- **Input Validation**: All inputs are validated and sanitized
- **File Upload Security**: Tutorial thumbnails are validated

## File Structure

```
backend/
├── models/
│   ├── User.js (updated)
│   ├── Artwork.js (updated)
│   └── Tutorial.js (new)
├── controllers/
│   └── admin.controller.js (updated)
├── routes/
│   └── admin.route.js (updated)
└── uploads/
    └── tutorials/ (new)

frontend/
├── src/
│   ├── pages/
│   │   └── AdminDashboard.jsx (updated)
│   └── components/
│       └── TutorialCard.jsx (new)
```

## Usage Examples

### Creating a Tutorial
1. Navigate to Admin Dashboard
2. Click on "Tutorials" tab
3. Click "Add Tutorial" button
4. Fill in tutorial details:
   - Title and description
   - Content (rich text)
   - Category and difficulty
   - Estimated time
   - Tags and materials
   - Upload thumbnail (optional)
5. Choose to publish immediately or save as draft
6. Click "Create Tutorial"

### Managing Users
1. Navigate to Admin Dashboard
2. Click on "Users" tab
3. Search or filter users as needed
4. Use action buttons to:
   - View user details
   - Suspend/activate accounts
   - Delete users

### Managing Artworks
1. Navigate to Admin Dashboard
2. Click on "Artworks" tab
3. Search or filter artworks as needed
4. Use action buttons to:
   - View artwork details
   - Make public/private
   - Delete artworks

## Error Handling

The dashboard includes comprehensive error handling:
- Network errors are displayed to users
- Loading states for all operations
- Confirmation dialogs for destructive actions
- Input validation with helpful error messages

## Future Enhancements

- **Bulk Operations**: Select multiple items for batch actions
- **Advanced Analytics**: Detailed usage statistics and charts
- **Content Moderation**: Automated content filtering
- **Notification System**: Real-time admin notifications
- **Audit Logs**: Track all admin actions
- **Export Features**: Export data to CSV/PDF
- **Advanced Search**: Full-text search with filters
- **Tutorial Editor**: Rich text editor for tutorials

