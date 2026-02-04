# Weekly Python Challenge System - Frontend Implementation Plan

## Overview

Building a complete frontend for the Weekly Python Challenge System using:
- **Next.js 16** with App Router (already configured)
- **shadcn/ui** (new-york style, configured but components need installation)
- **Tailwind CSS v4** with dark mode support
- **TypeScript** with strict mode
- **pnpm** as package manager

---

## Phase 1: Foundation Setup

### 1.1 Install Dependencies

```bash
# State management & data fetching
pnpm add zustand @tanstack/react-query

# Form handling & validation
pnpm add react-hook-form @hookform/resolvers zod

# Code editor for challenges
pnpm add @monaco-editor/react

# Theme & utilities
pnpm add next-themes date-fns
```

### 1.2 Install shadcn/ui Components

```bash
# Core components
pnpm dlx shadcn@latest add button card input label form dialog sheet
pnpm dlx shadcn@latest add dropdown-menu avatar badge progress table tabs
pnpm dlx shadcn@latest add toast sonner skeleton separator select textarea
pnpm dlx shadcn@latest add alert alert-dialog navigation-menu sidebar
pnpm dlx shadcn@latest add scroll-area tooltip command pagination checkbox
```

### 1.3 Create Directory Structure

```
├── app/
│   ├── (auth)/                    # Public auth pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/               # Protected user pages
│   │   ├── dashboard/page.tsx
│   │   ├── challenge/page.tsx
│   │   ├── submissions/page.tsx
│   │   ├── submissions/[id]/page.tsx
│   │   ├── shop/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── announcements/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── profile/page.tsx
│   │   └── layout.tsx
│   ├── (admin)/                   # Admin-only pages
│   │   ├── admin/page.tsx
│   │   ├── admin/challenges/page.tsx
│   │   ├── admin/shop/page.tsx
│   │   ├── admin/announcements/page.tsx
│   │   ├── admin/users/page.tsx
│   │   └── layout.tsx
│   └── layout.tsx, page.tsx, etc.
├── components/
│   ├── ui/                        # shadcn components (auto-generated)
│   ├── auth/                      # Login/register forms
│   ├── dashboard/                 # Stats, progress, activity
│   ├── challenge/                 # Code editor, submission
│   ├── submissions/               # Tables, AI feedback
│   ├── shop/                      # Item cards, purchase flow
│   ├── leaderboard/               # Rankings table
│   ├── admin/                     # Admin forms & tables
│   └── layout/                    # Header, sidebar, nav
├── lib/
│   ├── api/                       # API client & endpoint functions
│   └── validations/               # Zod schemas
├── hooks/                         # Custom React hooks
├── stores/                        # Zustand stores
├── types/                         # TypeScript interfaces
├── providers/                     # Context providers
└── middleware.ts                  # Route protection
```

---

## Phase 2: Core Infrastructure

### 2.1 API Client (`lib/api/client.ts`)
- Fetch wrapper with base URL from env
- Automatic JWT token injection from localStorage
- Error handling with typed responses
- 401 redirect to login

### 2.2 Auth Store (`stores/auth-store.ts`)
- Zustand store with persist middleware
- User state, token, isAuthenticated
- Actions: setAuth, clearAuth, initialize

### 2.3 Type Definitions (`types/`)
- User, Challenge, Submission, ShopItem, Announcement, Transaction
- API response types with pagination meta

---

## Phase 3: Authentication

### 3.1 Auth Pages
- **Login** (`/login`): Student ID + password form
- **Register** (`/register`): Name, student ID, email, password

### 3.2 Middleware (`middleware.ts`)
- Protect `/dashboard/*` routes (require auth)
- Protect `/admin/*` routes (require admin role)
- Redirect authenticated users away from auth pages

---

## Phase 4: Dashboard & Layout

### 4.1 Main Layout
- Collapsible sidebar with navigation
- Header with user menu, coins display, theme toggle
- Mobile-responsive with sheet/drawer

### 4.2 Dashboard Page
- Welcome message with user name
- Stats cards: Level, XP progress, Coins, Submissions
- Tier badge with color coding
- Quick action buttons

---

## Phase 5: Challenge System

