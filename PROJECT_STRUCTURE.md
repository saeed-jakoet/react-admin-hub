# Project Structure

## Complete File Tree

```
react-admin-panel/
│
├── 📁 app/                          # Next.js App Router Pages
│   ├── 📄 layout.jsx                # Root layout with ThemeProvider + AppShell
│   ├── 📄 globals.css               # Tailwind imports + design tokens
│   ├── 📄 page.js                   # ✅ Dashboard (KPI cards, activity, map)
│   │
│   ├── 📁 login/
│   │   └── 📄 page.jsx              # ✅ Login page (visual only, no auth)
│   │
│   ├── 📁 projects/
│   │   ├── 📄 page.jsx              # ✅ Projects list (DataTable)
│   │   └── 📁 [id]/
│   │       └── 📄 page.jsx          # ✅ Project detail (teams, materials, map)
│   │
│   ├── 📁 clients/
│   │   └── 📄 page.jsx              # ✅ Clients (segmented tabs per client)
│   │
│   ├── 📁 teams/
│   │   └── 📄 page.jsx              # ✅ Teams overview (card grid)
│   │
│   ├── 📁 staff/
│   │   └── 📄 page.jsx              # ✅ Staff directory (DataTable)
│   │
│   ├── 📁 users/
│   │   └── 📄 page.jsx              # ✅ User management (DataTable)
│   │
│   ├── 📁 maintenance/
│   │   └── 📄 page.jsx              # ✅ Fault tracking (card list with SLA)
│   │
│   ├── 📁 documents/
│   │   └── 📄 page.jsx              # ✅ Document library (card grid)
│   │
│   ├── 📁 reports/
│   │   └── 📄 page.jsx              # ✅ Reports (export buttons)
│   │
│   └── 📁 settings/
│       └── 📄 page.jsx              # ✅ Settings (company, regions, roles)
│
├── 📁 components/
│   ├── 📁 layout/
│   │   ├── 📄 AppShell.jsx          # ✅ Main layout wrapper (sidebar + topbar)
│   │   ├── 📄 AppSidebar.jsx        # ✅ Navigation sidebar (collapsible)
│   │   ├── 📄 Topbar.jsx            # ✅ Top bar (search, notifications, user)
│   │   └── 📄 ThemeToggle.jsx       # ✅ Dark/light mode toggle button
│   │
│   ├── 📁 providers/
│   │   └── 📄 ThemeProvider.jsx     # ✅ Theme context (dark/light/system)
│   │
│   ├── 📁 shared/
│   │   ├── 📄 DataTable.jsx         # ✅ Full-featured table (sort, filter, export)
│   │   ├── 📄 KPIStatCard.jsx       # ✅ Dashboard metric cards
│   │   └── 📄 StatusPill.jsx        # ✅ Semantic status badges
│   │
│   └── 📁 ui/                       # shadcn/ui components
│       ├── 📄 avatar.jsx            # ✅ Avatar component
│       ├── 📄 badge.jsx             # ✅ Badge component
│       ├── 📄 button.jsx            # ✅ Button variants
│       ├── 📄 card.jsx              # ✅ Card layouts
│       ├── 📄 dropdown-menu.jsx     # ✅ Dropdown menus
│       ├── 📄 input.jsx             # ✅ Input fields
│       ├── 📄 label.jsx             # ✅ Form labels
│       ├── 📄 tabs.jsx              # ✅ Tab navigation
│       └── 📄 table.jsx             # ✅ Table primitives
│
├── 📁 lib/
│   ├── 📄 models.js                 # ✅ JSDoc type definitions (all entities)
│   ├── 📄 mock-data.js              # ✅ Stub data (regions, users, staff, etc.)
│   ├── 📄 utils.js                  # ✅ cn() helper for className merging
│   │
│   ├── 📁 repositories/             # Data access layer
│   │   ├── 📄 projects.js           # ✅ Project CRUD operations
│   │   ├── 📄 users.js              # ✅ User management
│   │   ├── 📄 staff.js              # ✅ Staff/contractor management
│   │   └── 📄 clients.js            # ✅ Client management
│   │
│   └── 📁 hooks/
│       └── 📄 useMediaQuery.js      # ✅ Responsive breakpoint hook
│
├── 📁 public/                       # Static assets
│
├── 📄 package.json                  # ✅ Dependencies configured
├── 📄 tailwind.config.js            # ✅ Tailwind + design tokens
├── 📄 jsconfig.json                 # ✅ Path aliases (@/*)
├── 📄 next.config.js                # ✅ Next.js configuration
├── 📄 postcss.config.js             # ✅ PostCSS with Tailwind
├── 📄 README_NEW.md                 # ✅ Full documentation
├── 📄 SETUP_GUIDE.md                # ✅ Quick start guide
└── 📄 PROJECT_STRUCTURE.md          # ✅ This file
```

## Pages Overview

