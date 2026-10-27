# Phase 6: In-Browser Episode Studio & Web Player

## 1. Goal & Objectives

Provide creators with an interactive in-browser **Episode Studio** at `/series/[id]/episodes/[episodeId]` utilizing `@remotion/player`. Creators can preview the composed vertical video in real-time with zero-latency playback and frame-accurate scrubbing, review generated scripts, edit visual prompts, regenerate individual scene keyframes, live-switch caption and music presets, and approve the episode for automated publishing.

---

## 2. Studio UI Layout Architecture

```
+------------------------------------------------------------------------------------------------+
|  <- Back to Series     Episode 1: The Curse of Pharaoh's Tomb            [ Publish Now ] [ Approve ]  |
+---------------------------------------------+--------------------------------------------------+
|                                             |                                                  |
|         @remotion/player                    |   Live Style Customizer                          |
|         (Sticky 9:16 Vertical Video)        |   - Caption Preset: [ Red Highlight v ]          |
|                                             |   - Music Track: [ Creepy Melody v ]             |
|         +-------------------------+         |   - Glitch FX: [ Switch ON ]                     |
|         |                         |         +--------------------------------------------------+
|         |       SCENE 1           |         |   Scene Breakdown (4 Scenes)                     |
|         |   [Ken Burns Motion]    |         |   --------------------------------------------   |
|         |                         |         |   [1] Scene 1 (0.0s - 5.2s)                      |
|         |     "THE TOMB..."       |         |       [Thumbnail]  "Deep inside the valley..."   |
|         |   (Live Animated)       |         |       [ Regenerate Image ] [ Edit Prompt ]       |
|         +-------------------------+         |   --------------------------------------------   |
|                                             |   [2] Scene 2 (5.2s - 11.4s)                     |
|         [ Play ] [ 00:04 / 00:36 ] [ Loop ] |       [Thumbnail]  "Historians froze..."         |
|                                             |       [ Regenerate Image ] [ Edit Prompt ]       |
|                                             |                                                  |
+---------------------------------------------+--------------------------------------------------+
```

---

## 3. Detailed Component Plan

### A. Route Setup & Data Fetching

- **Path**: `apps/web/src/app/(protected)/series/[id]/episodes/[episodeId]/page.tsx`
- **Query**: `trpc.series.getEpisodeById.useQuery({ episodeId })`.
  - Returns episode details, associated `scenes` ordered by `sceneNumber`, `audioUrl`, `metadata` (containing `wordTimestamps` and `audioDuration`), and parent series configuration.

---

### B. In-Browser Player & State Orchestrator (`useEpisodeStudio`)

Rather than loose prop drilling, client state is orchestrated by a dedicated hook `useEpisodeStudio` that binds directly to the Remotion composition contract:

```tsx
export function useEpisodeStudio(episode: StudioEpisode) {
  const [customization, setCustomization] = React.useState(
    episode.metadata?.customization ?? {
      captionStyleId: episode.series.captionStyleId,
      bgmUrl: episode.series.customMusicUrl ?? episode.series.presetMusicUrl,
      glitchEffect: episode.series.glitchEffect,
    }
  );

  const playerRef = React.useRef<PlayerRef>(null);

  const compositionProps: VideoCompositionProps = React.useMemo(
    () => ({
      voiceUrl: episode.audioUrl ?? "",
      audioDuration: episode.metadata?.audio?.audioDuration ?? 30,
      wordTimestamps: episode.metadata?.audio?.wordTimestamps ?? [],
      scenes: episode.scenes,
      captionStyleId: customization.captionStyleId,
      bgmUrl: customization.bgmUrl,
      glitchEffect: customization.glitchEffect,
    }),
    [episode, customization]
  );

  return { playerRef, compositionProps, customization, setCustomization };
}
```

The `<EpisodeVideoPreview>` embeds `<Player component={MainVideo} inputProps={compositionProps} />` with zero unmounting or playback resets.

---

### C. Live Style Customizer (Zero-Render Feedback)

Creators can adjust styles in real time before finalizing:

- **Caption Preset Selector**: Live-switches between `bold-stroke`, `red-highlight`, `karaoke`, `beast`, etc.
- **Background Music Selector**: Switch between custom music and presets from `SERIES_MUSIC_PRESETS`.
- **Glitch Effect Switch**: Toggle chromatic aberration and CRT scanline overlays.
- **Persistence**: Overrides persist cleanly in `SeriesEpisode.metadata.customization` without modifying the parent `Series` table.

---

### D. Interactive Scene Breakdown & Granular On-Demand Regeneration

Each scene card in the breakdown allows granular adjustments with zero wasted API spend:

- **Timestamp & Narration**: Shows the spoken time range and narration chunk.
- **Dialogue Editing & Audio Stale State**:
  - Creators can edit the narration text directly.
  - Editing dialogue flags audio as **"Stale (Modified)"**.
  - A single-click **"Re-synthesize Voiceover"** action calls `trpc.series.generateEpisodeAudio.useMutation()` to re-align word timestamps for the full script with ElevenLabs.
- **Visual Prompt Editor & Single-Scene Regeneration**:
  - Creators can edit the prompt (e.g. adding _"Include an eerie full moon"_).
  - A single-click **"Re-generate Image"** button calls `trpc.series.regenerateEpisodeScene.useMutation()`. Runs FLUX Schnell for that scene only (~1.5s), uploads the new WebP to R2, updates `SeriesEpisodeScene`, and updates the Remotion player optimistically without re-rendering unaffected scenes.

---

### E. Status Lifecycle & Approval Actions

| Status | Description | User Interface State |
| :-- | :-- | :-- |
| **`GENERATING`** | Eve scriptwriting, ElevenLabs TTS, or FLUX image generation in progress. | Displays animated loading progress skeletons. |
| **`READY_FOR_REVIEW`** | Assets generated; awaiting creator review. | Full interactive player, scene editor, and approval action bar. |
| **`APPROVED`** | Creator approved the episode. | Pre-renders MP4 immediately; marked for scheduled publishing by background worker at `publishTime`. |
| **`PUBLISHED`** | Rendered to MP4 and posted to social platforms. | Displays live links to TikTok, YouTube Shorts, and Instagram Reels. |

**Action Bar Controls**:

1. **"Approve & Schedule"** (Primary): Sets status to `APPROVED`, triggers Phase 7 pre-rendering in background.
2. **"Publish Immediately"** (Secondary): Sets status to `APPROVED` and triggers immediate multi-platform posting.
3. **"Regenerate Entire Episode"** (Dropdown): Re-runs Phase 2–4 pipeline if a complete rewrite is needed.

---

## 4. API Endpoints (`packages/api/src/routers/series.ts`)

- **`series.getEpisodeById`**: Input: `{ episodeId: string }`. Returns full episode record, ordered scenes, parent series configuration, and merged composition props.
- **`series.regenerateEpisodeScene`** _(Existing & Reused)_: Input: `{ episodeId: string, sceneNumber: number, promptOverride?: string }`.
- **`series.updateEpisodeCustomization`**: Input: `{ episodeId: string, customization: EpisodeCustomizationInput }`. Persists style overrides to `SeriesEpisode.metadata.customization`.
- **`series.updateEpisodeStatus`**: Input: `{ episodeId: string, status: "READY_FOR_REVIEW" | "APPROVED" | "PUBLISHED" }`.

---

## 5. Implementation Checklist

- [x] Add `episodeCustomizationSchema` to `packages/contracts/src/series.ts` and extend `seriesEpisodeMetadataSchema`.
- [x] Implement `getEpisodeById`, `updateEpisodeCustomization`, and `updateEpisodeStatus` in `packages/api/src/routers/series.ts`.
- [x] Create `useEpisodeStudio` hook in `apps/web/src/app/(protected)/series/[id]/episodes/[episodeId]/_hooks/use-episode-studio.ts`.
- [x] Implement `EpisodeVideoPreview` component wrapping `@remotion/player` with `MainVideo`.
- [x] Build `LiveStyleCustomizer` for instant caption and BGM previewing.
- [x] Build `SceneBreakdownList` component with prompt/dialogue editing and granular single-scene regeneration.
- [x] Create `apps/web/src/app/(protected)/series/[id]/episodes/[episodeId]/page.tsx` with responsive 2-column studio layout.
- [x] Run `bunx vitest run`, `bun run check-types`, and `bunx ultracite check`.