### 5.1 Challenge Page (`/challenge`)
- Weekend check (show notice on weekdays)
- Challenge display: title, description, problem statement
- Monaco code editor with Python syntax
- Submit button with loading state
- Test cases preview

### 5.2 Weekend Notice
- Friendly message when challenges unavailable
- Visual calendar indicator

---

## Phase 6: Submissions

### 6.1 Submissions List (`/submissions`)
- Paginated table with status badges
- Challenge title, score, XP/coins earned, date
- Click to view details

### 6.2 Submission Detail (`/submissions/[id]`)
- Submitted code (read-only editor)
- AI score with breakdown (correctness, quality, efficiency, style)
- AI feedback and suggestions list
- Rewards earned

---

## Phase 7: Shop System

### 7.1 Shop Page (`/shop`)
- User's coin balance display
- Grid of available items
- Item cards with: name, description, price, stock, level requirement
- Purchase button (disabled if can't afford/level)

### 7.2 Purchase Flow
- Confirmation dialog
- Success with redemption code
- Copy code functionality

### 7.3 My Purchases
- List of purchased items with redemption codes

---

## Phase 8: Additional Features

### 8.1 Leaderboard (`/leaderboard`)
- Top users table with rank, name, level, tier
- Medal icons for top 3
- Current user highlighted

### 8.2 Announcements (`/announcements`)
- Feed of published announcements
- Pinned items at top
- Author and date info

### 8.3 Transactions (`/transactions`)
- Transaction history table
- Type badges (LEVEL_UP, CHALLENGE_BONUS, SHOP_PURCHASE, ADMIN_GRANT)
- Amount with color coding (+/-)
- Summary card (total earned/spent)

### 8.4 Profile (`/profile`)
- Full user stats display
- Submission statistics
- Transaction summary

---

## Phase 9: Admin Dashboard

### 9.1 Admin Overview (`/admin`)
- Stats overview
- Quick action links

### 9.2 Challenge Management (`/admin/challenges`)
- List all challenges with status
- Create/Edit/Delete challenges
- Activate/Deactivate toggle
- Test case management

### 9.3 Shop Management (`/admin/shop`)
- List all shop items
- Create/Edit/Delete items
- Stock management

### 9.4 Announcements (`/admin/announcements`)
- List all announcements
- Create/Edit/Delete
- Publish/Unpublish, Pin/Unpin

### 9.5 User Management (`/admin/users`)
- Paginated user list
- Grant coins dialog
- View user details

---

## Phase 10: Polish

### 10.1 Theme System
- Light/Dark/System modes with next-themes
- Theme toggle in header

### 10.2 Error Handling
- Global error boundary
- 404 page
- API error toasts

### 10.3 Loading States
- Skeleton loaders for all data
- Loading spinners for actions

### 10.4 Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Touch-friendly targets

---

## Environment Configuration

Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Python Challenge System"
```

---

## Key Files to Create

| Priority | File | Purpose |
|----------|------|---------|
| 1 | `lib/api/client.ts` | Core API client with auth |
| 2 | `stores/auth-store.ts` | Auth state management |
| 3 | `types/*.ts` | TypeScript interfaces |
| 4 | `middleware.ts` | Route protection |
| 5 | `providers/*.tsx` | Query & Theme providers |
| 6 | `app/(dashboard)/layout.tsx` | Main app layout |
| 7 | `components/layout/*` | Header, Sidebar |
| 8 | Auth pages & forms | Login/Register |
| 9 | Dashboard page | User home |
| 10 | Challenge page | Core feature |

---

## Implementation Order

1. **Foundation**: Dependencies, shadcn components, directory structure
2. **Infrastructure**: API client, stores, types, middleware
3. **Layout**: Providers, main layout with sidebar/header
4. **Auth**: Login/Register pages and forms
5. **Dashboard**: Stats and user progress display
6. **Challenge**: Code editor and submission flow
7. **Submissions**: List and detail views
8. **Shop**: Items grid and purchase flow
9. **Other Pages**: Leaderboard, Announcements, Transactions, Profile
10. **Admin**: All admin CRUD pages
11. **Polish**: Error handling, loading states, responsive fixes
