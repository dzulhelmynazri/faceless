import type { CaptionStyleId } from "@faceless/contracts/series";
import type { CSSProperties } from "react";

import { FONT_FAMILIES } from "./fonts";

export interface CaptionStyleConfig {
  containerStyle: CSSProperties;
  wordStyle: (isActive: boolean) => CSSProperties;
  wrapperStyle?: CSSProperties;
}

export const CAPTION_PRESET_CONFIGS = {
  "bold-stroke": {
    containerStyle: {
      fontFamily: FONT_FAMILIES.montserrat,
      fontSize: "64px",
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: "0.02em",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "16px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#fbbf24" : "#ffffff",
      WebkitTextStroke: "4px #000000",
      paintOrder: "stroke fill",
      transform: isActive ? "scale(1.15)" : "scale(1.0)",
      display: "inline-block",
    }),
  },

  "red-highlight": {
    containerStyle: {
      fontFamily: FONT_FAMILIES.montserrat,
      fontSize: "62px",
      fontWeight: 800,
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "16px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#ef4444" : "#ffffff",
      textShadow: isActive
        ? "0 0 25px rgba(239, 68, 68, 0.9), 0 4px 12px rgba(0,0,0,0.8)"
        : "0 4px 12px rgba(0,0,0,0.8)",
      transform: isActive ? "scale(1.12)" : "scale(1.0)",
      display: "inline-block",
    }),
  },

  sleek: {
    containerStyle: {
      fontFamily: FONT_FAMILIES.inter,
      fontSize: "56px",
      fontWeight: 700,
      letterSpacing: "-0.01em",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "14px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#ffffff" : "#94a3b8",
      textShadow: "0 2px 10px rgba(0,0,0,0.7)",
      transform: isActive ? "translateY(-4px)" : "translateY(0)",
      display: "inline-block",
    }),
  },

  karaoke: {
    containerStyle: {
      fontFamily: FONT_FAMILIES.montserrat,
      fontSize: "60px",
      fontWeight: 800,
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "16px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#facc15" : "#64748b",
      WebkitTextStroke: "2px #000000",
      paintOrder: "stroke fill",
      textShadow: isActive ? "0 0 20px rgba(250, 204, 21, 0.6)" : "none",
      display: "inline-block",
    }),
  },

  majestic: {
    containerStyle: {
      fontFamily: FONT_FAMILIES.cinzel,
      fontSize: "52px",
      fontWeight: 700,
      letterSpacing: "0.06em",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "18px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#fef08a" : "#e2e8f0",
      textShadow: isActive
        ? "0 0 30px rgba(234, 179, 8, 0.8), 0 2px 10px rgba(0,0,0,0.9)"
        : "0 2px 10px rgba(0,0,0,0.9)",
      transform: isActive ? "scale(1.08)" : "scale(1.0)",
      display: "inline-block",
    }),
  },

  beast: {
    containerStyle: {
      fontFamily: FONT_FAMILIES.anton,
      fontSize: "76px",
      fontWeight: 400,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "18px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#22c55e" : "#ffffff",
      WebkitTextStroke: "5px #000000",
      paintOrder: "stroke fill",
      textShadow: "0 8px 16px rgba(0,0,0,0.9)",
      transform: isActive ? "scale(1.18)" : "scale(1.0)",
      display: "inline-block",
    }),
  },

  elegant: {
    containerStyle: {
      fontFamily: FONT_FAMILIES.cormorant,
      fontSize: "58px",
      fontWeight: 700,
      fontStyle: "italic",
      letterSpacing: "0.05em",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "14px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#ffffff" : "#cbd5e1",
      textShadow: isActive
        ? "0 0 20px rgba(255,255,255,0.7), 0 4px 12px rgba(0,0,0,0.8)"
        : "0 4px 12px rgba(0,0,0,0.8)",
      transform: isActive ? "scale(1.06)" : "scale(1.0)",
      display: "inline-block",
    }),
  },

  pixel: {
    containerStyle: {
      fontFamily: FONT_FAMILIES.pressStart,
      fontSize: "36px",
      lineHeight: 1.6,
      textTransform: "uppercase",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "16px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#06b6d4" : "#f8fafc",
      textShadow: isActive
        ? "3px 3px 0 #d946ef, -2px -2px 0 #000"
        : "3px 3px 0 #000000",
      transform: isActive ? "scale(1.1)" : "scale(1.0)",
      display: "inline-block",
    }),
  },

  clarity: {
    containerStyle: {
      fontFamily: FONT_FAMILIES.inter,
      fontSize: "52px",
      fontWeight: 600,
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "14px",
      textAlign: "center",
      width: "auto",
    },
    wrapperStyle: {
      backgroundColor: "rgba(0, 0, 0, 0.72)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      borderRadius: "9999px",
      padding: "16px 36px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.6)",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#38bdf8" : "#f1f5f9",
      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
      transform: isActive ? "scale(1.08)" : "scale(1.0)",
      display: "inline-block",
    }),
  },
} satisfies Record<CaptionStyleId, CaptionStyleConfig>;

export const getCaptionStyleConfig = (
  styleId: CaptionStyleId
): CaptionStyleConfig => CAPTION_PRESET_CONFIGS[styleId];
