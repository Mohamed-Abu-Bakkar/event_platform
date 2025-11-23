# Eventora - Event Management Platform Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [Application Routes](#application-routes)
5. [Core Functionalities](#core-functionalities)
6. [Business Logic](#business-logic)
7. [OOAD Diagrams](#ooad-diagrams)
   - [Use Case Diagram](#use-case-diagram)
   - [Class Diagram](#class-diagram)
   - [Activity Diagrams](#activity-diagrams)
   - [Sequence Diagrams](#sequence-diagrams)
   - [State Diagram](#state-diagram)
8. [API Endpoints](#api-endpoints)
9. [Security & Authentication](#security--authentication)
10. [Deployment](#deployment)

---

## Project Overview

**Eventora** is a modern, full-stack event management platform built with Next.js 14, TypeScript, MongoDB, and Clerk authentication. The platform enables users to discover events, create and manage their own events, and purchase tickets. It features an admin approval system for event moderation and ticket inventory management.

### Key Features

- ✅ User authentication and authorization (Clerk)
- ✅ Event creation, update, and deletion
- ✅ Admin approval workflow for events
- ✅ Ticket booking system with inventory tracking
- ✅ Event categorization and search
- ✅ File upload for event images (UploadThing)
- ✅ Responsive UI with Tailwind CSS and Shadcn/UI
- ✅ Server-side rendering and API routes
- ✅ Real-time event filtering and pagination

### Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions, MongoDB (Mongoose)
- **Authentication**: Clerk
- **File Storage**: UploadThing
- **UI Components**: Shadcn/UI, React Hook Form
- **Database**: MongoDB Atlas
- **Deployment**: Vercel (recommended)

---

## System Architecture

### Architecture Pattern

Eventora follows a **3-Tier Architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (Next.js Pages, Components, Client-side React)             │
│  - User Interface (Events, Profile, Admin Dashboard)        │
│  - Forms & Validation (React Hook Form + Zod)               │
│  - State Management (React Hooks)                            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  (Server Actions, API Routes, Business Rules)               │
│  - Event Management Logic (event.actions.ts)                │
│  - Order Processing (order.actions.ts)                       │
│  - Admin Operations (admin.actions.ts)                       │
│  - User Management (user.actions.ts)                         │
│  - Authentication & Authorization                            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  (MongoDB Database, Mongoose Models)                         │
│  - User Collection                                           │
│  - Event Collection                                          │
│  - Order Collection                                          │
│  - Category Collection                                       │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Server Actions**: Leverages Next.js 14 Server Actions for seamless server-client communication
2. **Server-Side Rendering**: Pages are rendered on the server for better SEO and performance
3. **API-less Architecture**: Direct database access through Server Actions eliminates traditional REST API layer
4. **Monolithic Repository**: Single codebase for frontend and backend
5. **Document-Based Database**: MongoDB for flexible schema and scalability

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────┐         ┌──────────────────┐
│      User        │         │     Category     │
├──────────────────┤         ├──────────────────┤
│ _id: ObjectId    │         │ _id: ObjectId    │
│ clerkId: String  │         │ name: String     │
│ email: String    │         └──────────────────┘
│ username: String │                  │
│ firstName: String│                  │
│ lastName: String │                  │
│ photo: String    │                  │
└──────────────────┘                  │
        │                             │
        │ organizer                   │ category
        │                             │
        ↓                             ↓
┌─────────────────────────────────────────────────────┐
│                     Event                            │
├─────────────────────────────────────────────────────┤
│ _id: ObjectId                                        │
│ title: String                                        │
│ description: String                                  │
│ location: String                                     │
│ imageUrl: String                                     │
│ startDateTime: Date                                  │
│ endDateTime: Date                                    │
│ price: String                                        │
│ isFree: Boolean                                      │
│ url: String                                          │
│ category: ObjectId (ref: Category)                   │
│ organizer: ObjectId (ref: User)                      │
│ ownerId: String (Clerk ID)                           │
│ maxTickets: Number                                   │
│ isApproved: Boolean                                  │
│ approvalStatus: Enum['pending','approved','rejected']│
│ createdAt: Date                                      │
└─────────────────────────────────────────────────────┘
        │
        │ event
        │
        ↓
┌──────────────────┐
│      Order       │
├──────────────────┤
│ _id: ObjectId    │
│ createdAt: Date  │
│ totalAmount: Str │
│ event: ObjectId  │◄──────┐
│ buyer: ObjectId  │       │
└──────────────────┘       │
        │                  │
        └──────────────────┘
           buyer
```

### Collections

#### 1. User Collection

Stores user information synchronized from Clerk authentication.

| Field     | Type     | Required | Unique | Description               |
| --------- | -------- | -------- | ------ | ------------------------- |
| \_id      | ObjectId | Yes      | Yes    | MongoDB unique identifier |
| clerkId   | String   | Yes      | Yes    | Clerk authentication ID   |
| email     | String   | Yes      | Yes    | User email address        |
| username  | String   | Yes      | Yes    | Unique username           |
| firstName | String   | Yes      | No     | User's first name         |
| lastName  | String   | Yes      | No     | User's last name          |
| photo     | String   | Yes      | No     | Profile photo URL         |

**Indexes**: clerkId, email, username

#### 2. Event Collection

Stores all event information with approval workflow.

| Field          | Type     | Required | Default | Description                        |
| -------------- | -------- | -------- | ------- | ---------------------------------- |
| \_id           | ObjectId | Yes      | -       | MongoDB unique identifier          |
| title          | String   | Yes      | -       | Event title                        |
| description    | String   | No       | -       | Event description                  |
| location       | String   | No       | -       | Event location or "Online"         |
| imageUrl       | String   | Yes      | -       | Event cover image URL              |
| startDateTime  | Date     | Yes      | Now     | Event start date and time          |
| endDateTime    | Date     | Yes      | Now     | Event end date and time            |
| price          | String   | No       | -       | Ticket price                       |
| isFree         | Boolean  | No       | false   | Whether event is free              |
| url            | String   | No       | -       | External event URL                 |
| category       | ObjectId | Yes      | -       | Reference to Category              |
| organizer      | ObjectId | Yes      | -       | Reference to User (organizer)      |
| ownerId        | String   | Yes      | -       | Clerk user ID (for quick querying) |
| maxTickets     | Number   | No       | 0       | Maximum tickets (0 = unlimited)    |
| isApproved     | Boolean  | No       | false   | Admin approval status              |
| approvalStatus | Enum     | No       | pending | 'pending', 'approved', 'rejected'  |
| createdAt      | Date     | No       | Now     | Event creation timestamp           |

**Indexes**: ownerId, category, organizer, approvalStatus, createdAt

#### 3. Order Collection

Stores ticket purchase records.

| Field       | Type     | Required | Default | Description               |
| ----------- | -------- | -------- | ------- | ------------------------- |
| \_id        | ObjectId | Yes      | -       | MongoDB unique identifier |
| createdAt   | Date     | No       | Now     | Order creation timestamp  |
| totalAmount | String   | No       | -       | Total payment amount      |
| event       | ObjectId | Yes      | -       | Reference to Event        |
| buyer       | ObjectId | Yes      | -       | Reference to User (buyer) |

**Indexes**: buyer, event, createdAt

#### 4. Category Collection

Stores event categories.

| Field | Type     | Required | Unique | Description               |
| ----- | -------- | -------- | ------ | ------------------------- |
| \_id  | ObjectId | Yes      | Yes    | MongoDB unique identifier |
| name  | String   | Yes      | Yes    | Category name             |

**Indexes**: name

---

## Application Routes

### Public Routes (No Authentication Required)

| Route          | Type | Description                   |
| -------------- | ---- | ----------------------------- |
| `/`            | Page | Home page with event listings |
| `/events/[id]` | Page | Event details page            |
| `/sign-in`     | Page | Clerk sign-in page            |
| `/sign-up`     | Page | Clerk sign-up page            |

### Protected Routes (Authentication Required)

| Route                 | Type | Description                        |
| --------------------- | ---- | ---------------------------------- |
| `/events/create`      | Page | Create new event form              |
| `/events/[id]/update` | Page | Update existing event              |
| `/profile`            | Page | User profile with organized events |
| `/orders`             | Page | User's ticket purchases            |

### Admin Routes (Admin Authorization Required)

| Route           | Type | Description                          |
| --------------- | ---- | ------------------------------------ |
| `/admin`        | Page | Redirects to /admin/events           |
| `/admin/events` | Page | Admin dashboard for event moderation |

### API Routes

| Route                | Method | Description             |
| -------------------- | ------ | ----------------------- |
| `/api/webhook/clerk` | POST   | Clerk user sync webhook |
| `/api/uploadthing`   | POST   | File upload endpoint    |

---

## Core Functionalities

### 1. User Management

#### Registration & Authentication

- **Technology**: Clerk Authentication
- **Process**:
  1. User signs up via Clerk UI
  2. Webhook triggers to sync user data to MongoDB
  3. User metadata stored in Clerk includes MongoDB user ID
  4. Automatic sign-in after registration

#### User Profile

- View organized events
- View purchased tickets
- Edit/delete own events
- Create new events

### 2. Event Management

#### Event Creation

**Flow**:

1. Authenticated user fills event form
2. Image upload via UploadThing
3. Event saved with `approvalStatus: 'pending'`
4. Event awaits admin approval
5. User notified of submission

**Fields**:

- Title, Description, Location
- Start/End DateTime
- Category
- Price (or Free)
- Max Tickets
- Event Image
- External URL

**Validation**:

- Title: min 3 characters
- Description: 3-400 characters
- Location: 3-400 characters
- URL: Valid URL format
- Image: Required
- Dates: Valid date range

#### Event Update

**Authorization**: Only event owner can update
**Process**:

1. Fetch existing event data
2. Pre-populate form
3. Update fields
4. Image re-upload if changed
5. Save updates
6. Revalidate cache

#### Event Deletion

**Authorization**: Owner or Admin
**Process**:

1. Verify ownership
2. Confirm deletion
3. Remove event from database
4. Cascade delete related orders (optional)
5. Revalidate cache

### 3. Event Discovery

#### Browse Events

- **Pagination**: 6 events per page
- **Filtering**: By category
- **Search**: By title (case-insensitive regex)
- **Sorting**: By creation date (newest first)
- **Display**: Only approved events shown to public

#### Event Details

- Full event information
- Organizer details
- Related events (same category)
- Checkout button (if tickets available)
- Edit/delete buttons (if owner)

### 4. Ticket Booking System

#### Purchase Flow

1. User clicks "Get Ticket"
2. Mock checkout form (no payment gateway)
3. Order created in database
4. Ticket count decremented
5. Success confirmation
6. Order visible in user's orders page

#### Ticket Inventory Management

- **Max Tickets**: Set by event organizer
- **Available Tickets**: Calculated as `maxTickets - soldTickets`
- **Sold Out**: Checkout disabled when tickets exhausted
- **Unlimited**: maxTickets = 0 means no limit

#### Order Management

- View all purchased tickets
- Order details (event, date, amount)
- Filter orders by event

### 5. Admin Panel

#### Event Moderation

**Admin Dashboard Features**:

- View all events (pending/approved/rejected/all)
- Search events by title
- Filter by approval status
- Statistics cards (counts)
- Approve/Reject events
- Delete events
- Revoke approvals

**Approval Workflow**:

```
Event Created → Pending
    ↓
Admin Reviews
    ↓
├─→ Approve → Published (visible to public)
├─→ Reject → Hidden (not visible to public)
└─→ Delete → Permanently removed
```

**Admin Authorization**:

- Email-based authorization
- Configured via `ADMIN_EMAILS` environment variable
- Checked on every admin page access

### 6. Category Management

#### Categories

- Predefined categories (e.g., Technology, Business, Health, Arts)
- Used for event classification
- Enables filtering and related events
- Admin can add new categories via database

---

## Business Logic

### Event Approval Logic

```typescript
// When event is created
event.approvalStatus = "pending";
event.isApproved = false;

// Admin approves
if (admin.approve(eventId)) {
  event.approvalStatus = "approved";
  event.isApproved = true;
  // Event now visible to public
}

// Admin rejects
if (admin.reject(eventId)) {
  event.approvalStatus = "rejected";
  event.isApproved = false;
  // Event hidden from public
}
```

### Ticket Availability Logic

```typescript
// Check available tickets
function getAvailableTickets(eventId) {
  const event = getEvent(eventId);
  if (event.maxTickets === 0) {
    return Infinity; // Unlimited tickets
  }

  const soldTickets = countOrders(eventId);
  const available = event.maxTickets - soldTickets;

  return Math.max(0, available);
}

// Validate checkout
function canCheckout(eventId) {
  const available = getAvailableTickets(eventId);
  return available > 0;
}
```

### Event Visibility Logic

```typescript
// Public event listing
function getPublicEvents() {
  return Event.find({
    isApproved: true,
    approvalStatus: "approved",
  });
}

// User's own events (all statuses)
function getUserEvents(userId) {
  return Event.find({
    ownerId: userId,
  });
}
```

### Authorization Logic

```typescript
// Check event ownership
function canEditEvent(userId, eventId) {
  const event = getEvent(eventId);
  return event.ownerId === userId;
}

// Check admin access
function isAdmin(userEmail) {
  const adminEmails = process.env.ADMIN_EMAILS.split(",");
  return adminEmails.includes(userEmail);
}
```

---

## OOAD Diagrams

### Use Case Diagram

```
                    ┌─────────────────────────────────────┐
                    │        Eventora System              │
                    └─────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
    ┌───────┐                  ┌────────┐                 ┌──────────┐
    │ Guest │                  │  User  │                 │  Admin   │
    └───────┘                  └────────┘                 └──────────┘
        │                           │                           │
        │                           │                           │
        ├─── Browse Events          ├─── Sign Up/Sign In        │
        │                           │                           │
        ├─── Search Events          ├─── Create Event           │
        │                           │                           │
        ├─── View Event Details     ├─── Update Event           │
        │                           │                           │
        └─── Filter by Category     ├─── Delete Event           │
                                    │                           │
                                    ├─── Purchase Ticket        │
                                    │                           │
                                    ├─── View My Events         │
                                    │                           │
                                    ├─── View My Orders         │
                                    │                           │
                                    └─── Upload Event Image     │
                                                                │
                                                                ├─── View All Events
                                                                │
                                                                ├─── Approve Event
                                                                │
                                                                ├─── Reject Event
                                                                │
                                                                └─── Delete Any Event

Use Cases:
──────────────────────────────────────────────────────────────────
UC1: Browse Events
UC2: Search Events
UC3: Filter by Category
UC4: View Event Details
UC5: Sign Up/Sign In
UC6: Create Event
UC7: Update Event
UC8: Delete Event
UC9: Purchase Ticket
UC10: View My Events
UC11: View My Orders
UC12: Upload Event Image
UC13: Approve Event (Admin)
UC14: Reject Event (Admin)
UC15: View Admin Dashboard (Admin)
```

### Class Diagram

```
┌────────────────────────────────┐
│           User                 │
├────────────────────────────────┤
│ - _id: ObjectId                │
│ - clerkId: String              │
│ - email: String                │
│ - username: String             │
│ - firstName: String            │
│ - lastName: String             │
│ - photo: String                │
├────────────────────────────────┤
│ + createUser()                 │
│ + updateUser()                 │
│ + deleteUser()                 │
│ + getUserById()                │
└────────────────────────────────┘
         △                △
         │                │
         │ organizer      │ buyer
         │                │
         │                │
┌────────────────────────────────┐         ┌────────────────────────────────┐
│          Event                 │◄────────│         Category               │
├────────────────────────────────┤ belongs │────────────────────────────────┤
│ - _id: ObjectId                │   to    │ - _id: ObjectId                │
│ - title: String                │         │ - name: String                 │
│ - description: String          │         ├────────────────────────────────┤
│ - location: String             │         │ + getAllCategories()           │
│ - imageUrl: String             │         │ + createCategory()             │
│ - startDateTime: Date          │         └────────────────────────────────┘
│ - endDateTime: Date            │
│ - price: String                │
│ - isFree: Boolean              │
│ - url: String                  │
│ - category: ObjectId           │
│ - organizer: ObjectId          │
│ - ownerId: String              │
│ - maxTickets: Number           │
│ - isApproved: Boolean          │
│ - approvalStatus: Enum         │
│ - createdAt: Date              │
├────────────────────────────────┤
│ + createEvent()                │
│ + updateEvent()                │
│ + deleteEvent()                │
│ + getEventById()               │
│ + getAllEvents()               │
│ + getEventsByUser()            │
│ + getRelatedEvents()           │
└────────────────────────────────┘
         △
         │
         │ event
         │
┌────────────────────────────────┐
│          Order                 │
├────────────────────────────────┤
│ - _id: ObjectId                │
│ - createdAt: Date              │
│ - totalAmount: String          │
│ - event: ObjectId              │
│ - buyer: ObjectId              │
├────────────────────────────────┤
│ + checkoutOrder()              │
│ + getOrdersByUser()            │
│ + getOrdersByEvent()           │
│ + getAvailableTickets()        │
└────────────────────────────────┘

┌────────────────────────────────┐
│      AdminService              │
├────────────────────────────────┤
│ + isAdmin(): Boolean           │
│ + getAllEventsAdmin()          │
│ + approveEvent()               │
│ + rejectEvent()                │
│ + adminDeleteEvent()           │
└────────────────────────────────┘
```

### Activity Diagram - Event Creation Flow

```
                    START
                      │
                      ▼
            ┌─────────────────────┐
            │  User clicks         │
            │  "Create Event"      │
            └─────────────────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │  Check if user is   │
            │  authenticated      │
            └─────────────────────┘
                      │
                ┌─────┴─────┐
                │           │
            No  │           │  Yes
                │           │
                ▼           ▼
        ┌──────────┐   ┌─────────────────────┐
        │ Redirect │   │ Display Event Form  │
        │ to Login │   │ with empty fields   │
        └──────────┘   └─────────────────────┘
                                  │
                                  ▼
                        ┌─────────────────────┐
                        │ User fills form:    │
                        │ - Title             │
                        │ - Description       │
                        │ - Location          │
                        │ - DateTime          │
                        │ - Category          │
                        │ - Price/Free        │
                        │ - Max Tickets       │
                        │ - Image             │
                        └─────────────────────┘
                                  │
                                  ▼
                        ┌─────────────────────┐
                        │ User uploads image  │
                        │ (UploadThing)       │
                        └─────────────────────┘
                                  │
                                  ▼
                        ┌─────────────────────┐
                        │ User clicks Submit  │
                        └─────────────────────┘
                                  │
                                  ▼
                        ┌─────────────────────┐
                        │ Validate form data  │
                        │ (Zod schema)        │
                        └─────────────────────┘
                                  │
                        ┌─────────┴─────────┐
                        │                   │
                    Invalid            Valid
                        │                   │
                        ▼                   ▼
                ┌──────────────┐  ┌─────────────────────┐
                │ Show errors  │  │ Upload image to     │
                │ Return form  │  │ cloud storage       │
                └──────────────┘  └─────────────────────┘
                                            │
                                            ▼
                                  ┌─────────────────────┐
                                  │ Create event in DB: │
                                  │ - Set ownerId       │
                                  │ - approvalStatus =  │
                                  │   'pending'         │
                                  │ - isApproved=false  │
                                  └─────────────────────┘
                                            │
                                            ▼
                                  ┌─────────────────────┐
                                  │ Show success alert: │
                                  │ "Event submitted,   │
                                  │  awaiting approval" │
                                  └─────────────────────┘
                                            │
                                            ▼
                                  ┌─────────────────────┐
                                  │ Redirect to         │
                                  │ Profile page        │
                                  └─────────────────────┘
                                            │
                                            ▼
                                          END
```

### Activity Diagram - Admin Approval Flow

```
                    START (Admin Dashboard)
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Fetch all events    │
                    │ from database       │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Display stats:      │
                    │ - Total events      │
                    │ - Pending count     │
                    │ - Approved count    │
                    │ - Rejected count    │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Admin selects       │
                    │ filter tab          │
                    └─────────────────────┘
                              │
                    ┌─────────┴─────────┬─────────┬─────────┐
                    │                   │         │         │
                Pending             Approved  Rejected    All
                    │                   │         │         │
                    └───────────────────┴─────────┴─────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Display filtered    │
                    │ event cards         │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Admin reviews       │
                    │ event details       │
                    └─────────────────────┘
                              │
                    ┌─────────┴─────────┬─────────┐
                    │                   │         │
                Approve             Reject    Delete
                    │                   │         │
                    ▼                   ▼         ▼
        ┌─────────────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Update event:       │ │ Update event:│ │ Confirm      │
        │ approvalStatus=     │ │ approvalStatus│ │ deletion     │
        │ 'approved'          │ │ ='rejected'  │ └──────────────┘
        │ isApproved=true     │ │ isApproved=  │        │
        └─────────────────────┘ │ false        │   ┌────┴────┐
                    │           └──────────────┘   │         │
                    │                   │         Yes       No
                    │                   │          │         │
                    │                   │          ▼         ▼
                    │                   │   ┌──────────┐ ┌────────┐
                    │                   │   │  Delete  │ │ Cancel │
                    │                   │   │  event   │ └────────┘
                    │                   │   └──────────┘
                    │                   │          │
                    └───────────────────┴──────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Refresh event list  │
                    │ Update statistics   │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Show success        │
                    │ notification        │
                    └─────────────────────┘
                              │
                              ▼
                            END
```

### Activity Diagram - Ticket Purchase Flow

```
                    START
                      │
                      ▼
            ┌─────────────────────┐
            │ User views event    │
            │ details page        │
            └─────────────────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │ Calculate available │
            │ tickets             │
            └─────────────────────┘
                      │
            ┌─────────┴─────────┐
            │                   │
      Sold Out              Available
            │                   │
            ▼                   ▼
    ┌──────────────┐  ┌─────────────────────┐
    │ Show "Sold   │  │ Show "Get Ticket"   │
    │  Out" badge  │  │ button with count   │
    └──────────────┘  └─────────────────────┘
                                │
                                ▼
                      ┌─────────────────────┐
                      │ User clicks         │
                      │ "Get Ticket"        │
                      └─────────────────────┘
                                │
                                ▼
                      ┌─────────────────────┐
                      │ Check if user is    │
                      │ authenticated       │
                      └─────────────────────┘
                                │
                      ┌─────────┴─────────┐
                      │                   │
                    No                  Yes
                      │                   │
                      ▼                   ▼
              ┌──────────────┐  ┌─────────────────────┐
              │ Redirect to  │  │ Display checkout    │
              │ sign-in page │  │ form (mock)         │
              └──────────────┘  └─────────────────────┘
                                          │
                                          ▼
                                ┌─────────────────────┐
                                │ User confirms       │
                                │ purchase            │
                                └─────────────────────┘
                                          │
                                          ▼
                                ┌─────────────────────┐
                                │ Check ticket        │
                                │ availability again  │
                                └─────────────────────┘
                                          │
                              ┌───────────┴───────────┐
                              │                       │
                        Still Available          Sold Out
                              │                       │
                              ▼                       ▼
                    ┌─────────────────────┐  ┌──────────────┐
                    │ Check/Create buyer  │  │ Show error   │
                    │ user in DB          │  │ "Sold out"   │
                    └─────────────────────┘  └──────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Create Order:       │
                    │ - buyer             │
                    │ - event             │
                    │ - totalAmount       │
                    │ - timestamp         │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Decrement available │
                    │ tickets count       │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Show success        │
                    │ message             │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Redirect to orders  │
                    │ page                │
                    └─────────────────────┘
                              │
                              ▼
                            END
```

### Sequence Diagram - Event Creation

```
User          EventForm      Server Action    MongoDB       UploadThing
 │                │               │             │                │
 │   Fill Form    │               │             │                │
 │───────────────>│               │             │                │
 │                │               │             │                │
 │  Select Image  │               │             │                │
 │───────────────>│               │             │                │
 │                │               │             │                │
 │    Submit      │               │             │                │
 │───────────────>│               │             │                │
 │                │  Upload Image │             │                │
 │                │──────────────────────────────────────────────>│
 │                │               │             │                │
 │                │               │             │    Image URL   │
 │                │<──────────────────────────────────────────────│
 │                │               │             │                │
 │                │ createEvent() │             │                │
 │                │──────────────>│             │                │
 │                │               │             │                │
 │                │               │  auth()     │                │
 │                │               │─────┐       │                │
 │                │               │     │       │                │
 │                │               │<────┘       │                │
 │                │               │             │                │
 │                │               │ Insert Event│                │
 │                │               │────────────>│                │
 │                │               │             │                │
 │                │               │   Event Doc │                │
 │                │               │<────────────│                │
 │                │               │             │                │
 │                │  Event Result │             │                │
 │                │<──────────────│             │                │
 │                │               │             │                │
 │  Success Alert │               │             │                │
 │<───────────────│               │             │                │
 │                │               │             │                │
 │  Redirect to   │               │             │                │
 │    /profile    │               │             │                │
 │<───────────────│               │             │                │
```

### Sequence Diagram - Admin Approval

```
Admin      AdminDashboard   AdminAction    MongoDB       User
 │              │               │             │            │
 │  Access      │               │             │            │
 │  /admin      │               │             │            │
 │─────────────>│               │             │            │
 │              │               │             │            │
 │              │  isAdmin()    │             │            │
 │              │──────────────>│             │            │
 │              │               │             │            │
 │              │               │  Get User   │            │
 │              │               │────────────>│            │
 │              │               │             │            │
 │              │               │  User Doc   │            │
 │              │               │<────────────│            │
 │              │               │             │            │
 │              │  Authorized   │             │            │
 │              │<──────────────│             │            │
 │              │               │             │            │
 │  Display     │               │             │            │
 │  Dashboard   │               │             │            │
 │<─────────────│               │             │            │
 │              │               │             │            │
 │  Filter:     │               │             │            │
 │  Pending     │               │             │            │
 │─────────────>│               │             │            │
 │              │               │             │            │
 │              │getAllEventsAdmin()          │            │
 │              │──────────────>│             │            │
 │              │               │             │            │
 │              │               │ Find Events │            │
 │              │               │ (status=    │            │
 │              │               │  pending)   │            │
 │              │               │────────────>│            │
 │              │               │             │            │
 │              │               │ Event List  │            │
 │              │               │<────────────│            │
 │              │               │             │            │
 │              │  Events Array │             │            │
 │              │<──────────────│             │            │
 │              │               │             │            │
 │  Show Events │               │             │            │
 │<─────────────│               │             │            │
 │              │               │             │            │
 │  Click       │               │             │            │
 │  Approve     │               │             │            │
 │─────────────>│               │             │            │
 │              │               │             │            │
 │              │approveEvent() │             │            │
 │              │──────────────>│             │            │
 │              │               │             │            │
 │              │               │Update Event │            │
 │              │               │ Set approved│            │
 │              │               │────────────>│            │
 │              │               │             │            │
 │              │               │   Updated   │            │
 │              │               │<────────────│            │
 │              │               │             │            │
 │              │   Success     │             │            │
 │              │<──────────────│             │            │
 │              │               │             │            │
 │  Refresh     │               │             │            │
 │  Event List  │               │             │            │
 │<─────────────│               │             │  Event now │
 │              │               │             │  visible to│
 │              │               │             │  public    │
 │              │               │             │───────────>│
```

### State Diagram - Event Lifecycle

```
                    ┌─────────┐
                    │  START  │
                    └────┬────┘
                         │
                         │ User creates event
                         │
                         ▼
                  ┌──────────────┐
            ┌─────│   PENDING    │◄────┐
            │     │  (awaiting   │     │
            │     │   approval)  │     │
            │     └──────────────┘     │
            │            │              │
            │            │              │
   Admin    │            │              │ Admin
   Rejects  │            │ Admin        │ Revokes
            │            │ Approves     │
            │            │              │
            ▼            ▼              │
      ┌──────────┐  ┌──────────┐       │
      │ REJECTED │  │ APPROVED │───────┘
      │(hidden)  │  │(public)  │
      └────┬─────┘  └────┬─────┘
           │             │
           │             │
           │ Admin       │ Admin/Owner
           │ Approves    │ Deletes
           │             │
           │             ▼
           │        ┌──────────┐
           └───────>│ DELETED  │
                    │(removed) │
                    └────┬─────┘
                         │
                         ▼
                    ┌─────────┐
                    │   END   │
                    └─────────┘

State Descriptions:
───────────────────────────────────────────────────────
PENDING:
  - Event created by user
  - Not visible to public
  - Awaiting admin review
  - Owner can edit/delete
  - Default state

APPROVED:
  - Admin approved event
  - Visible to public in listings
  - Users can purchase tickets
  - Owner can edit/delete
  - Admin can revoke or delete

REJECTED:
  - Admin rejected event
  - Not visible to public
  - Owner can still see in profile
  - Admin can re-approve or delete
  - Owner can edit and resubmit

DELETED:
  - Permanently removed from system
  - All references cascade deleted
  - Cannot be recovered
  - Terminal state
```

---

## API Endpoints

### Server Actions (Next.js App Router)

#### Event Actions (`lib/actions/event.actions.ts`)

| Function                       | Parameters                       | Returns         | Description                     |
| ------------------------------ | -------------------------------- | --------------- | ------------------------------- |
| `createEvent()`                | event, path                      | Event           | Create new event (pending)      |
| `updateEvent()`                | event, path                      | Event           | Update existing event           |
| `deleteEvent()`                | eventId, path                    | void            | Delete event (owner only)       |
| `getEventById()`               | eventId                          | Event           | Get single event details        |
| `getAllEvents()`               | query, limit, page, category     | Events[], count | Get approved events (paginated) |
| `getEventsByUser()`            | userId, limit, page              | Events[], count | Get user's events               |
| `getRelatedEventsByCategory()` | categoryId, eventId, limit, page | Events[], count | Get related events              |

#### Order Actions (`lib/actions/order.actions.ts`)

| Function                | Parameters          | Returns         | Description                 |
| ----------------------- | ------------------- | --------------- | --------------------------- |
| `checkoutOrder()`       | order               | Order           | Create ticket order         |
| `getOrdersByUser()`     | userId, limit, page | Orders[], count | Get user's orders           |
| `getOrdersByEvent()`    | eventId             | Orders[]        | Get event's orders          |
| `getAvailableTickets()` | eventId             | Number          | Calculate available tickets |

#### Admin Actions (`lib/actions/admin.actions.ts`)

| Function              | Parameters                 | Returns         | Description                 |
| --------------------- | -------------------------- | --------------- | --------------------------- |
| `isAdmin()`           | -                          | Boolean         | Check if user is admin      |
| `getAllEventsAdmin()` | query, limit, page, status | Events[], count | Get all events (admin view) |
| `approveEvent()`      | eventId                    | Event           | Approve pending event       |
| `rejectEvent()`       | eventId                    | Event           | Reject event                |
| `adminDeleteEvent()`  | eventId                    | void            | Delete any event (admin)    |

#### User Actions (`lib/actions/user.actions.ts`)

| Function        | Parameters    | Returns | Description            |
| --------------- | ------------- | ------- | ---------------------- |
| `createUser()`  | user          | User    | Create user from Clerk |
| `updateUser()`  | clerkId, user | User    | Update user info       |
| `deleteUser()`  | clerkId       | User    | Delete user            |
| `getUserById()` | userId        | User    | Get user by MongoDB ID |

#### Category Actions (`lib/actions/category.actions.ts`)

| Function             | Parameters | Returns    | Description         |
| -------------------- | ---------- | ---------- | ------------------- |
| `getAllCategories()` | -          | Category[] | Get all categories  |
| `createCategory()`   | name       | Category   | Create new category |

### REST API Endpoints

| Endpoint             | Method | Description                 |
| -------------------- | ------ | --------------------------- |
| `/api/webhook/clerk` | POST   | Clerk webhook for user sync |
| `/api/uploadthing`   | POST   | File upload handler         |

---

## Security & Authentication

### Authentication Flow

1. **Clerk Integration**

   - OAuth providers supported
   - Email/Password authentication
   - Magic link authentication
   - Session management

2. **User Synchronization**

   - Webhook triggered on user creation/update
   - User data synced to MongoDB
   - Metadata stored in Clerk for bi-directional sync

3. **Authorization Middleware**
   ```typescript
   // middleware.ts
   publicRoutes: ["/", "/events/:id"];
   protectedRoutes: ["/events/create", "/profile", "/orders"];
   adminRoutes: ["/admin/*"];
   ```

### Security Measures

1. **Environment Variables**

   - Sensitive keys stored in `.env.local`
   - Never committed to version control
   - Separate configs for dev/prod

2. **Server-Side Validation**

   - Zod schema validation
   - Input sanitization
   - SQL injection prevention (NoSQL)

3. **Authorization Checks**

   - Owner verification for edit/delete
   - Admin email verification
   - Route protection via middleware

4. **Data Protection**
   - No payment data stored (mock checkout)
   - User passwords managed by Clerk
   - HTTPS enforced in production

---

## Deployment

### Environment Variables Required

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
WEBHOOK_SECRET=

# MongoDB
MONGODB_URI=

# UploadThing
UPLOADTHING_SECRET=

# Server
NEXT_PUBLIC_SERVER_URL=

# Admin
ADMIN_EMAILS=email1@example.com,email2@example.com
```

### Deployment Steps

#### Vercel (Recommended)

1. Push code to GitHub
2. Import repository to Vercel
3. Set environment variables
4. Deploy automatically

#### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Database Setup

1. Create MongoDB Atlas cluster
2. Whitelist IP addresses
3. Create database user
4. Get connection string
5. Add to environment variables

### Webhook Configuration

1. **Clerk Webhooks**
   - Endpoint: `https://yourdomain.com/api/webhook/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Add signing secret to env

### Performance Optimization

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Server component caching
- **CDN**: Static assets via Vercel CDN
- **Database Indexing**: Indexes on frequently queried fields

---

## Conclusion

Eventora is a comprehensive event management platform built with modern web technologies. The system follows SOLID principles, uses server-side rendering for performance, and implements a robust admin approval workflow. The architecture is scalable, secure, and maintainable, making it suitable for production deployment.

### Future Enhancements

- [ ] Real payment gateway integration (Stripe/PayPal)
- [ ] Email notifications for event approvals
- [ ] Event analytics dashboard
- [ ] QR code ticket generation
- [ ] Multi-language support
- [ ] Calendar integration
- [ ] Social sharing features
- [ ] Event attendee management
- [ ] Reviews and ratings system
- [ ] Advanced search with filters

---

**Version**: 1.0.0  
**Last Updated**: November 23, 2025  
**Documentation Maintained By**: Development Team
