# KnoWault - Product Requirements Document (PRD)

**Version:** 1.0
**Date:** 2026-03-29
**Status:** Implemented & Deployed

---

## 1. Overview

KnoWault is a personal knowledge vault Progressive Web App (PWA) that allows users to save, organize, search, and manage knowledge resources (articles, videos, tools, courses, etc.) across desktop and mobile devices. Data syncs in real-time via Firebase Firestore and the app works fully offline.

**Production URL:** https://knowault.vercel.app
**Repository:** https://github.com/atirad-sun/KnoWault

---

## 2. Problem Statement

Knowledge workers and learners constantly discover valuable resources (articles, YouTube videos, tools, courses) but lack a lightweight, personal tool to save and organize them. Existing solutions are either too complex (Notion, Raindrop) or too basic (browser bookmarks). Users need a fast, installable app that works on any device, online or offline, with zero friction.

---

## 3. Target User

- Personal use (single user per account)
- Uses both desktop and mobile devices interchangeably
- Discovers resources across categories (YouTube, social media, articles, tools, courses)
- Wants quick capture and easy retrieval
- Values offline access and cross-device sync

---

## 4. Core Features

### 4.1 Authentication
- Google Sign-in (popup-based)
- Persistent auth state (stays logged in across sessions)
- User profile panel with account info, vault stats, and sign-out

### 4.2 Resource Management (CRUD)
- **Create:** Add resources with title (required), URL, category, description, tags (comma-separated), and personal notes
- **Read:** View resources in grid or list layout with search, filter, and sort
- **Update:** Edit any field of an existing resource
- **Delete:** Remove resources with confirmation via preview panel
- **Duplicate:** Clone a resource with "(copy)" suffix

### 4.3 Organization
- **6 Categories:** YouTube, Social Media, Tool/App, Article, Course, Other - each with unique icon and color
- **Tags:** Free-form, comma-separated, lowercase - displayed as filterable chips
- **Pinning:** Star/unstar resources to pin them to the top
- **Sorting:** Pinned items first, then by creation date (newest first)

### 4.4 Search & Filtering
- Full-text search across: title, description, tags, URL, and notes
- Category filter pills with item counts
- Tag filter chips (click to toggle)
- Filters combine (category + tag + search)

### 4.5 Views
- **Grid view:** Responsive auto-fill grid (300px min-width cards)
- **List view:** Stacked vertical cards
- Toggle via header controls

### 4.6 Resource Preview (Bottom Sheet)
- Tap any card to open a slide-up preview modal
- Shows complete resource details (no truncation)
- Action buttons: Edit, Duplicate, Remove
- Pin/unpin directly from preview
- Clickable URL opens in new tab

### 4.7 PWA Capabilities
- **Installable:** Add to home screen on Android (automatic prompt) and iOS (manual via share sheet)
- **Offline:** Full offline support via Firestore persistent cache + service worker
- **Standalone:** Runs without browser chrome when installed
- **Auto-update:** Service worker updates automatically on new deployments

### 4.8 Cross-Device Sync
- Real-time sync via Firebase Firestore
- Offline changes sync when connection is restored
- Multi-tab support (changes reflect across open tabs)

### 4.9 SEO & Social Sharing
- Full meta tags (title, description, keywords, canonical)
- Open Graph tags for Facebook/LinkedIn previews
- Twitter Card tags for Twitter/X previews
- Custom OG image (1200x630)

---

## 5. UI/UX Design

### 5.1 Design System
- **Primary color:** #2563EB (blue)
- **Background:** #FAFAF9 (warm off-white)
- **Card background:** #FFFFFF
- **Heading font:** Source Serif 4 (serif)
- **Body font:** DM Sans (sans-serif)
- **Border color:** #E8E5E1
- **Border radius:** 8-20px (rounded, modern)

### 5.2 Layout
- Sticky branded top bar (logo + avatar)
- Personalized greeting with resource count
- Search bar, category pills, tag chips, view toggle
- Responsive content grid/list
- Fixed FAB (floating action button) at bottom-right when items exist

### 5.3 Interactions
- Card tap opens preview bottom sheet (slide-up animation)
- Form opens as centered overlay modal with blur backdrop
- Profile opens as bottom sheet
- Toast notifications (auto-dismiss 2.2s)
- Staggered card entrance animations (40ms delay per card)
- Hover effects on desktop (elevation, scale)

### 5.4 Mobile Optimizations
- Pinch-to-zoom disabled
- Auto-zoom on input focus prevented (16px font-size)
- iOS safe area insets respected
- Minimum 44x44px touch targets
- Category grid collapses to 2 columns on small screens
- FAB positioned with safe spacing from edges

---

## 6. Data Model

### 6.1 Resource Item
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Generated: timestamp (base36) + random string |
| title | string | Yes | Resource name |
| url | string | No | Web URL |
| description | string | No | What the resource is about |
| category | string | Yes | One of: youtube, social, tool, article, course, other |
| tags | string[] | No | Array of lowercase trimmed tags |
| notes | string | No | Personal notes, takeaways |
| pinned | boolean | Yes | Whether pinned to top (default: false) |
| createdAt | number | Yes | Unix timestamp (ms) |
| updatedAt | number | Yes | Unix timestamp (ms) |

### 6.2 Firestore Structure
```
users/
  {userId}/
    items/
      {itemId}: { ...resource fields }
```

### 6.3 Security Rules
- Users can only read/write their own data
- Authentication required for all operations
- Rule: `request.auth.uid == userId`

---

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Offline support | Full CRUD works offline, syncs on reconnect |
| First load | < 3s on 3G |
| Installable | Passes Lighthouse PWA audit |
| Data persistence | Firestore with local cache |
| Auth | Google Sign-in only |
| Hosting | Vercel (auto-deploy from GitHub) |
| Browser support | Chrome, Safari (desktop + mobile) |
| Max data | Limited by Firestore free tier (1GB) |

---

## 8. Future Considerations

- Export/import data (JSON backup)
- Share resources publicly via link
- Browser extension for quick capture
- Custom categories
- Dark mode
- Full-text search via Algolia or similar
- Multiple sort options (alphabetical, most recent update)
