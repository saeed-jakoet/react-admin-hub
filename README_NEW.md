# Fibre Admin Panel

Professional admin panel for fibre infrastructure management built with Next.js 15, React 19, and Tailwind CSS 4.

## Features

- **Dashboard**: KPI cards, activity feed, map placeholder
- **Project Management**: Full CRUD with detail views, team assignments, status tracking
- **Client Management**: Tabbed interface with project associations
- **Team & Staff**: Directory with availability tracking
- **User Management**: Role-based access control (visual only, auth not implemented)
- **Maintenance**: Fault tracking with SLA monitoring
- **Documents**: File library with tags and preview placeholders
- **Reports**: Export buttons for PDF/Excel (stubbed)
- **Settings**: Company profile, regions, roles, notifications
- **Dark/Light Mode**: Fully themed with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript (JSX)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: lucide-react
- **Tables**: @tanstack/react-table
- **Charts**: recharts (ready to integrate)

## Getting Started

### Prerequisites

- Node.js 18+ or Bun

### Installation

```bash
# Install dependencies
npm install
# or
bun install
```

### Run Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
react-admin-panel/
├── app/                    # Next.js pages (App Router)
│   ├── page.js            # Dashboard
│   ├── login/             # Login (visual only)
│   ├── projects/          # Projects list + [id] detail
│   ├── clients/           # Clients with segmented tabs
│   ├── teams/             # Teams overview
│   ├── staff/             # Staff directory
│   ├── users/             # User management
│   ├── maintenance/       # Fault tracking
│   ├── documents/         # Document library
│   ├── reports/           # Report exports
│   └── settings/          # Configuration
├── components/
│   ├── layout/            # AppShell, Sidebar, Topbar, ThemeToggle
│   ├── providers/         # ThemeProvider
│   ├── shared/            # DataTable, KPIStatCard, StatusPill
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── models.js          # JSDoc type definitions
│   ├── mock-data.js       # Stub data
│   ├── repositories/      # Data access layer (async functions)
│   ├── utils.js           # cn() helper
│   └── hooks/             # useMediaQuery, etc.
└── tailwind.config.js     # Tailwind + design tokens
```

## Extending the System

### Add a New Module

1. **Define model** in `lib/models.js` (JSDoc comments)
2. **Add mock data** in `lib/mock-data.js`
3. **Create repository** in `lib/repositories/your-module.js`
4. **Add page** in `app/your-module/page.jsx`
5. **Update navigation** in `components/layout/AppSidebar.jsx`

Example repository pattern:

```js
// lib/repositories/your-module.js
import { mockData } from "../mock-data";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAllItems() {
  await delay(300);
  // TODO: Replace with fetch("/api/items")
  return mockData;
}
```

### Connect Real API

Replace mock repository functions with real API calls:

```js
// Before (mock)
export async function getAllProjects() {
  await delay(300);
  return mockProjects;
}

// After (real API)
export async function getAllProjects() {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}
```

### Add Authentication

1. Install Auth0 or Supabase SDK:
   ```bash
   npm install @auth0/nextjs-auth0
   # or
   npm install @supabase/supabase-js
   ```

2. Create `middleware.js` for route protection:
   ```js
   import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
   export default withMiddlewareAuthRequired();
   ```

3. Replace login in `app/login/page.jsx`
4. Add `useAuth()` hook and replace topbar user dropdown

### Integrate Maps

```bash
npm install react-map-gl mapbox-gl
```

Create `components/shared/ProjectMap.jsx` and use in project detail pages.

### Add Charts (recharts)

```bash
npm install recharts
```

Use in `app/reports/page.jsx`:

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// In component
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="value" stroke="#3b82f6" />
  </LineChart>
</ResponsiveContainer>
```

## Design Tokens

All colors defined in `app/globals.css` with full dark mode support.

**Semantic status colors:**
- `--status-planned`: Slate
- `--status-in-progress`: Blue
- `--status-blocked`: Amber
- `--status-completed`: Emerald
- `--status-open`: Rose (faults)
- `--status-resolved`: Emerald

## TODO: Future Integrations

- **Auth**: Auth0 / Supabase (see Login page)
- **API**: Replace `lib/repositories/*` with real endpoints
- **Maps**: Mapbox / Google Maps (see Dashboard + Project detail)
- **File Storage**: Cloudinary / AWS S3 (see Documents page)
- **Notifications**: Twilio SendGrid (email) + Messaging (SMS/WhatsApp)
- **Offline**: Service workers + IndexedDB
- **Integrations**: Xero/QuickBooks (accounting), Google Calendar (scheduling)

## Performance Notes

- Tables use `@tanstack/react-table` with built-in sorting/filtering
- CSV export implemented (client-side)
- Server Components for static content
- Client Components (`"use client"`) only where interactivity needed

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
