# Tenant Wireframes - BoardingHub Mobile App

## Overview

Mobile-first, developer-ready low-fidelity wireframes and component guidance for the Tenant side of the Boarding House Management System. Each screen includes purpose, key UI elements, layout notes, interactions, and acceptance cues.

## Global UI Patterns Implemented

### Navigation

✅ **Bottom Tab Bar** - 4 tabs implemented:

- **Home/Discover** (`app/tenant/index.jsx`) - Dashboard with room stats, quick actions
- **My Bills** (`app/tenant/bills.jsx`) - Bills list, payment status, upload proof
- **My Room** (`app/tenant/room.jsx`) - Room details, amenities, service requests
- **More/Profile** (`app/tenant/more.jsx`) - User settings, documents, support

### Header Components

✅ **App Header** (`components/tenant/TenantHeader.jsx`):

- App title or property name (contextual)
- Notifications bell with unread badge
- Consistent across all screens

### Layout & Styling

✅ **Mobile Grid System**:

- Single-column mobile layout
- 16px base spacing (`padding: 16`)
- Cards for lists with rounded corners (`borderRadius: 12`)
- Full-width modals for flows (payment proof, service requests)

### Status Colors

✅ **Color System** (`components/tenant/StatusChip.jsx`):

- **Paid** = `#34C759` (Green)
- **Overdue** = `#FF3B30` (Red)
- **Due Soon** = `#FF9500` (Amber)
- **Pending** = `#8E8E93` (Gray)

### Offline & Sync Indicators

✅ **Offline Indicator** (`components/tenant/OfflineIndicator.jsx`):

- Persistent banner when offline
- Upload queue indicator when proofs/payments pending sync
- Appears at top of app when active

## Screen Wireframes

### 1. Home/Discover Screen (`app/tenant/index.jsx`)

**Purpose**: Dashboard overview with quick access to key tenant information and actions

**Key UI Elements**:

- Greeting with tenant name and property name
- Notification bell with badge count
- Room statistics cards (4-grid layout):
  - Room number & floor
  - Rent due amount & countdown
  - Outstanding balance
  - Next due date
- Quick actions grid (2x2):
  - Pay Rent
  - Upload Receipt
  - Service Request
  - Contact Landlord
- Utility bills summary list
- Recent payment history

**Layout Notes**:

- Header with personalized greeting
- Stats use card layout with icons and status colors
- Pull-to-refresh enabled
- Quick actions use prominent buttons with icons

**Interactions**:

- Tap stats cards → detailed view
- Tap quick actions → respective flows
- Tap bills → navigate to My Bills tab
- Pull down → refresh data

**Acceptance Cues**:

- All monetary amounts use ₱ currency
- Status colors applied consistently
- Loading states with skeleton/spinner
- Error states with retry options

### 2. My Bills Screen (`app/tenant/bills.jsx`)

**Purpose**: Complete bill management with payment tracking and proof upload

**Key UI Elements**:

- Summary cards showing monthly due/paid totals
- Upcoming bills section with:
  - Bill type and amount
  - Due date with countdown
  - Status badge (due soon/overdue)
  - Upload proof and pay buttons
- Payment history section
- Upload proof modal with camera/gallery options

**Layout Notes**:

- Summary uses 2-column card layout
- Bills use card list with clear hierarchy
- Action buttons inline for pending bills
- Modal uses page sheet presentation

**Interactions**:

- Tap bill card → view details
- Tap "Upload Proof" → camera/gallery modal
- Tap "Pay Now" → payment flow
- Swipe actions for quick operations

**Acceptance Cues**:

- Status colors for bill states
- Upload progress indicators
- Success confirmations
- Offline queue notifications

### 3. My Room Screen (`app/tenant/room.jsx`)

**Purpose**: Room details, amenities overview, and service request management

**Key UI Elements**:

- Image carousel with room photos
- Room details card:
  - Room number, type, size
  - Monthly rent prominently displayed
  - Contract dates (move-in, lease end)
  - Security deposit amount