| Route | Component | Description | Features |
|-------|-----------|-------------|----------|
| `/` | Dashboard | Overview page | KPI cards, activity feed, map placeholder |
| `/login` | Login | Authentication (stub) | Visual only, form validation ready |
| `/projects` | Projects List | Project management | DataTable, filters, status tracking |
| `/projects/[id]` | Project Detail | Single project view | Teams, materials, attachments, map |
| `/clients` | Clients | Client management | Segmented tabs, project associations |
| `/teams` | Teams | Field teams | Card grid, availability status |
| `/staff` | Staff | Employee/contractor directory | DataTable, certifications, regions |
| `/users` | Users | System users | DataTable, role management |
| `/maintenance` | Maintenance | Fault tracking | Priority badges, SLA tracking |
| `/documents` | Documents | File library | Tags, type filters, upload stub |
| `/reports` | Reports | Business reports | Export buttons (PDF/Excel stub) |
| `/settings` | Settings | Configuration | Company profile, regions, roles |

## Component Hierarchy

```
App
└── ThemeProvider
    └── AppShell
        ├── AppSidebar
        │   └── Navigation Links (10 routes)
        │
        ├── Topbar
        │   ├── Search Input
        │   ├── ThemeToggle
        │   ├── Notifications Button
        │   └── User Dropdown Menu
        │
        └── Page Content
            ├── Dashboard → KPIStatCard × 4
            ├── Projects → DataTable
            ├── Staff → DataTable
            ├── Users → DataTable
            ├── Clients → Tabs + Cards
            ├── Teams → Card Grid
            ├── Maintenance → Card List + StatusPill
            ├── Documents → Card Grid + Badge
            ├── Reports → Card Grid + Buttons
            └── Settings → Form Cards
```

## Data Flow

```
Page Component (Server or Client)
    ↓
Repository Function (lib/repositories/*.js)
    ↓
Mock Data (lib/mock-data.js)
    ↓
← Returns Promise<Data>
    ↓
Page renders with data
```

**To replace with real API:**
Change repository functions from:
```js
return mockData;
```
To:
```js
const res = await fetch('/api/endpoint');
return res.json();
```

## Key Features by Component

### DataTable
- ✅ Column sorting
- ✅ Search/filtering
- ✅ Pagination
- ✅ Column visibility toggle
- ✅ CSV export (client-side)
- ✅ Row selection
- ⏳ Virtualization (add @tanstack/react-virtual for 1000+ rows)

### Theme System
- ✅ Light mode
- ✅ Dark mode
- ✅ System preference detection
- ✅ Persistent selection (localStorage)
- ✅ CSS custom properties for all tokens
- ✅ Semantic status colors (planned/in-progress/blocked/completed)

### Repository Pattern
- ✅ Async functions with simulated latency
- ✅ CRUD operations (get/create/update/delete)
- ✅ Related data hydration (e.g., project.client, project.assignedTeams)
- ⏳ Error handling (add try/catch when connecting real API)

## Design Tokens

**Status Colors** (in `app/globals.css`):
```css
/* Light Mode */
--status-planned: slate-600
--status-in-progress: blue-500
--status-blocked: amber-500
--status-completed: emerald-600
--status-open: rose-500 (faults)
--status-resolved: emerald-700

/* Dark Mode */
--status-planned: slate-400
--status-in-progress: blue-300
--status-blocked: amber-400
--status-completed: emerald-400
--status-open: rose-400
--status-resolved: emerald-500
```

**Usage:**
```jsx
<StatusPill status="in-progress" />
// → Renders badge with blue color from theme
```

## Dependencies

### Core
- `next` 15.5.4
- `react` 19.1.0
- `react-dom` 19.1.0

### UI
- `@radix-ui/*` - Accessible primitives
- `lucide-react` - Icons
- `tailwindcss` 4.0 - Styling
- `tailwindcss-animate` - Animations

### Data
- `@tanstack/react-table` - Tables
- `date-fns` - Date formatting (included)
- `recharts` - Charts (included, not yet used)

### Utils
- `clsx` + `tailwind-merge` - className utilities
- `class-variance-authority` - Component variants

## Integration Points (TODO)

All clearly marked in code with `// TODO:` comments:

1. **Authentication**
   - `app/login/page.jsx` - Replace form handler
   - `components/layout/Topbar.jsx` - User dropdown logout

2. **API Integration**
   - All `lib/repositories/*.js` files - Replace mock data with fetch()

3. **Maps**
   - `app/page.js` - Dashboard map placeholder
   - `app/projects/[id]/page.jsx` - Project location map

4. **File Storage**
   - `app/documents/page.jsx` - Document upload/preview

5. **Notifications**
   - `components/layout/Topbar.jsx` - Notification dropdown
   - `app/settings/page.jsx` - Configure Email/SMS/WhatsApp

6. **Charts**
   - `app/reports/page.jsx` - Add recharts visualizations

## Performance Optimization Checklist

- ✅ Server Components by default (faster initial load)
- ✅ Client Components only where needed (`"use client"`)
- ✅ Repository pattern (easy to add caching layer)
- ✅ Tailwind CSS (purged in production)
- ⏳ Next.js Image component (use for avatars/photos)
- ⏳ Dynamic imports for heavy components
- ⏳ React.memo for expensive re-renders
- ⏳ Virtualized tables for 1000+ rows

## Browser Support

- Chrome/Edge (Chromium) ✅
- Firefox ✅
- Safari ✅
- Mobile browsers ✅

Responsive breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

**Status: ✅ Ready for Development**

All scaffolding complete. Next steps:
1. Run `npm install`
2. Run `npm run dev`
3. Browse to `http://localhost:3000`
4. Start connecting real backend API
