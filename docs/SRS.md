# KnoWault - Software Requirements Specification (SRS)

**Version:** 1.0
**Date:** 2026-03-29
**Status:** Implemented & Deployed

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for KnoWault, a Progressive Web App for personal knowledge resource management. It describes the system architecture, components, interfaces, data flows, and technical constraints.

### 1.2 Scope
KnoWault is a client-side React PWA backed by Firebase (Authentication + Firestore). It is deployed on Vercel with automatic CI/CD from GitHub. The app is designed for personal single-user use with cross-device sync.

### 1.3 Technology Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19.1.0 |
| Build Tool | Vite | 6.3.5 |
| PWA Plugin | vite-plugin-pwa | 1.0.0 |
| Authentication | Firebase Auth | 12.11.0 |
| Database | Firebase Firestore | 12.11.0 |
| Hosting | Vercel | - |
| Source Control | GitHub | - |

---

## 2. System Architecture

### 2.1 High-Level Architecture
```
Browser (PWA)
  ├── React App (Vite bundle)
  ├── Service Worker (Workbox, auto-generated)
  ├── Firestore Local Cache (IndexedDB)
  └── Firebase SDK
        ├── Auth (Google Sign-in)
        └── Firestore (real-time sync)
              └── Firebase Cloud (Google Cloud)
```

### 2.2 Project Structure
```
KnoWault/
  index.html                     # HTML entry with SEO meta tags
  vite.config.js                 # Vite + PWA plugin configuration
  package.json                   # Dependencies and scripts
  .env                           # Firebase credentials (not committed)
  .env.example                   # Environment variable template
  .gitignore                     # Git ignore rules
  public/
    favicon.svg                  # SVG favicon (vault icon)
    icon-192.png                 # PWA icon 192x192
    icon-512.png                 # PWA icon 512x512
    apple-touch-icon.png         # iOS home screen icon 180x180
    og-image.png                 # Social sharing image 1200x630
    og-image.svg                 # OG image source SVG
  src/
    main.jsx                     # React entry point
    App.jsx                      # Root component (auth routing)
    components/
      KnowledgeVault.jsx         # Main app component
      LoginScreen.jsx            # Google Sign-in screen
    hooks/
      useAuth.js                 # Firebase auth state hook
      useFirestore.js            # Firestore CRUD + real-time sync hook
      useLocalStorage.js         # localStorage abstraction hook
      useInstallPrompt.js        # PWA install prompt hook
    lib/
      firebase.js                # Firebase app initialization
      constants.js               # Categories, storage key
      utils.js                   # ID generation, time formatting, URL parsing
    styles/
      global.css                 # Global CSS, animations, responsive rules
```

### 2.3 Build Output
```
dist/
  index.html                     # Injected with manifest + SW registration
  manifest.webmanifest           # PWA manifest (auto-generated)
  registerSW.js                  # Service worker registration script
  sw.js                          # Workbox service worker
  workbox-*.js                   # Workbox runtime library
  assets/
    index-*.css                  # Extracted CSS (~2 KB gzipped)
    index-*.js                   # App bundle (~199 KB gzipped)
```

---

## 3. Component Specifications

### 3.1 App.jsx (Root Component)
**Responsibility:** Auth routing

**Behavior:**
1. Calls `useAuth()` hook
2. If `loading` === true: render branded loading screen (pulsing logo)
3. If `user` === null: render `<LoginScreen />`
4. If `user` exists: render `<KnowledgeVault user={user} onLogout={logout} />`

**Props passed:**
- `LoginScreen`: `onSignIn` (signInWithGoogle function)
- `KnowledgeVault`: `user` (Firebase User object), `onLogout` (signOut function)

### 3.2 LoginScreen.jsx
**Responsibility:** Google Sign-in UI

**State:**
- `signingIn` (boolean) - disables button during auth
- `error` (string|null) - error message display

**Behavior:**
1. Renders centered card with logo, title, subtitle
2. "Continue with Google" button triggers `onSignIn` prop
3. On error: shows error message (ignores `auth/popup-closed-by-user`)
4. On success: parent re-renders with authenticated user

