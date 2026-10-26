# Master Plan: Automated Faceless Video Platform

This directory contains the step-by-step engineering roadmap for building out the end-to-end `/series` feature on the Faceless platform.

---

## Architecture Diagram

```mermaid
flowchart TD
    subgraph UI ["1. Web UI & Management"]
        Wizard["Series Wizard (/series/new)<br/>8 Steps: Niche, Voice, Music, Style, Captions, Effects, Socials, Details"] --> DB[(Neon Postgres)]
        DB --> Dashboard["Series Dashboard (/series)<br/>Active Series, Status Toggles, Counts"]
        Dashboard --> SeriesHub["Series Hub & Episode Studio (/series/[id])<br/>Episode Pipeline, Controls"]
    end

    subgraph ScriptEngine ["2. Scriptwriting & Decision Engine (Eve + Jev + AI SDK)"]
        SeriesHub -->|"Generate Episode"| EveAgent["Eve Filesystem Agent (agents/scriptwriter)<br/>instructions.md + tools + Jev decide()"]
        EveAgent --> AIWriter["AI SDK Scriptwriter (AI Gateway)<br/>Hook, Narrative, Scene Prompts"]
        AIWriter --> JevGate["Jev Quality Gates (decide)<br/>- 3s Hook Virality Check<br/>- Duration Word-Count Fit<br/>- Policy Compliance"]
        JevGate -->|"Passes"| ValidScript["Approved Script & Scenes"]
    end

    subgraph AudioEngine ["3. Voiceover & Timestamp Engine (ElevenLabs)"]
        ValidScript --> Sanitizer["Pre-TTS Sanitizer<br/>Strips markdown & stage directions"]
        Sanitizer --> ElevenLabs["ElevenLabs TTS (/with-timestamps)<br/>Model: eleven_v4_turbo ($0.04/1k chars)"]
        ElevenLabs --> MasterAudio["Master Voiceover Audio (.mp3)"]
        ElevenLabs --> WordAlignment["Word-Level Timestamps JSON<br/>(Words, durations, contractions)"]
        MasterAudio --> R2Audio["Cloudflare R2 Storage (Files SDK)"]
    end

    subgraph VisualEngine ["4. Visual Asset Generation"]
        ValidScript --> ScenePrompts["14 Art Style Enriched Prompts"]
        ScenePrompts --> ImageGen["Parallel Batch: FLUX.1 [schnell]<br/>(~$0.003 / image, 9:16 vertical)"]
        ImageGen --> R2Images["Cloudflare R2 Storage (Files SDK)"]
        ImageGen -.->|"Auto-derive"| Thumbnail["Episode Thumbnail (Scene 1)"]
    end

    subgraph RemotionEngine ["5. Remotion Video Engine"]
        R2Audio --> RemotionComp["Remotion Composition (9:16 1080x1920 30fps)"]
        R2Images --> RemotionComp
        WordAlignment --> CaptionEngine["2-4 Word Sliding Caption Engine (9 Presets)"]
        CaptionEngine --> RemotionComp
        MusicTrack["Background Music (Preset or Custom)<br/>Dynamic Ducking: 0.12 speech / 0.32 pause"] --> RemotionComp
        Glitch["Chromatic Aberration / Glitch Shader"] --> RemotionComp
    end

    subgraph OutputEngine ["6. Preview, Render & Distribution"]
        RemotionComp --> WebPreview["@remotion/player (In-Browser Studio)"]
        RemotionComp --> ServerRender["@remotion/renderer (Server MP4 Export)"]
        ServerRender --> R2Video["Cloudflare R2 (Final MP4)"]
        R2Video --> SocialScheduler["Social Publisher (@faceless/socials)<br/>TikTok, YouTube Shorts, Instagram Reels"]
        SocialScheduler --> SocialPubRecord["Prisma SocialPublication Records"]
    end
```

---

## Phase Breakdown

