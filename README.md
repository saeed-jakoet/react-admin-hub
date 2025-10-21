# Fiber Admin Panel (Frontend)

A modern Next.js 15 + React 19 admin panel for managing clients, staff, inventory, fleet, documents and operational jobs. Uses SWR for data fetching, a global Toast system for notifications, and a shared UI library.

## Tech Stack
- Next.js 15 (App Router)
- React 19
- SWR for data fetching and cache revalidation
- Tailwind CSS + shadcn/Radix UI primitives
- Lucide Icons
- Axios for API calls (via `lib/api/fetcher`)

## Project Structure
```
react-admin-panel/
  app/
    staff/
    clients/
    inventory/
    fleet/
    documents/
    ...
  components/
    shared/
      DataTable, Loader, Header, Toast
    staff/, clients/, inventory/, fleet/, ui/
  lib/
    api/, repositories/, hooks/, utils/
```

## Environment
Create `.env.local` in `react-admin-panel/` with:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```
Adjust to match the API server port in the backend README.

## Scripts
- `npm run dev` – start Next.js dev server
- `npm run build` – build for production
- `npm start` – start production server

## Data Fetching Pattern (SWR)
All list and detail pages follow the same pattern:
```jsx
const { data, isLoading, error } = useSWR(["/resource"], () => get("/resource"), {
  revalidateOnFocus: true,
  dedupingInterval: 60000,
});
const items = data?.data || [];
```
- Use `mutate(["/resource"])` after create/update to refresh.
- Use `Loader` while loading and show a toast + inline fallback on error.

## Toast Pattern
Page-level toasts only (dialogs emit callbacks). Example:
```jsx
const { success, error } = useToast();

const handleDialogSuccess = (action = "add") => {
  mutate(["/resource"]);
  success("Success", action === "edit" ? "Item updated." : "Item added.");
};

const handleDialogError = () => error("Error", "Failed to save item.");
```

## Auth Integration
The UI reads the authenticated user via `components/providers/AuthProvider`. Role gating (e.g., super_admin) controls which actions are rendered. API calls send cookies automatically (CORS with credentials) so the backend can enforce RLS and role checks.

## Key Flows
- Staff
  - List: `/staff` with SWR, page-level toasts, AddStaffDialog triggers `onSuccess` and parent calls `mutate(["/staff"])`.
  - Detail: `/staff/[id]` uses SWR for staff and linked auth profile. Edit details, grant/revoke access, update roles; each action revalidates SWR and shows a toast.
- Clients
  - List: `/clients` with SWR; AddClientDialog emits `onSuccess`; parent calls `mutate(["/client"])`.
  - Detail: `/clients/[id]` uses SWR for client and related drop-cable jobs, supports edit and save with cache revalidation.
- Inventory
  - List: `/inventory` with SWR and dialog for add/edit; low stock indicators and export.
- Fleet
  - List: `/fleet` with SWR; add/edit through dialog; consistent success/error toasts.
- Drop Cable (under client)
  - Uses SWR and page-level toasts for generate, upload and email actions.

## UI Components
- `components/shared/Toast` – Provider + hook for notifications.
- `components/shared/Header` – Page header with optional stats and actions.
- `components/shared/DataTable` – Table with search, export, and view mode controls.
- Dialogs (e.g., `AddStaffDialog`) are dumb: they call `onSuccess/onError` and let the page handle toasts and revalidation.

## Troubleshooting
- If API calls fail with CORS/auth issues, confirm the backend CORS allows your frontend origin and credentials.
- If `useToast` throws, ensure the ToastProvider wraps the app in `app/layout.js`.
- If SWR doesn’t refresh, ensure you’re mutating the exact key used by the page (e.g., `mutate(["/staff"])`).

## Running Locally
1. Start the API (see backend README) on port 3001 (or update `NEXT_PUBLIC_API_BASE_URL`).
2. From `react-admin-panel/`:
```bash
npm install
npm run dev
```
Open http://localhost:3000