### 3.3 KnowledgeVault.jsx (Main Component)
**Responsibility:** All app functionality

**Props:** `{ user: FirebaseUser, onLogout: Function }`

**State variables (14):**
| State | Type | Default | Purpose |
|-------|------|---------|---------|
| items | array | [] | Resources from Firestore (via hook) |
| loading | boolean | true | Firestore initial load |
| view | string | "grid" | Display mode: "grid" or "list" |
| search | string | "" | Search query |
| filterCat | string | "all" | Active category filter |
| filterTag | string | "" | Active tag filter |
| showAdd | boolean | false | Add/Edit form visibility |
| editingId | string|null | null | ID of item being edited |
| form | object | {title:"", url:"", ...} | Form field values |
| toast | string|null | null | Toast notification message |
| previewItem | object|null | null | Resource shown in preview sheet |
| showProfile | boolean | false | Profile panel visibility |

**Derived data:**
- `allTags`: Sorted unique tags across all items
- `filtered`: Items filtered by category + tag + search, sorted by pinned then createdAt
- `catCounts`: Item count per category
- `hasItems`: Boolean, controls FAB vs header button

**CRUD Operations:**
| Operation | Function | Firestore Call | Toast |
|-----------|----------|---------------|-------|
| Create | handleSave() | addItem(newItem) | "Resource saved" |
| Update | handleSave() | updateItem(id, updates) | "Resource updated" |
| Delete | handleDelete(id) | deleteItem(id) | "Resource removed" |
| Pin toggle | handlePin(id) | updateItem(id, {pinned}) | - |
| Duplicate | handleDuplicate(item) | addItem(dupItem) | "Duplicated" |

**UI Sections:**
1. Sticky top bar (brand + avatar)
2. Header (greeting, count, search, filters, view toggle)
3. Add/Edit form overlay
4. Preview bottom sheet
5. Profile bottom sheet
6. Content area (grid/list of cards, or empty state)
7. FAB (fixed, conditional)
8. Toast notification (fixed, timed)

---

## 4. Hook Specifications

### 4.1 useAuth()
**Source:** `src/hooks/useAuth.js`
**Dependencies:** `firebase/auth`

**Returns:** `{ user, loading, signInWithGoogle, logout }`

| Property | Type | Description |
|----------|------|-------------|
| user | User\|null | Firebase User object or null |
| loading | boolean | True until initial auth state resolved |
| signInWithGoogle | async Function | Opens Google Sign-in popup |
| logout | async Function | Signs out current user |

**Implementation:**
- `onAuthStateChanged` listener sets user and clears loading
- Cleanup: unsubscribes listener on unmount

### 4.2 useFirestore(userId)
**Source:** `src/hooks/useFirestore.js`
**Dependencies:** `firebase/firestore`

**Parameters:** `userId` (string) - Firebase UID

**Returns:** `{ items, loading, addItem, updateItem, deleteItem }`

| Property | Type | Description |
|----------|------|-------------|
| items | array | All resources, updated in real-time |
| loading | boolean | True until first snapshot received |
| addItem | async (item) => void | Creates document with item.id as doc ID |
| updateItem | async (id, updates) => void | Merges updates into existing doc |
| deleteItem | async (id) => void | Deletes document by ID |

**Implementation:**
- `onSnapshot` listener on `users/{userId}/items` collection
- Maps Firestore docs to `{ id: doc.id, ...doc.data() }`
- Cleanup: unsubscribes listener on unmount

**Firestore path:** `users/{userId}/items/{itemId}`

### 4.3 useLocalStorage(key, initialValue)
**Source:** `src/hooks/useLocalStorage.js`
**Note:** Currently unused (replaced by useFirestore), retained as fallback utility.

**Returns:** `[value, setStoredValue]`

**Implementation:**
- Lazy initializer reads from localStorage, falls back to initialValue
- setStoredValue updates both React state and localStorage
- JSON serialize/deserialize with error handling

### 4.4 useInstallPrompt()
**Source:** `src/hooks/useInstallPrompt.js`

