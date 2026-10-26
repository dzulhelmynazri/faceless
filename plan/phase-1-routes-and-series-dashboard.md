# Phase 1: Routes & Series Management Dashboard

## 1. Goal & Objectives

Organize the application routes to match the streamlined competitor workflow (AutoShorts):

- **`/series`**: Direct **Creation Wizard** for configuring automated series pipelines.
- **`/videos`**: Centralized **Series Dashboard** to view all active/paused/archived series pipelines, manage schedules, and navigate to series details.
- **`/series/[id]`**: **Series Detail Hub** for managing series settings, toggling status, and viewing episode feeds.

---

## 2. Route Architecture

```
apps/web/src/app/(protected)/
├── series/
│   ├── page.tsx                           # Creation Wizard (8 Steps with SeriesWizardProvider)
│   ├── [id]/
│   │   ├── page.tsx                       # Series Hub: series details, status toggle, episode list
│   │   └── episodes/
│   │       └── [episodeId]/
│   │           └── page.tsx               # Episode Studio (Phase 6): in-browser player & scene editor
│   └── _components/                       # Shared wizard components & hooks
└── videos/
    ├── page.tsx                           # Videos / Series Dashboard: lists existing series pipelines or shows empty state
    └── _components/                       # VideosDashboard, cards, status filters & empty states
```

---

## 3. Detailed Component Plan

### A. Videos / Series Dashboard (`/videos/page.tsx`)

- **Query**: Fetch user series using `trpc.series.list.useQuery()`.
- **States**:
  - **Loading**: Skeleton cards matching the grid layout.
  - **Empty State**: Focused card ("No Active Series" / "No Series Created Yet") with description.
  - **Populated Grid**:
    - Series card with:
      - Series title & niche badge.
      - Voice name & language indicator.
      - Scheduled publish time (e.g. "Posts at 12:00 PM").
      - Episode count & connected social platform badges (TikTok, YouTube, Instagram).
      - Status pill (`ACTIVE` badge, `PAUSED` secondary badge, `ARCHIVED` outline badge).
      - Quick actions: View Details (`/series/[id]`), Pause/Resume toggle, Archive/Unarchive, Delete series.
    - Top bar with "+ Create New Series" button linking directly to `/series`.

### B. Series Creation Wizard (`/series/page.tsx`)

- Dedicated 8-step creation wizard layout directly on `/series`.
- **Wizard State Persistence**:
  - Automatically persist form state to `localStorage` (`faceless_series_wizard_draft`).
  - If existing draft is detected on mount, show a subtle banner: _"Draft restored from your last session. [Clear Draft]"_.
  - Clear draft upon successful creation.
- `createSeriesMutation` in `use-series-wizard-state.ts`:
  ```ts
  onSuccess: async ({ seriesId, name }) => {
    localStorage.removeItem("faceless_series_wizard_draft");
    toast.success(`Series "${name}" created successfully!`);
    await Promise.all([
      queryClient.invalidateQueries(trpc.series.list.queryFilter()),
      queryClient.invalidateQueries(
        trpc.billing.checkSeriesEntitlement.queryFilter()
      ),
    ]);
    router.push(`/series/${seriesId}`);
  };
  ```

### C. Series Detail Hub (`/series/[id]/page.tsx`)

- **Query**: Fetch series by ID using `trpc.series.byId.useQuery({ id })`.
- **Header**:
  - Series Name (editable inline or via settings dialog).
  - Status toggle (`ACTIVE` / `PAUSED` / `ARCHIVED`).
  - Summary badges: Niche, Voice, Art Style, Caption Style, Duration, Publish Time (with next scheduled generation indicator: 2 hours prior to publish time).
  - Connected Social Accounts with connection status.
  - Action buttons: "Generate Episode Now" (triggers Phase 2 pipeline), "Settings", "Pause/Resume Series".
- **Episode Pipeline Section**:
  - Tabbed list of episodes:
    - **All Episodes**
    - **Review** (`READY_FOR_REVIEW`)
    - **Scheduled** (`APPROVED`)
    - **Published** (`PUBLISHED`)
  - Episode Card:
    - Episode number & title.
    - Status badge (`PENDING`, `GENERATING`, `READY_FOR_REVIEW`, `APPROVED`, `PUBLISHED`, `FAILED`).
    - Actions: "Open in Studio" (`/series/[id]/episodes/[episodeId]`).

---

## 4. API & Mutation Updates (`packages/api/src/routers/series.ts`)

- **`updateStatus` procedure**:
  - Allows toggling series status between `ACTIVE`, `PAUSED`, and `ARCHIVED`.
  - When marked `ARCHIVED` (soft delete), background crons ignore the series, and it is excluded from the active dashboard view while preserving published history.
  - Input: `{ id: string, status: "ACTIVE" | "PAUSED" | "ARCHIVED" }`.
- **`update` procedure**:
  - Allows editing name and publish time after creation.

---

## 5. Implementation Checklist

- [x] Set up `/series/page.tsx` as the direct creation wizard.
- [x] Build `/videos/page.tsx` and `videos-dashboard.tsx` with filter tabs, series cards, and empty states.
- [x] Build `/series/[id]/page.tsx` (Series Hub & Episodes Table) with "Back to Videos" navigation.
- [x] Add `updateStatus` (supporting `ARCHIVED` soft delete) and `update` to tRPC `seriesRouter` and `@faceless/contracts`.
- [x] Run `bunx ultracite check` and `bun run check-types` to ensure 0 lint errors and 100% type safety.
