# Admin Panel Documentation

## Overview

The admin panel allows authorized users to review and approve events before they are published to the public.

## Features

### Event Approval Workflow

1. **User Creates Event**: When a user creates an event, it is automatically set to "pending" status
2. **Admin Review**: Events appear in the admin dashboard at `/admin/events`
3. **Admin Actions**:
   - **Approve**: Makes the event public and visible to all users
   - **Reject**: Marks the event as rejected (not publicly visible)
   - **Delete**: Permanently removes the event
   - **Revoke**: Changes an approved event back to rejected

### Access Control

- Only users with email addresses listed in `ADMIN_EMAILS` environment variable can access the admin panel
- Admin panel is accessible at: `http://localhost:3000/admin`
- Non-admin users are automatically redirected to the home page

## Setup

### 1. Configure Admin Emails

Add admin email addresses to your `.env.local` file:

```env
ADMIN_EMAILS=your-admin-email@example.com,another-admin@example.com
```

**Important**: Use the exact email addresses that are registered with Clerk for your admin users.

### 2. Access the Admin Panel

Navigate to `/admin` or `/admin/events` in your browser. If you're logged in with an admin email, you'll see the dashboard.

## Admin Dashboard Features

### Event Filters

- **All Events**: Shows all events regardless of status
- **Pending**: Shows only events awaiting approval
- **Approved**: Shows only approved/published events
- **Rejected**: Shows only rejected events

### Event Actions

Each event card in the admin panel shows:

- Event title, description, and image
- Organizer information
- Current approval status (Pending/Approved/Rejected)
- Action buttons based on current status

### Search Functionality

Search events by title using the search bar in the admin dashboard.

### Statistics

The dashboard displays:

- Number of pending events
- Number of approved events
- Number of rejected events

## User Experience

### For Event Creators

1. After creating an event, users see a message: "Event submitted successfully! It will be visible after admin approval."
2. In their profile, they can see all their events with approval status badges:
   - **Yellow badge**: Pending Approval
   - **Green badge**: Published
   - **Red badge**: Rejected
3. Event creators can still edit their events (with admin approval required for changes)

### For Public Users

- Only approved events appear in:
  - Home page event listings
  - Search results
  - Category filters
  - Related events sections

## Database Schema Changes

### Event Model Updates

New fields added to the Event model:

- `isApproved`: Boolean (default: false)
- `approvalStatus`: Enum ['pending', 'approved', 'rejected'] (default: 'pending')

## API Functions

### Admin Actions (`lib/actions/admin.actions.ts`)

- `isAdmin()`: Checks if current user is an admin
- `getPendingEvents()`: Fetches all pending events
- `getAllEventsAdmin()`: Fetches all events with filtering
- `approveEvent(eventId)`: Approves an event
- `rejectEvent(eventId)`: Rejects an event
- `adminDeleteEvent(eventId)`: Deletes any event (admin only)

## Security Considerations

1. **Admin Check**: All admin functions verify user email against `ADMIN_EMAILS`
2. **Server-Side Validation**: Admin checks are performed server-side using Clerk's API
3. **Route Protection**: Admin layout automatically redirects non-admin users
4. **Environment Variables**: Admin emails are stored securely in environment variables

## Troubleshooting

### Can't Access Admin Panel

1. Verify your email is in the `ADMIN_EMAILS` environment variable
2. Make sure the email matches exactly (case-sensitive)
3. Restart the dev server after changing `.env.local`
4. Check you're logged in with the correct Clerk account

### Events Not Showing After Approval

1. Check the event's `isApproved` field in the database
2. Clear browser cache or use hard refresh (Ctrl+Shift+R)
3. Check console for any errors

### Multiple Admins

Add multiple emails separated by commas (no spaces):

```env
ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com
```

## Future Enhancements

- Email notifications to event creators when their event is approved/rejected
- Admin comments/feedback on rejected events
- Bulk approve/reject functionality
- Event editing requires re-approval
- Admin activity logs
