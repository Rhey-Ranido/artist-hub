# Admin Dashboard Setup and Usage

## Overview
The admin dashboard allows administrators to manage provider registrations and monitor platform activity. Providers must be approved by an admin before their services become visible to the public.

## Setup

### 1. Create Admin User
Run the seed script to create an admin user:
```bash
cd backend
npm run seed
```

This creates an admin user with:
- Email: `admin@example.com`
- Password: `password123`

### 2. Access Admin Dashboard
1. Login with the admin credentials
2. Navigate to `/admin` in the application
3. You'll see the admin dashboard with overview statistics and provider management

## Features

### Dashboard Overview
- **Statistics Cards**: Total users, pending providers, active services, approved providers
- **Recent Activity**: Latest provider registrations
- **Quick Actions**: Direct access to provider management

### Provider Management
- **View All Providers**: See all providers with their current status
- **Filter by Status**: Filter providers by pending, approved, rejected, or suspended
- **Search**: Search providers by name, bio, or location
- **Detailed View**: Click on any provider to see full details

### Provider Actions
- **Approve**: Approve pending providers (makes their services visible to public)
- **Reject**: Reject providers with optional reason
- **Suspend**: Suspend approved providers
- **Delete**: Permanently delete providers and their services

### Provider Statuses
- **Pending**: New registration awaiting admin review
- **Approved**: Provider is active and services are visible
- **Rejected**: Provider application was rejected
- **Suspended**: Provider is temporarily suspended

## API Endpoints

### Admin Routes (Protected - Admin Only)
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/providers` - Get all providers with filtering
- `GET /api/admin/providers/:id` - Get detailed provider information
- `PATCH /api/admin/providers/:id/status` - Update provider status
- `DELETE /api/admin/providers/:id` - Delete provider

### Provider Routes
- `GET /api/providers/me` - Get current user's provider profile (includes status)
- `POST /api/providers` - Create provider profile (status: pending by default)
- `PUT /api/providers/me` - Update provider profile

## Workflow

### Provider Registration Process
1. User registers as a provider
2. Provider profile is created with status: "pending"
3. Admin reviews the application in the admin dashboard
4. Admin approves or rejects the provider
5. If approved, provider's services become visible to the public
6. If rejected, provider can contact support for more information

### Provider Dashboard
- Pending providers see an approval status message
- Approved providers can create and manage services
- Rejected/suspended providers see appropriate status messages

## Security
- All admin routes require authentication and admin role
- Only admins can access the admin dashboard
- Provider status changes are logged and tracked
- Deletion of providers also removes associated services

## Testing
1. Create a regular user account
2. Register as a provider (status will be pending)
3. Login as admin and approve the provider
4. Verify the provider's services are now visible on the public services page 