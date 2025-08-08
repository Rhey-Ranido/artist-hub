# Notification System

## Overview
The notification system tracks user interactions with artworks and provides real-time updates to users when someone reacts to their public artworks.

## Features

### Notification Types
- **Like**: When someone likes your artwork
- **Comment**: When someone comments on your artwork  
- **Reply**: When someone replies to a comment on your artwork

### UI Components
- **Navbar Badge**: Shows unread notification count in the dropdown menu
- **Notifications Page**: Full page to view all notifications
- **Real-time Updates**: Notification count refreshes every 30 seconds

## Backend Implementation

### Models
- `Notification.js`: Stores notification data with recipient, sender, artwork, type, and read status

### Controllers
- `notification.controller.js`: Handles CRUD operations for notifications
- Integrated with `artwork.controller.js` and `comment.controller.js` to create notifications automatically

### Routes
- `GET /api/notifications`: Get user's notifications
- `GET /api/notifications/unread-count`: Get unread count
- `PATCH /api/notifications/:id/read`: Mark notification as read
- `PATCH /api/notifications/mark-all-read`: Mark all notifications as read

## Frontend Implementation

### Components
- `Notifications.jsx`: Full notifications page
- Updated `Navbar.jsx`: Added notification dropdown item with badge

### Features
- **Unread Badge**: Shows count of unread notifications
- **Click to Navigate**: Clicking a notification takes you to the artwork
- **Mark as Read**: Automatic marking when clicked, manual "Mark all as read" button
- **Real-time Updates**: Count refreshes automatically

## Usage

### For Users
1. **View Notifications**: Click on "Notifications" in the navbar dropdown
2. **See Unread Count**: Red badge shows number of unread notifications
3. **Mark as Read**: Click on notifications or use "Mark all as read" button
4. **Navigate to Artwork**: Click any notification to go to the related artwork

### For Developers
1. **Create Notifications**: Use `createNotification()` helper function
2. **Fetch Notifications**: Call `/api/notifications` endpoint
3. **Update Count**: Call `/api/notifications/unread-count` endpoint

## Database Schema

```javascript
{
  recipient: ObjectId,    // User receiving the notification
  sender: ObjectId,       // User who triggered the notification
  artwork: ObjectId,      // Artwork being interacted with
  type: String,           // "like", "comment", or "reply"
  comment: ObjectId,      // Comment ID (for comment/reply notifications)
  isRead: Boolean,        // Whether notification has been read
  content: String,        // Comment content (for comment notifications)
  createdAt: Date,        // When notification was created
  updatedAt: Date         // When notification was last updated
}
```

## Integration Points

### Artwork Likes
- Location: `backend/controllers/artwork.controller.js`
- Function: `toggleLike()`
- Creates notification when user likes an artwork

### Comments
- Location: `backend/controllers/comment.controller.js`
- Function: `createComment()`
- Creates notification when user comments on an artwork

### Real-time Updates
- Navbar fetches unread count every 30 seconds
- Count updates automatically when notifications are marked as read

## Security Features
- Users can only see their own notifications
- Notifications are automatically filtered by recipient
- No self-notifications (users don't get notified for their own actions)
- Duplicate notifications are prevented
