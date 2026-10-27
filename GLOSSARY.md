# Faceless Domain Glossary

This document defines the core domain terms and concepts across the Faceless platform architecture.

---

## 1. Series Domain

- **Series**: The top-level automated channel container configured by a user. Holds recurring niche rules, art style, voice selection, posting schedule, and connected social accounts.
- **Niche Prompt**: The foundational prompt defining the genre, tone, themes, and narrative boundaries for all episodes in a series (e.g., true crime mysteries, stoic philosophy).
- **Episode**: A single short-form video release belonging to a series, progressing through statuses: `PENDING` $\rightarrow$ `GENERATING` $\rightarrow$ `READY_FOR_REVIEW` $\rightarrow$ `APPROVED` $\rightarrow$ `PUBLISHED`.
- **Topic Override**: An optional user-specified subject for a single episode (e.g., "The Dyatlov Pass Incident") that guides generation without altering the broader series niche.

---

## 2. Voiceover & Audio Domain

- **Voiceover Module**: The deep module responsible for turning approved episode script narration into synchronized audio assets. Encapsulates text sanitization, ElevenLabs API synthesis, dual-token word alignment, R2 object storage, and generation cost accounting behind a single interface.
- **Script Narration**: The spoken text authored by the scriptwriter agent, containing dialogue and potentially stage artifacts.
- **Text Sanitization**: Pre-TTS transformation that strips markdown characters and parenthetical/bracketed stage directions (e.g. `[Dramatic pause]`) so TTS engines do not verbalize formatting artifacts.
- **Word Timestamps**: Millisecond-accurate character-to-word timing boundaries capturing `word` (display token with natural punctuation) and `cleanWord` (stripped token for keyword highlighting and Remotion animation sync).
- **Voice Preset**: A curated voice profile mapped to an ElevenLabs voice ID and characterized by gender, category (e.g., storytelling, social), and speech dynamics.

---

## 3. Metadata & Asset Domain

- **Episode Metadata**: The structured, non-destructive JSON payload stored on `SeriesEpisode.metadata`. Organizes phase artifacts into typed namespaces (`script`, `audio`, and upcoming `visuals` and `render`).
- **Audio Asset**: The master narration MP3 uploaded to Cloudflare R2 under tenant-isolated pathing (`users/${userId}/series/${seriesId}/episodes/${episodeId}/audio.mp3`) and streamed via a public CDN base URL.
