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

### B. In-Browser Player (`@remotion/player`)

The player embeds the root Remotion composition directly in the React DOM with zero server-rendering latency:

```tsx
import { Player, type PlayerRef } from "@remotion/player";
import { MainVideo } from "@/remotion/compositions/main-video";

export function EpisodeVideoPreview({
  episode,
  captionStyleId,
  glitchEffect,
  bgmUrl,
}: EpisodePreviewProps) {
  const playerRef = React.useRef<PlayerRef>(null);

  return (
    <div className="sticky top-6 flex flex-col items-center">
      <Player
        ref={playerRef}
        component={MainVideo}
        inputProps={{
          voiceUrl: episode.audioUrl,
          audioDuration: episode.metadata?.audioDuration ?? 30,
          wordTimestamps: episode.metadata?.wordTimestamps ?? [],
          scenes: episode.scenes,
          captionStyleId,
          glitchEffect,
          bgmUrl,
        }}
        durationInFrames={Math.ceil(
          (episode.metadata?.audioDuration ?? 30) * 30
        )}
        fps={30}
        compositionWidth={1080}
        compositionHeight={1920}
        style={{
          width: "100%",
          maxWidth: "380px",
          aspectRatio: "9 / 16",
          borderRadius: "1rem",
          overflow: "hidden",
        }}
        controls
        loop
      />
    </div>
  );
}
```

---

### C. Live Style Customizer (Zero-Render Feedback)

Creators can adjust styles in real time before finalizing:

- **Caption Preset Selector**: Switch between `bold-stroke`, `red-highlight`, `karaoke`, `beast`, etc. The player immediately rerenders with the new typography and animations.
- **Background Music Selector**: Switch between custom music and presets from `SERIES_MUSIC_PRESETS`.
- **Glitch Effect Switch**: Toggle chromatic aberration and CRT scanline overlays.

---

### D. Interactive Scene Breakdown & Granular On-Demand Regeneration

Each scene card in the breakdown allows granular adjustments with zero wasted API spend:

- **Timestamp & Narration**: Shows the spoken time range and narration chunk.
- **Dialogue Editing & Audio Stale State**:
  - Creators can edit the narration text directly.
  - Editing dialogue marks the scene's audio as **"Stale (Modified)"**.
  - A single-click **"Re-generate Audio"** button calls ElevenLabs TTS for that specific segment or re-aligns word timestamps without having to re-render unaffected scenes.
- **Visual Prompt Editor & Image Stale State**:
  - Creators can edit the prompt (e.g. adding _"Include an eerie full moon"_).
  - Editing prompt marks the scene image as **"Stale (Prompt Edited)"**.
  - A single-click **"Re-generate Image"** button calls `trpc.series.regenerateSceneImage.useMutation()`. Runs FLUX Schnell for that scene only (~1.5s), uploads the new WebP to R2, and updates `SeriesEpisodeScene.imageUrl`. The Remotion player updates that scene immediately while preserving audio and other scenes.

---

### E. Status Lifecycle & Approval Actions

| Status | Description | User Interface State |
| :-- | :-- | :-- |
| **`GENERATING`** | Eve scriptwriting, ElevenLabs TTS, or FLUX image generation in progress. | Displays animated loading progress skeletons. |
| **`READY_FOR_REVIEW`** | Assets generated; awaiting creator review. | Full interactive player, scene editor, and approval action bar. |
| **`APPROVED`** | Creator approved the episode. | Pre-renders MP4 immediately; marked for scheduled publishing by background worker at `publishTime`. |
| **`PUBLISHED`** | Rendered to MP4 and posted to social platforms. | Displays live links to TikTok, YouTube Shorts, and Instagram Reels. |

**Action Bar Controls**:

1. **"Approve & Schedule"** (Primary): Sets status to `APPROVED`, immediately triggers Phase 7 pre-rendering in background.
2. **"Publish Immediately"** (Secondary): Triggers Phase 7 server-side rendering and immediate multi-platform posting.
3. **"Regenerate Entire Episode"** (Dropdown): Re-runs Phase 2–4 pipeline if a complete rewrite is needed.

---

## 4. API Endpoints (`packages/api/src/routers/series.ts`)

- **`series.getEpisodeById`**: Input: `{ episodeId: string }`. Returns full episode record, scenes, series configuration, and publications.
- **`series.regenerateSceneImage`**: Input: `{ sceneId: string, customPrompt?: string }`. Re-generates single scene image with FLUX Schnell, uploads to R2, updates `SeriesEpisodeScene`.
- **`series.regenerateSceneAudio`**: Input: `{ sceneId: string, updatedNarration: string }`. Re-generates speech segment and updates timestamps.
- **`series.updateEpisodeStatus`**: Input: `{ episodeId: string, status: "READY_FOR_REVIEW" | "APPROVED" | "PUBLISHED" }`.

---

## 5. Implementation Checklist

- [ ] Create `apps/web/src/app/(protected)/series/[id]/episodes/[episodeId]/page.tsx`.
- [ ] Implement `EpisodeVideoPreview` component wrapping `@remotion/player`.
- [ ] Build Live Style Customizer for instant caption and BGM previewing.
- [ ] Build `SceneBreakdownList` component with prompt/dialogue editing and granular single-scene regeneration.
- [ ] Add `getEpisodeById`, `regenerateSceneImage`, `regenerateSceneAudio`, and `updateEpisodeStatus` to tRPC `seriesRouter`.
- [ ] Implement responsive 2-column layout (sticky player on left, scrollable scenes on right).
- [ ] Run `bunx ultracite check` and `bun run check-types` to ensure zero regressions.