**Returns:** `{ isInstallable, promptInstall }`

| Property | Type | Description |
|----------|------|-------------|
| isInstallable | boolean | True when install prompt is available |
| promptInstall | async Function | Triggers native install prompt |

**Implementation:**
- Captures `beforeinstallprompt` event (Chromium only)
- Listens for `appinstalled` to clear state
- `promptInstall()` calls `deferredPrompt.prompt()` and awaits user choice

---

## 5. Firebase Configuration

### 5.1 Initialization (src/lib/firebase.js)
```
initializeApp(config)         # Firebase app from env vars
getAuth(app)                  # Auth instance
GoogleAuthProvider()          # Google sign-in provider
initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
})
```

**Offline persistence:** Enabled via `persistentLocalCache`. Firestore caches all data locally in IndexedDB, enabling full offline CRUD. Changes sync automatically when connectivity is restored.

**Multi-tab:** `persistentMultipleTabManager` allows multiple browser tabs to share the same Firestore cache without conflicts.

### 5.2 Environment Variables
| Variable | Purpose |
|----------|---------|
| VITE_FIREBASE_API_KEY | Firebase project API key |
| VITE_FIREBASE_AUTH_DOMAIN | Auth domain (project.firebaseapp.com) |
| VITE_FIREBASE_PROJECT_ID | Firebase project identifier |
| VITE_FIREBASE_STORAGE_BUCKET | Cloud Storage bucket |
| VITE_FIREBASE_MESSAGING_SENDER_ID | FCM sender ID |
| VITE_FIREBASE_APP_ID | Firebase app identifier |

**Build-time injection:** Vite replaces `import.meta.env.VITE_*` at build time. Variables must be set in both local `.env` and Vercel environment settings.

### 5.3 Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Enforcement:** Only authenticated users can access data, and only their own subcollection.

---

## 6. PWA Specification

### 6.1 Web App Manifest
| Property | Value |
|----------|-------|
| name | KnoWault - Knowledge Vault |
| short_name | KnoWault |
| description | Personal knowledge resource manager |
| theme_color | #2563EB |
| background_color | #FAFAF9 |
| display | standalone |
| scope | / |
| start_url | / |

**Icons:**
- 192x192 PNG (standard)
- 512x512 PNG (standard + maskable)
- 180x180 PNG (Apple touch icon)
- SVG favicon

### 6.2 Service Worker (Workbox)
**Strategy:** GenerateSW (auto-generated by vite-plugin-pwa)
**Registration:** autoUpdate (no user prompt)

**Precaching:** All built assets (JS, CSS, HTML, SVG, PNG)

