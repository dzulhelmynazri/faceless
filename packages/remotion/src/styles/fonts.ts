import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadCinzelDecorative } from "@remotion/google-fonts/CinzelDecorative";
import { loadFont as loadCormorantGaramond } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPressStart2P } from "@remotion/google-fonts/PressStart2P";

export interface LoadedCaptionFonts {
  montserrat: string;
  inter: string;
  anton: string;
  cinzel: string;
  cormorant: string;
  pressStart: string;
}

export const ensureCaptionFontsLoaded = (): LoadedCaptionFonts => {
  const montserrat = loadMontserrat("normal", {
    weights: ["800", "900"],
    subsets: ["latin"],
  });

  loadMontserrat("italic", {
    weights: ["800", "900"],
    subsets: ["latin"],
  });

  const inter = loadInter("normal", {
    weights: ["500", "600", "700", "900"],
    subsets: ["latin"],
  });

  const anton = loadAnton("normal", {
    subsets: ["latin"],
  });

  const cinzel = loadCinzelDecorative("normal", {
    weights: ["700"],
    subsets: ["latin"],
  });

  const cormorant = loadCormorantGaramond("normal", {
    weights: ["400", "700"],
    subsets: ["latin"],
  });

  const pressStart = loadPressStart2P("normal", {
    subsets: ["latin"],
  });

  return {
    montserrat: montserrat.fontFamily,
    inter: inter.fontFamily,
    anton: anton.fontFamily,
    cinzel: cinzel.fontFamily,
    cormorant: cormorant.fontFamily,
    pressStart: pressStart.fontFamily,
  };
};

export const FONT_FAMILIES = {
  montserrat: "Montserrat, sans-serif",
  inter: "Inter, sans-serif",
  anton: "Anton, sans-serif",
  cinzel: "'Cinzel Decorative', serif",
  cormorant: "'Cormorant Garamond', serif",
  pressStart: "'Press Start 2P', monospace",
} as const;
