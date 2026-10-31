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
      fontSize: "50px",
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: "0.02em",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "14px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#ffffff" : "#e2e8f0",
      WebkitTextStroke: "5px #000000",
      paintOrder: "stroke fill",
      textShadow: "0 4px 10px rgba(0,0,0,0.9)",
      transform: isActive ? "scale(1.12)" : "scale(1.0)",
      display: "inline-block",
    }),
  },

  "red-highlight": {
    containerStyle: {
      fontFamily: FONT_FAMILIES.montserrat,
      fontSize: "48px",
      fontWeight: 900,
      textTransform: "uppercase",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "14px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#ef4444" : "#ffffff",
      WebkitTextStroke: isActive ? "3px #000000" : "3.5px #000000",
      paintOrder: "stroke fill",
      filter: isActive
        ? "drop-shadow(0 0 12px rgba(239, 68, 68, 0.95)) drop-shadow(0 0 4px rgba(239, 68, 68, 0.8))"
        : "drop-shadow(0 3px 8px rgba(0,0,0,0.85))",
      transform: isActive ? "scale(1.15)" : "scale(1.0)",
      display: "inline-block",
    }),
  },

  sleek: {
    containerStyle: {
      fontFamily: FONT_FAMILIES.inter,
      fontSize: "48px",
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: "-0.01em",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "12px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
      WebkitTextStroke: isActive ? "0px transparent" : "2px rgba(0, 0, 0, 0.6)",
      paintOrder: "stroke fill",
      filter: isActive
        ? "drop-shadow(0 0 16px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))"
        : "none",
      transform: isActive ? "scale(1.1)" : "scale(1.0)",
      display: "inline-block",
    }),
  },

  karaoke: {
    containerStyle: {
      fontFamily: FONT_FAMILIES.montserrat,
      fontSize: "48px",
      fontWeight: 900,
      textTransform: "uppercase",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      gap: "12px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.95)",
      backgroundColor: isActive ? "#06b6d4" : "transparent",
      borderRadius: "16px",
      padding: "4px 14px",
      WebkitTextStroke: isActive ? "0px transparent" : "4px #000000",
      paintOrder: "stroke fill",
      boxShadow: isActive ? "0 4px 14px rgba(6, 182, 212, 0.6)" : "none",
      filter: isActive ? "none" : "drop-shadow(0 3px 8px rgba(0,0,0,0.85))",
      transform: isActive ? "scale(1.08)" : "scale(1.0)",
      display: "inline-block",
    }),
  },

  majestic: {
    containerStyle: {
      fontFamily: FONT_FAMILIES.montserrat,
      fontSize: "48px",
      fontWeight: 900,
      fontStyle: "italic",
      textTransform: "uppercase",
      letterSpacing: "0.02em",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "14px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.85)",
      textShadow: "5px 5px 0 #000000, 10px 10px 0 rgba(0,0,0,0.45)",
      transform: isActive ? "scale(1.1) translateY(-4px)" : "scale(1.0)",
      display: "inline-block",
    }),
  },

  beast: {
    containerStyle: {
      fontFamily: FONT_FAMILIES.anton,
      fontSize: "50px",
      fontWeight: 400,
      fontStyle: "italic",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "14px",
      textAlign: "center",
      width: "100%",
      transform: "rotate(-8deg)",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#ffffff" : "#e2e8f0",
      WebkitTextStroke: "5px #000000",
      paintOrder: "stroke fill",
      filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.95))",
      transform: isActive ? "scale(1.18)" : "scale(1.0)",
      display: "inline-block",
    }),
  },

  elegant: {
    containerStyle: {
      fontFamily: FONT_FAMILIES.cormorant,
      fontSize: "48px",
      fontWeight: 600,
      letterSpacing: "0.13em",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "14px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
      textShadow: "3px 3px 0 #000000, 6px 6px 12px rgba(0,0,0,0.6)",
      transform: isActive ? "scale(1.06)" : "scale(1.0)",
      display: "inline-block",
    }),
  },

  pixel: {
    containerStyle: {
      fontFamily: FONT_FAMILIES.pressStart,
      fontSize: "38px",
      lineHeight: 1.6,
      textTransform: "uppercase",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "12px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.8)",
      WebkitTextStroke: "4px #000000",
      paintOrder: "stroke fill",
      textShadow: "5px 5px 0 #000000",
      transform: isActive ? "scale(1.1)" : "scale(1.0)",
      display: "inline-block",
    }),
  },

  clarity: {
    containerStyle: {
      fontFamily: FONT_FAMILIES.inter,
      fontSize: "46px",
      fontWeight: 500,
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "12px",
      textAlign: "center",
      width: "100%",
    },
    wordStyle: (isActive) => ({
      color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
      WebkitTextStroke: "1px rgba(0, 0, 0, 0.7)",
      paintOrder: "stroke fill",
      textShadow: "2px 2px 4px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)",
      transform: isActive ? "scale(1.06)" : "scale(1.0)",
      display: "inline-block",
    }),
  },
} satisfies Record<CaptionStyleId, CaptionStyleConfig>;

export const getCaptionStyleConfig = (
  styleId: CaptionStyleId
): CaptionStyleConfig => CAPTION_PRESET_CONFIGS[styleId];