**Runtime caching:**
| URL Pattern | Strategy | Cache Name | Max Age |
|-------------|----------|------------|---------|
| fonts.googleapis.com/* | CacheFirst | google-fonts-css | 1 year |
| fonts.gstatic.com/* | CacheFirst | google-fonts-woff2 | 1 year |

### 6.3 Offline Behavior
1. **Service worker** serves cached HTML, CSS, JS when offline
2. **Firestore local cache** provides all user data from IndexedDB
3. **CRUD operations** execute against local cache immediately
4. **Sync** occurs automatically when connectivity is restored
5. **Google Fonts** served from cache after first visit; system fonts as fallback

---

## 7. Utility Functions

### 7.1 generateId()
**Source:** `src/lib/utils.js`
**Returns:** string (e.g., "m1abc2xyz3")
**Algorithm:** `Date.now().toString(36) + Math.random().toString(36).slice(2, 7)`

### 7.2 timeAgo(timestamp)
**Source:** `src/lib/utils.js`
**Input:** Unix timestamp in milliseconds
**Output:** Relative time string

| Range | Output |
|-------|--------|
| < 1 minute | "just now" |
| < 60 minutes | "{n}m ago" |
| < 24 hours | "{n}h ago" |
| < 30 days | "{n}d ago" |
| >= 30 days | "{n}mo ago" |

### 7.3 extractDomain(url)
**Source:** `src/lib/utils.js`
**Input:** URL string
**Output:** Hostname without "www." prefix, or empty string on invalid URL

### 7.4 Constants
**Source:** `src/lib/constants.js`

**CATEGORIES (6):**
| ID | Label | Icon | Color |
|----|-------|------|-------|
| youtube | YouTube | ▶ | #DC2626 |
| social | Social Media | ◆ | #8B5CF6 |
| tool | Tool / App | ⚙ | #0891B2 |
| article | Article | ◧ | #D97706 |
| course | Course | ◎ | #16A34A |
| other | Other | ◇ | #78716C |

**STORAGE_KEY:** `"knowledge-vault-items"` (legacy, retained for potential localStorage fallback)

---

## 8. Styling Specification

### 8.1 Typography
| Usage | Font | Weight | Size |
|-------|------|--------|------|
| Brand name | Source Serif 4 | 700 | 20px |
| Greeting | Source Serif 4 | 600 | 24px |
| Card title | Source Serif 4 | 600 | 18px |
| Preview title | Source Serif 4 | 700 | 24px |
| Form title | Source Serif 4 | 700 | 22px |
| Body text | DM Sans | 400 | 14-15px |
| Labels | DM Sans | 600 | 13px |
| Badges | DM Sans | 600 | 11px |
| Timestamps | DM Sans | 500 | 11-12px |

### 8.2 Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | #2563EB | Buttons, links, active states |
| Primary dark | #1E40AF | Install button |
| Background | #FAFAF9 | Page background |
| Surface | #FFFFFF | Cards, panels, inputs |
| Text primary | #1C1917 | Headings, titles |
| Text secondary | #57534E | Body, descriptions |
| Text tertiary | #78716C | Subtitles, labels |
| Text muted | #A8A29E | Timestamps, placeholders |
| Border | #E8E5E1 | Card borders, input borders |
| Border light | #F5F5F4 | Dividers, hover bg |
| Error | #DC2626 | Delete, sign-out |
| Warning | #D97706 | Pinned star |

### 8.3 Animations
| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| fadeUp | 0.35s | ease-out | Card entrance (staggered) |
| slideUp | 0.3s | ease-out | Bottom sheet entrance |
| fadeIn | 0.2s | ease-out | Overlay backdrop |
| toastIn | 0.3s | ease-out | Toast notification |
| pulse | 1.5s | ease-in-out | Loading state (infinite) |

### 8.4 Responsive Breakpoints
| Breakpoint | Behavior |
|------------|----------|
| > 640px | Default layout, 3-column category grid in form |
| <= 640px | 2-column category grid, stacked header, full-width buttons |

### 8.5 Zoom Prevention
- Viewport: `maximum-scale=1.0, user-scalable=no`
- CSS: `touch-action: pan-x pan-y`
- Input font size forced to 16px (prevents iOS auto-zoom)

---

## 9. Deployment & Infrastructure

### 9.1 Build Pipeline
1. Push to `master` branch on GitHub
2. Vercel webhook triggers auto-build
3. `vite build` compiles React + generates service worker
4. Environment variables injected at build time
5. Output deployed to Vercel CDN

### 9.2 Environment Configuration
| Environment | .env Source | Firebase Auth Domain |
|-------------|-----------|---------------------|
| Local dev | `.env` file | localhost (auto-allowed) |
| Production | Vercel env vars | Must be added to Firebase authorized domains |

### 9.3 Scripts
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (localhost:5173) |
| `npm run build` | Production build to dist/ |
| `npm run preview` | Preview production build locally |

---

## 10. Constraints & Limitations

| Constraint | Detail |
|------------|--------|
| Storage limit | Firestore free tier: 1GB storage, 50K reads/day |
| Auth provider | Google only (no email/password, no SSO) |
| Install prompt | `beforeinstallprompt` not supported on iOS Safari |
| Offline sync | Conflicts resolved by last-write-wins (Firestore default) |
| Search | Client-side only, no full-text index |
| Bundle size | ~199 KB gzipped (Firebase SDK is majority) |
| Browser support | Modern browsers only (ES modules required) |
