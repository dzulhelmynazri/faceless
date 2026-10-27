import type { VideoCompositionProps } from "./types";

export const defaultVideoProps = {
  voiceUrl:
    "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverending_Story.mp3",
  audioDuration: 12,
  wordTimestamps: [
    { word: "Did", cleanWord: "Did", start: 0.2, end: 0.5 },
    { word: "you", cleanWord: "you", start: 0.5, end: 0.7 },
    { word: "know", cleanWord: "know", start: 0.7, end: 1 },
    { word: "that", cleanWord: "that", start: 1, end: 1.3 },
    { word: "nine", cleanWord: "nine", start: 1.3, end: 1.7 },
    { word: "hikers", cleanWord: "hikers", start: 1.7, end: 2.2 },
    { word: "vanished,", cleanWord: "vanished", start: 2.2, end: 2.9 },
    { word: "and", cleanWord: "and", start: 3.2, end: 3.5 },
    { word: "their", cleanWord: "their", start: 3.5, end: 3.8 },
    { word: "tents", cleanWord: "tents", start: 3.8, end: 4.2 },
    { word: "were", cleanWord: "were", start: 4.2, end: 4.5 },
    { word: "cut", cleanWord: "cut", start: 4.5, end: 4.9 },
    { word: "from", cleanWord: "from", start: 4.9, end: 5.2 },
    { word: "the", cleanWord: "the", start: 5.2, end: 5.4 },
    { word: "inside?", cleanWord: "inside", start: 5.4, end: 6.2 },
    { word: "No", cleanWord: "No", start: 7, end: 7.3 },
    { word: "one", cleanWord: "one", start: 7.3, end: 7.6 },
    { word: "knows", cleanWord: "knows", start: 7.6, end: 8 },
    { word: "what", cleanWord: "what", start: 8, end: 8.3 },
    { word: "they", cleanWord: "they", start: 8.3, end: 8.6 },
    { word: "were", cleanWord: "were", start: 8.6, end: 8.9 },
    { word: "running", cleanWord: "running", start: 8.9, end: 9.4 },
    { word: "from.", cleanWord: "from", start: 9.4, end: 10 },
  ],
  scenes: [
    {
      sceneNumber: 1,
      narrationText: "Did you know that nine hikers vanished,",
      visualPrompt: "A snowy mountain peak at dusk, ominous blizzard",
      imageUrl:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&h=1920&q=80",
      duration: 3,
    },
    {
      sceneNumber: 2,
      narrationText: "and their tents were cut from the inside?",
      visualPrompt: "An abandoned torn tent flapping violently in the snow",
      imageUrl:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&h=1920&q=80",
      duration: 3.5,
    },
    {
      sceneNumber: 3,
      narrationText: "No one knows what they were running from.",
      visualPrompt: "Shadowy figures fleeing into a dark pine forest",
      imageUrl:
        "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1080&h=1920&q=80",
      duration: 5.5,
    },
  ],
  captionStyleId: "red-highlight",
  bgmUrl:
    "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3",
  glitchEffect: true,
} satisfies VideoCompositionProps;
