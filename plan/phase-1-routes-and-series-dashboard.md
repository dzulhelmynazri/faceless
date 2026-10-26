# Phase 1: Routes & Series Management Dashboard

## 1. Goal & Objectives

Organize the `/series` application routes so users have a centralized **Series Dashboard** to view all active/paused series, move the 8-step creation wizard to a dedicated `/series/new` route, and create the **Series Detail Hub** (`/series/[id]`) for managing episodes.

---

## 2. Route Architecture

```
apps/web/src/app/(protected)/series/
├── page.tsx                           # Series Dashboard: lists existing series or shows empty state
├── new/
│   └── page.tsx                       # Creation Wizard (8 Steps with SeriesWizardProvider)
├── [id]/
│   ├── page.tsx                       # Series Hub: series details, status toggle, episode list
│   └── episodes/
│       └── [episodeId]/
│           └── page.tsx               # Episode Studio (Phase 6): in-browser player & scene editor
└── _components/                       # Shared wizard & card components
```

---

## 3. Detailed Component Plan

### A. Series Dashboard (`/series/page.tsx`)

- **Query**: Fetch user series using `trpc.series.list.useQuery()`.
- **States**:
  - **Loading**: Skeleton cards matching the grid layout.
  - **Empty State**: Friendly hero banner ("No Series Created Yet") with a prominent button linking to `/series/new`.
  - **Populated Grid**:
    - Series card with:
      - Series title & niche badge.
      - Voice name & language indicator.
      - Scheduled publish time (e.g. "Everyday at 12:00 PM").
      - Episode count & connected social platform badges (TikTok, YouTube, Instagram).
      - Status pill (`ACTIVE` green badge, `PAUSED` yellow badge).
      - Quick actions: View Details (`/series/[id]`), Pause/Resume toggle, Delete series.
    - Top bar with "+ Create New Series" button.

### B. Relocate Wizard to `/series/new/page.tsx`

- Move wizard layout from `series/page.tsx` into `series/new/page.tsx`.
- Update `createSeriesMutation` in `use-series-wizard-state.ts`:
  ```ts
  onSuccess: async ({ seriesId, name }) => {
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
  - Series Name (editable inline or via dialog).
  - Status toggle (`ACTIVE` / `PAUSED`).
  - Summary badges: Niche, Voice, Art Style, Caption Style, Duration, Publish Time.
  - Connected Social Accounts with connection status.
  - Action buttons: "Generate Episode Now" (triggers Phase 2 pipeline), "Settings", "Delete".
- **Episode Pipeline Section**:
  - Tabbed or filtered list of episodes:
    - **All Episodes**
    - **Ready for Review** (awaiting approval)
    - **Scheduled** (ready to auto-post at next `publishTime`)
    - **Published**
  - Episode Card:
    - Thumbnail preview.
    - Episode number & title.
    - Duration.
    - Status badge (`PENDING`, `GENERATING`, `READY_FOR_REVIEW`, `PUBLISHED`, `FAILED`).
    - Actions: "Preview & Edit" (`/series/[id]/episodes/[episodeId]`), "Publish Now", "Delete".

---

## 4. API & Mutation Updates (`packages/api/src/routers/series.ts`)

- **Add `updateStatus` procedure**:
  - Allows toggling series status between `ACTIVE` and `PAUSED`.
  - Input: `{ id: string, status: "ACTIVE" | "PAUSED" }`.
- **Add `updateDetails` procedure**:
  - Allows editing name, publish time, or connected social accounts after creation.

---

## 5. Implementation Checklist

- [ ] Create `apps/web/src/app/(protected)/series/new/page.tsx` with the existing `SeriesWizard`.
- [ ] Update `use-series-wizard-state.ts` router redirect to navigate to `/series/${seriesId}` on success.
- [ ] Build `apps/web/src/app/(protected)/series/page.tsx` (Series Dashboard List & Empty State).
- [ ] Build `apps/web/src/app/(protected)/series/[id]/page.tsx` (Series Hub & Episodes Table).
- [ ] Add `updateStatus` to tRPC `seriesRouter` and `@faceless/contracts`.
- [ ] Run `bunx ultracite check` and `bun run check-types` to ensure 0 lint errors and 100% type safety.