| Document | Phase | Key Objective |
| :-- | :-- | :-- |
| [Phase 1](file:///Users/dzulhelmy/Desktop/faceless/plan/phase-1-routes-and-series-dashboard.md) | **Routing & Series Dashboard** | Relocate wizard to `/series/new`, build `/series` dashboard list & `/series/[id]` management hub. |
| [Phase 2](file:///Users/dzulhelmy/Desktop/faceless/plan/phase-2-eve-jev-scriptwriting-engine.md) | **Eve, Jev & AI SDK Engine** | Filesystem-first agent in `@faceless/agent` (`packages/agent`), virality & duration gates via Jev `decide()`. |
| [Phase 3](file:///Users/dzulhelmy/Desktop/faceless/plan/phase-3-elevenlabs-tts-word-timestamps.md) | **ElevenLabs Voiceover & Timestamps** | `eleven_v4_turbo` synthesis, pre-TTS sanitization, zero-migration `SeriesEpisodeMetadata`, R2 storage. |
| [Phase 4](file:///Users/dzulhelmy/Desktop/faceless/plan/phase-4-visual-assets-generation.md) | **Visual Asset Generation Pipeline** | 14 curated styles matched to contracts, parallel FLUX.1 [schnell] batching, `SeriesEpisodeScene` model. |
| [Phase 5](file:///Users/dzulhelmy/Desktop/faceless/plan/phase-5-remotion-video-composition.md) | **Remotion Video Composition** | 9:16 layout, 2–4 word sliding captions (9 presets), Ken Burns motion, dynamic audio ducking, glitch FX. |
| [Phase 6](file:///Users/dzulhelmy/Desktop/faceless/plan/phase-6-episode-studio-and-web-player.md) | **In-Browser Episode Studio** | Real-time scrubbing with `@remotion/player`, live style switching, single-scene prompt regeneration. |
| [Phase 7](file:///Users/dzulhelmy/Desktop/faceless/plan/phase-7-server-rendering-and-social-publishing.md) | **Server Rendering & Social Publishing** | `@remotion/renderer` MP4 export, `/api/cron/publish`, and multi-platform posting via existing `@faceless/socials`. |

---

## Tech Stack & Core Dependencies

| Domain | Technology / Service | Role |
| :-- | :-- | :-- |
| **Framework** | Next.js 15 (App Router), React 19 | Frontend web app, server actions, API routes |
| **RPC & State** | tRPC v11, TanStack Query v5, `nuqs` | Type-safe client-server contract, query caching, URL state |
| **Styling** | Tailwind CSS v4, Lucide Icons | Responsive modern UI |
| **Quality & Lint** | Ultracite (Oxlint + Oxfmt) | Zero-config linting & formatting standards |
| **Database** | Prisma 7 + Neon PostgreSQL | Relational schemas (`Series`, `SeriesEpisode`, `SeriesEpisodeScene`, `SocialPublication`) |
| **Storage** | Cloudflare R2 via `@faceless/storage` (Files SDK) | Audio clips, scene images, final rendered MP4s with public CDN streaming |
| **AI LLM** | Vercel AI SDK + Vercel AI Gateway (`AI_GATEWAY_API_KEY`) | Dynamic model routing (GPT-4o, Claude 3.5, Flash) |
| **Durable Agents** | Eve (`eve.dev`) & Jev (`typesafe-ai/jev`) | Filesystem-first agent directory and LLM quality decision gates (`decide`) |
| **Voice TTS** | ElevenLabs API (`eleven_v4_turbo`) | High-speed TTS with character/word alignment JSON ($0.04 / 1k chars) |
| **Image Gen** | FLUX.1 [schnell] via AI Gateway | Ultra-fast 9:16 scene keyframe generation (~$0.003 / image) |
| **Video Engine** | Remotion (`@remotion/core`, `@remotion/player`, `@remotion/renderer`) | Programmatic React-based video generation & in-browser live preview |
| **Socials** | `@faceless/socials` (`@opencoredev/social-sdk`) | OAuth-authenticated upload to TikTok, YouTube Shorts, Instagram Reels |
