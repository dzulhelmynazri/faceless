# Phase 7: Server Rendering & Social Publishing Pipeline (Cloudflare Containers Edition)

## 1. Goal & Architectural Overview

Execute server-side video rendering using **`@remotion/renderer`** to export production-ready vertical videos ($1080 \times 1920$ H.264 / AAC @ 30 FPS, CRF 20) and persist them to Cloudflare R2 via `@faceless/storage`. Rendering is orchestrated by **`apps/render-service`** running on **Cloudflare Containers** (with an in-process local fallback for local development).

Automate scheduled publishing based on series `publishTime` (resolved to UTC `scheduledFor` timestamps) using a secure cron endpoint (`/api/cron/publish`), dispatching videos to connected TikTok, YouTube Shorts, and Instagram accounts via **`@faceless/socials`**.

---

## 2. End-to-End System Architecture

```mermaid
flowchart TD
    subgraph "1. Studio Lifecycle & Trigger"
        Review["Episode in Studio<br/>(status: READY_FOR_REVIEW)"]
        ApproveAction["Creator clicks 'Approve & Render'<br/>or autopilot triggers"]
        Review --> ApproveAction
        ApproveAction --> SetRendering["Atomically transition<br/>status: RENDERING"]
    end

    subgraph "2. Video Rendering Service (apps/render-service & @faceless/remotion)"
        SetRendering --> DispatchRenderer{"RENDER_SERVICE_URL configured?"}

        DispatchRenderer -->|Local Dev / Fallback| LocalRenderer["LocalRemotionRenderer (@faceless/remotion/server)<br/>- In-process @remotion/renderer<br/>- Zero Docker needed for dev<br/>- Direct upload to R2"]

        DispatchRenderer -->|Production Cloudflare| ContainerTrigger["POST /jobs to apps/render-service<br/>Auth: RENDER_SERVICE_TOKEN<br/>Returns 202 Accepted (<200ms)"]

        ContainerTrigger --> CFContainer["Cloudflare Container (Docker)<br/>- Node.js + Chromium + FFmpeg<br/>- @remotion/renderer compilation"]

        CFContainer --> R2Upload["Upload MP4 to Cloudflare R2 via @faceless/storage<br/>users/{userId}/series/{seriesId}/episodes/{episodeId}/video.mp4<br/>(Zero Egress within Cloudflare)"]
        LocalRenderer --> R2Upload

        R2Upload --> WebhookCallback["POST /api/render/webhook (Next.js)<br/>Auth: RENDER_WEBHOOK_SECRET"]
        WebhookCallback --> SetApproved["Save SeriesEpisode.videoUrl<br/>Calculate UTC scheduledFor<br/>status: APPROVED"]
    end

    subgraph "3. Publishing Engine (Automated Cron & On-Demand)"
        CronTrigger["Cron Endpoint (/api/cron/publish)<br/>Triggered on schedule with CRON_SECRET"]
        StudioPublishNow["Studio Action: 'Publish Now'<br/>(Immediate bypass)"]

        CronTrigger --> QueryDue["Query due episodes:<br/>status == APPROVED<br/>scheduledFor <= now()<br/>videoUrl != null"]
        QueryDue --> AtomicLock["Atomic DB Lock (updateMany)<br/>status: APPROVED -> PUBLISHING"]
        StudioPublishNow --> AtomicLock
    end

    subgraph "4. Multi-Platform Social Dispatch (@faceless/socials)"
        AtomicLock --> Dispatcher["publishVideoToSocials<br/>Deterministic Idempotency Key: episode_{id}"]
        Dispatcher --> TikTok["TikTok Content Posting API"]
        Dispatcher --> YouTube["YouTube Shorts (Data API v3)"]
        Dispatcher --> Instagram["Instagram Graph API (Reels)"]

        TikTok --> RecordOutcomes["Create / Update SocialPublication Records<br/>- Per-platform status (published / failed)<br/>- externalPostId / postUrl<br/>- Error diagnostics"]
        YouTube --> RecordOutcomes
        Instagram --> RecordOutcomes
    end

    subgraph "5. Final State & Error Handling"
        RecordOutcomes --> CheckOutcomes{"Any Platform Succeeded?"}
        CheckOutcomes -->|Yes| SetPublished["SeriesEpisode.status = PUBLISHED<br/>publishedAt = now()"]
        CheckOutcomes -->|No (All Failed)| SetFailed["SeriesEpisode.status = FAILED<br/>error = 'Failed to publish'"]
    end
```

---

## 3. Explicit State Machine (`EpisodeStatus`)

To eliminate concurrency bugs, protect cron from publishing unfinished videos, and provide transparent creator UI feedback, `EpisodeStatus` is expanded in `packages/db/prisma/schema/series.prisma`:

