# Event Attendees Feature

## Overview

Event organizers can now view detailed information about all attendees who have purchased tickets for their events.

## Features Implemented

### 1. **Attendees List Display**

- Shows comprehensive attendee information including:
  - Full name
  - Email address
  - Purchase date and time
  - Amount paid
- Only visible to the event organizer (verified by `ownerId`)
- Automatically appears on the event details page below event information

### 2. **Search Functionality**

- Real-time search by attendee name or email
- Case-insensitive filtering
- Instant results as you type

### 3. **Professional UI**

- Beautiful table layout with gradient header
- Avatar circles with initials for each attendee
- Responsive design for all screen sizes
- Color-coded status badges (FREE vs paid tickets)
- Hover effects for better UX

### 4. **Export to CSV**

- One-click download of attendee list
- Includes all filtered attendees
- Formatted with headers: Name, Email, Purchase Date, Amount
- Auto-generates filename based on event title
- Useful for external management and backup

### 5. **Empty States**

- Friendly message when no tickets sold yet
- Clear "no results" message when search has no matches
- Icon-based visual feedback

## Technical Implementation

### New Files Created

1. **`components/shared/AttendeesList.tsx`**
   - Client component for displaying and managing attendee data
   - Handles search, filtering, and CSV export
   - Fully responsive table layout

### Modified Files

1. **`lib/actions/order.actions.ts`**

   - Added `getEventAttendees()` server action
   - Fetches all orders for an event with buyer details
   - Populates user information (name, email)
   - Returns formatted attendee data

2. **`app/(root)/events/[id]/page.tsx`**
   - Added authentication check using `auth()`
   - Verifies if current user is event organizer
   - Conditionally fetches attendee data
   - Conditionally renders `AttendeesList` component

## Data Flow

```
Event Details Page (Server Component)
    ↓
Check if user is organizer (userId === event.ownerId)
    ↓
Fetch attendees via getEventAttendees(eventId)
    ↓
Query Orders → Populate Buyer (User model)
    ↓
Return formatted data: { name, email, purchaseDate, amount }
    ↓
Pass to AttendeesList (Client Component)
    ↓
Render table with search & export functionality
```

## Security & Privacy

- ✅ Only event organizers can view attendee information
- ✅ Authorization check at server level (`isOrganizer` validation)
- ✅ Non-organizers see nothing (component not rendered)
- ✅ Protected by Clerk authentication middleware
- ✅ Email addresses only visible to event creator

## Usage

### For Event Organizers:

1. Navigate to your event's detail page
2. Scroll down below event information
3. View the "Event Attendees" section
4. Search attendees by name or email
5. Click "Export CSV" to download the list

### What Organizers See:

- Total tickets sold count
- Searchable table of all attendees
- Each attendee's:
  - Name (with avatar)
  - Email address
  - Purchase date/time
  - Amount paid

## Future Enhancements

- [ ] Email notification to organizers when tickets are purchased
- [ ] Attendee check-in system (mark as attended)
- [ ] QR code generation for tickets
- [ ] Attendee communication (send bulk emails)
- [ ] Export to different formats (PDF, Excel)
- [ ] Analytics dashboard (sales over time)
- [ ] Refund management interface

## Database Schema (No Changes Required)

The feature uses existing models:

- **Order**: Links buyer to event with purchase details
- **User**: Contains email, firstName, lastName
- **Event**: Has ownerId for authorization

No database migrations needed - all data already available!

## Build Status

✅ TypeScript compilation successful  
✅ All routes optimized  
✅ Ready for production deployment
