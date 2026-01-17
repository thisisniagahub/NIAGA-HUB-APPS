# Abang Colek Mobile - Interface Design

## Design Philosophy

**Mobile-First Street Food Operations**
- One-handed usage for on-site event operations
- Quick access to critical information
- Offline-first with local storage
- Bold, high-contrast design matching brand identity

## Screen List

### 1. Dashboard (Home)
**Purpose:** Quick overview of all business metrics and upcoming events
**Content:**
- Today's event status card
- Quick stats: Events this month, pending tasks, TikTok posts scheduled
- Recent activity feed
- Quick action buttons: Add Event, Create Content, View Checklist

### 2. Events Pipeline
**Purpose:** Manage event bookings from lead to completion
**Content:**
- Event list with status badges (Lead, Confirmed, Completed)
- Event cards showing: Date, Location, Fee, EO Contact
- Filter by status and date range
- Add new event form

### 3. Event Detail
**Purpose:** Complete event information and management
**Content:**
- Event header: Name, Date, Location, Status
- EO Contact details with quick call/WhatsApp buttons
- Event requirements and notes
- Booth checklist (expandable)
- Travel plan section
- Post-event review form

### 4. Booth Ops
**Purpose:** On-site operational checklists
**Content:**
- Pre-event checklist (equipment, stock, setup)
- During-event checklist (operations, customer service)
- Post-event checklist (teardown, inventory)
- Quick notes capture
- Photo attachment for documentation

### 5. TikTok Engine
**Purpose:** Content planning and hook management
**Content:**
- Hook bank with search and tags
- Content calendar linked to events
- Shot list generator
- Caption templates
- Posting schedule tracker

### 6. Hook Bank
**Purpose:** Manage TikTok hooks and scripts
**Content:**
- Hook list with tags (trending, product, event)
- Add/edit hook form
- Hook performance notes
- Quick copy button

### 7. Reviews & Analytics
**Purpose:** Post-event performance tracking
**Content:**
- Event performance cards
- KPI metrics: Views, Sales, Engagement
- Top performing hooks
- Weekly summary
- Notes and learnings

### 8. Brand Kit
**Purpose:** Quick access to brand assets
**Content:**
- Logo variations (download buttons)
- Color palette with hex codes
- Typography guidelines
- Mascot assets
- Tagline and messaging

### 9. Exports
**Purpose:** Generate and share content packs
**Content:**
- Export options: JSON backup, Event Pack, TikTok Pack, Markdown
- Recent exports list
- Import backup functionality

## Key User Flows

### Flow 1: Add New Event
1. Tap "Add Event" from Dashboard
2. Fill event form: Name, Date, Location, Fee
3. Add EO contact details
4. Set event status (Lead/Confirmed)
5. Save → Event appears in pipeline

### Flow 2: Prepare for Event
1. Open Event Detail from pipeline
2. Review event requirements
3. Open Booth Ops checklist
4. Check off pre-event items
5. Add notes if needed
6. Mark event as "Ready"

### Flow 3: Create TikTok Content
1. Open TikTok Engine
2. Browse Hook Bank
3. Select hook for today's content
4. Generate shot list for event
5. Add to content calendar
6. Export TikTok Pack

### Flow 4: Post-Event Review
1. Open completed event
2. Fill review form: Sales, Engagement, Issues
3. Add top performing hooks
4. Upload event photos
5. Submit review
6. View in Analytics

## Color Choices (Brand-Aligned)

**Primary Colors:**
- Colek Yellow: `#FFC107` - Primary actions, highlights, backgrounds
- Sambal Red: `#E53935` - CTAs, alerts, accents
- Midnight Black: `#1A1A1A` - Text, headers

**Secondary Colors:**
- Chili Green: `#4CAF50` - Success states, organic elements
- Cream White: `#FFF8E1` - Light backgrounds, cards
- Warm Orange: `#FF9800` - Warnings, gradients

**UI Colors:**
- Background Light: `#FFFFFF`
- Background Dark: `#151718`
- Surface: `#F5F5F5` (light) / `#1E2022` (dark)
- Border: `#E5E7EB` (light) / `#334155` (dark)

## Typography

**Headlines:** Impact / Bebas Neue (Bold, 700)
**Body:** Poppins / Inter (Regular, 400)
**Captions:** Poppins (Light, 300)

## Component Patterns

### Event Card
- Yellow accent bar on left
- Event name in bold black
- Date and location in muted text
- Status badge (colored pill)
- Tap to open detail

### Checklist Item
- Checkbox with haptic feedback
- Item text with strikethrough when complete
- Swipe to add notes
- Green checkmark animation

### Action Button (Primary)
- Yellow background (#FFC107)
- Black text
- Rounded corners (12px)
- Scale animation on press
- Haptic feedback

### Action Button (Secondary)
- Red background (#E53935)
- White text
- Rounded corners (12px)
- Opacity change on press

### Stat Card
- Surface background with border
- Large number in primary color
- Label in muted text
- Icon in corner

## Navigation Structure

**Tab Bar (Bottom):**
1. Dashboard (Home icon)
2. Events (Calendar icon)
3. TikTok (Video icon)
4. Reviews (Chart icon)
5. More (Menu icon)

**More Menu:**
- Booth Ops
- Brand Kit
- Exports
- Settings

## Offline Behavior

- All data stored in AsyncStorage
- Yellow banner when offline
- Sync indicator when back online
- Queue actions for later sync (future feature)

## Mobile Optimizations

- Large tap targets (min 44x44px)
- Bottom sheet modals for forms
- Pull-to-refresh on lists
- Swipe gestures for quick actions
- Haptic feedback on important actions
- Dark mode support