- Amenities grid showing available/unavailable items
- Service request quick actions (2x2 grid):
  - Maintenance Request
  - Cleaning Service
  - Key Replacement
  - General Inquiry
- House rules list
- Service request modal with form

**Layout Notes**:

- Full-width image carousel at top
- Details in card format with icons
- Amenities use grid with status indicators
- Service modal with type selection

**Interactions**:

- Swipe through room images
- Tap amenities for more info
- Tap service type → request form modal
- Submit service requests

**Acceptance Cues**:

- Image loading states
- Unavailable amenities clearly marked
- Service request confirmation
- Form validation messages

### 4. More/Profile Screen (`app/tenant/more.jsx`)

**Purpose**: User account management, app settings, and support access

**Key UI Elements**:

- Profile card with:
  - User avatar (initials)
  - Full name and email
  - Room assignment badge
  - Edit profile button
- Quick stats (3-column):
  - Tenancy duration
  - Bills paid this year
  - Total amount paid
- Settings toggles:
  - Push notifications
  - Dark mode
- Menu sections:
  - **Account**: Personal info, payment methods, documents, emergency contacts
  - **Property**: Lease agreement, house rules, property info, amenities
  - **Support**: Contact landlord, help & FAQ, report issue, feedback
- Logout button (destructive style)
- App version info

**Layout Notes**:

- Profile card prominently at top
- Stats in 3-column grid
- Settings with toggle switches
- Menu items grouped by category
- Logout visually separated

**Interactions**:

- Tap profile → edit profile
- Toggle settings → immediate save
- Tap menu items → respective screens
- Logout → confirmation dialog

**Acceptance Cues**:

- Profile photo placeholder with initials
- Settings persist across sessions
- Menu badges for notifications
- Logout confirmation required

## Component Library

### Reusable Components Created

1. **TenantHeader** (`components/tenant/TenantHeader.jsx`)

   - Standardized header with title and notifications
   - Badge count support
   - Customizable right component

2. **StatusChip** (`components/tenant/StatusChip.jsx`)

   - Consistent status styling across app
   - Predefined color scheme
   - Customizable colors support

3. **OfflineIndicator** (`components/tenant/OfflineIndicator.jsx`)
   - Network status monitoring
   - Upload queue notifications
   - Persistent but unobtrusive display

## Technical Implementation

### File Structure

```
app/tenant/
├── _layout.jsx          # Tab navigation with offline indicator
├── index.jsx            # Home/Dashboard screen
├── bills.jsx            # Bills management screen
├── room.jsx             # Room details and services
└── more.jsx             # Profile and settings

components/tenant/
├── index.js             # Component exports
├── TenantHeader.jsx     # Standardized header
├── StatusChip.jsx       # Status display component
└── OfflineIndicator.jsx # Network status component
```

### Key Features Implemented

✅ **Navigation**: Bottom tabs with focused/unfocused states
✅ **Status System**: Color-coded bill and payment states
✅ **Modals**: Full-screen modals for upload and service flows
✅ **Pull-to-Refresh**: Data refresh on all screens
✅ **Offline Support**: Visual indicators and queue management
✅ **Responsive Design**: Mobile-first with consistent spacing
✅ **Dark Mode Ready**: Theme support throughout
✅ **Accessibility**: Proper contrast and touch targets

### Developer Notes

- All monetary values use Philippine Peso (₱) formatting
- Mock data provided for development - replace with API calls
- Image placeholders use placeholder.com - replace with actual image handling
- Firebase authentication integration ready
- Error boundaries and loading states implemented
- TypeScript-ready (currently using .jsx for compatibility)

## Next Steps

1. **Backend Integration**: Replace mock data with real API calls
2. **Image Handling**: Implement proper image upload and caching
3. **Push Notifications**: Set up notification system
4. **Offline Sync**: Implement proper data synchronization
5. **Payment Gateway**: Integrate payment processing
6. **Testing**: Add unit and integration tests
7. **Performance**: Optimize with FlatList for large datasets

---

_This wireframe implementation provides a complete, functional tenant interface that follows mobile-first design principles and maintains consistency across the BoardingHub ecosystem._