```prisma
enum EpisodeStatus {
  PENDING           // Script generation queued
  GENERATING        // AI Scriptwriter, ElevenLabs TTS, or Flux visual assets in flight
  READY_FOR_REVIEW  // Voiceover + scenes ready in web player for creator preview
  RENDERING         // Cloudflare Container or local renderer actively compiling MP4
  APPROVED          // MP4 baked on R2 CDN, scheduledFor set, ready for publish
  PUBLISHING        // Claimed by cron / immediate publisher (atomic execution lock)
  PUBLISHED         // Successfully broadcast to connected social accounts
  FAILED            // Fatal failure in generation, rendering, or publishing
}
```

---

## 4. Rendering Infrastructure & Service Layout

### A. Dedicated Rendering App: `apps/render-service`

A dedicated Node.js / Hono microservice optimized for running headless Chromium + FFmpeg inside Cloudflare Containers:

```
apps/render-service/
├── Dockerfile              # Debian slim + Node.js 22 + Chromium + FFmpeg + fonts
├── wrangler.jsonc          # Cloudflare Container + Worker configuration
├── package.json            # @remotion/renderer, @remotion/bundler, hono, @faceless/storage
├── tsconfig.json
└── src/
    ├── index.ts            # Hono server (POST /jobs, GET /health)
    ├── renderer.ts         # Remotion bundle + renderMedia execution
    └── webhook.ts          # Dispatches signed completion webhook back to Next.js
```

#### Endpoints in `apps/render-service`:

1. `POST /jobs`:
   - Validates `Authorization: Bearer ${RENDER_SERVICE_TOKEN}`.
   - Body: `{ episodeId, userId, seriesId, compositionProps, callbackUrl }`.
   - Returns `202 Accepted` with `{ jobId, status: "processing" }` immediately (<200ms).
   - Starts async rendering task in the background.
2. Background Job Execution:
   - Renders video with `@remotion/renderer` into `/tmp/episode_${id}.mp4` (CRF 20, H.264, AAC @ 30 FPS).
   - Streams upload to Cloudflare R2 using `@faceless/storage` under key: `users/${userId}/series/${seriesId}/episodes/${episodeId}/video.mp4`.
   - Calls `callbackUrl` (`POST /api/render/webhook`) with `Authorization: Bearer ${RENDER_WEBHOOK_SECRET}` and payload `{ episodeId, videoUrl, status: "completed" }`.
   - Cleans up `/tmp` artifacts in a `finally` block.

---

### B. Monorepo Seams: `@faceless/remotion/server`

Isolates Node.js rendering utilities from React compositions to avoid client bundling issues:

```
packages/remotion/
├── package.json
│   ├── "."        -> ./src/index.ts (React compositions & player types)
│   └── "./server" -> ./src/server/index.ts (Renderer contracts & local renderer)
└── src/
    └── server/
        ├── types.ts              # VideoRendererService, RenderVideoParams, RenderVideoResult
        ├── local-renderer.ts     # LocalRemotionRenderer (in-process for local dev/staging)
        ├── remote-renderer.ts    # CloudflareContainerRenderer (dispatches to apps/render-service)
        ├── factory.ts            # createVideoRenderer() choosing local vs container
        └── index.ts              # Server barrel export
```

#### Dual Mode in `createVideoRenderer()`:

- **Local Dev / Fallback**: If `RENDER_SERVICE_URL` is not set, `LocalRemotionRenderer` executes directly in-process on the local developer machine. Zero Docker required to run `bun dev`!
- **Production Cloudflare**: If `RENDER_SERVICE_URL` is set, `CloudflareContainerRenderer` triggers the Cloudflare Container asynchronously.

---

## 5. Next.js Webhook Handler (`/api/render/webhook`)

Located at `apps/web/src/app/api/render/webhook/route.ts`:

1. Validates `Authorization: Bearer ${RENDER_WEBHOOK_SECRET}`.
2. Reads `{ episodeId, videoUrl, status, error }`.
3. If `status === "completed"`:
   - Updates `SeriesEpisode`:
     - `videoUrl`: `payload.videoUrl`
     - `status`: `"APPROVED"`
     - `scheduledFor`: calculated next UTC occurrence based on `series.publishTime`
4. If `status === "failed"`:
   - Updates `SeriesEpisode`:
     - `status`: `"FAILED"`
     - `error`: `payload.error`

---

## 6. Scheduling Resolution & Atomic Locking

### A. UTC Timestamp Resolution

When an episode transitions to `APPROVED`:

1. `series.publishTime` (e.g. `"12:00 PM"`) is resolved against the series timezone (or UTC default) into an exact UTC `scheduledFor: DateTime`.
2. The cron job query is timezone-agnostic and immune to missed runs:
   ```ts
   const dueEpisodes = await db.seriesEpisode.findMany({
     where: {
       status: "APPROVED",
       videoUrl: { not: null },
       scheduledFor: { lte: new Date() },
       series: { status: "ACTIVE" },
     },
     take: 10,
   });
   ```

### B. Atomic Race-Condition Lock

To prevent parallel cron instances or duplicate triggers from dispatching the same video multiple times:

```ts
const claim = await db.seriesEpisode.updateMany({
  where: {
    id: episode.id,
    status: "APPROVED",
  },
  data: {
    status: "PUBLISHING",
  },
});

if (claim.count === 0) {
  // Another worker or manual publisher already claimed this episode
  continue;
}
```

---

## 7. Social Distribution & Error Recovery (`@faceless/socials`)

### A. Idempotent Target Dispatch

Using `@faceless/socials` (`publishVideoToSocials`), each publish call transmits `idempotencyKey: episode_${episode.id}`:

```ts
const result = await publishVideoToSocials(socialClient, {
  videoUrl: episode.videoUrl,
  title: episode.title,
  description: `${episode.title} #shorts #viral`,
  idempotencyKey: `episode_${episode.id}`,
  targets: connectedAccounts,
});
```

### B. Per-Platform Publication Logging

- Each delivery outcome is recorded in `SocialPublication` with `status: "published" | "failed" | "processing"`.
- Delivery, rate limits, and network retries are delegated to Zernio via `@faceless/socials`.
- If any target platform accepts or publishes the video, the episode transitions to `PUBLISHED`. If all platforms fail, the episode transitions to `FAILED`.

---

## 8. Studio UI Integration (`StudioActionBar`)

The action bar in `apps/web/src/app/(protected)/series/[id]/episodes/[episodeId]/_components/studio-action-bar.tsx` provides complete lifecycle control:

1. **`READY_FOR_REVIEW`**:
   - `[ Approve & Render ]`: Triggers `trpc.series.renderEpisode`, flips status to `RENDERING`.
2. **`RENDERING`**:
   - Animated spinner: `"Rendering Video (1080x1920)..."` with disabled actions.
3. **`APPROVED`**:
   - Badge: `"Approved & Scheduled for [Date/Time]"`.
   - `[ Download MP4 ]`: Direct link to CDN video URL on Cloudflare R2.
   - `[ Publish Now ]`: Direct bypass dispatching immediately to socials.
4. **`PUBLISHING`**:
   - Spinner: `"Publishing to Socials..."`.
5. **`PUBLISHED`**:
   - Badge: `"Published"`.
   - External links to live posts on TikTok, YouTube Shorts, and Instagram.
6. **`FAILED`**:
   - Destructive badge + error banner.

---

## 9. Implementation Checklist

- [x] **Database & Contracts Migration**:
  - [x] Add `RENDERING` and `PUBLISHING` to `EpisodeStatus` enum in `packages/db/prisma/schema/series.prisma`.
  - [x] Run `bun run db:generate`.
  - [x] Update `@faceless/contracts/series` with new statuses, `renderEpisode`, and `publishEpisodeNow` schemas.
- [x] **Remotion Server Architecture (`@faceless/remotion/server`)**:
  - [x] Install `@remotion/bundler` and `@remotion/renderer` in `packages/remotion`.
  - [x] Implement `LocalRemotionRenderer` with in-memory bundle caching and `/tmp` cleanup for local dev.
  - [x] Implement `CloudflareContainerRenderer` adapter (HTTP client to `apps/render-service`).
  - [x] Expose `./server` subpath export in `packages/remotion/package.json`.
- [x] **Cloudflare Container Render App (`apps/render-service`)**:
  - [x] Initialize `apps/render-service` with Dockerfile (Node 22 + Chromium + FFmpeg).
  - [x] Create `wrangler.jsonc` configured for Cloudflare Containers.
  - [x] Implement Hono server with `POST /jobs` and signed webhook callback.
  - [x] Connect with `@faceless/storage` for direct Cloudflare R2 MP4 uploads.
- [x] **Next.js Webhook & API Domain Services**:
  - [x] Create `apps/web/src/app/api/render/webhook/route.ts` validating `RENDER_WEBHOOK_SECRET`.
  - [x] Implement `services/publisher` in `packages/api`: orchestrates `publishVideoToSocials` and records `SocialPublication` rows.
  - [x] Implement `services/renderer` in `packages/api`: prepares composition props and invokes `VideoRendererService`.
- [x] **tRPC Router Procedures (`packages/api/src/routers/series.ts`)**:
  - [x] `series.renderEpisode`: triggers render, sets `RENDERING`.
  - [x] `series.publishEpisodeNow`: manual immediate publish.
- [x] **Automated Cron Endpoint**:
  - [x] Create `apps/web/src/app/api/cron/publish/route.ts` with `CRON_SECRET` bearer authentication.
  - [x] Atomic DB claim (`updateMany` -> `PUBLISHING`).
  - [x] Add cron configuration in `apps/web/vercel.json` (`*/15 * * * *`).
- [x] **Episode Studio UI Updates**:
  - [x] Enhance `StudioActionBar` with all state badges, "Publish Now", and "Download MP4".
- [x] **Quality Assurance**:
  - [x] Run `bunx ultracite check` and `bun run check-types`.
  - [x] Vitest unit tests for renderer adapter, scheduler math, and publisher mapper.
