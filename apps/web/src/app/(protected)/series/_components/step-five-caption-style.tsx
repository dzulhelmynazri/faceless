"use client";

import { SERIES_CAPTION_STYLES } from "@faceless/contracts";
import type { SeriesCaptionStyle } from "@faceless/contracts";
import { Badge } from "@faceless/ui/components/badge";
import { Card, CardContent } from "@faceless/ui/components/card";
import { Check } from "lucide-react";
import * as React from "react";

interface StepFiveCaptionStyleProps {
  selectedCaptionId: string;
  onSelectCaptionStyle: (captionId: string) => void;
}

interface CaptionPhrase {
  top: string;
  bottom: string;
  single: string;
  beast: string;
  clarity: string;
}

const CAPTION_PHRASES: readonly CaptionPhrase[] = [
  { top: "COULD", bottom: "NOT", single: "NOT", beast: "NOT", clarity: "not" },
  { top: "IT", bottom: "ASKED", single: "IT", beast: "ASKED", clarity: "it" },
  { top: "FAIL", bottom: "I", single: "I", beast: "0", clarity: "i" },
  { top: "TOOK", bottom: "A", single: "A", beast: "A", clarity: "a" },
] as const;

const renderBackground = (bgGradientId: string) => (
  <>
    <defs>
      <linearGradient id={bgGradientId} x1="0" y1="0" x2="0" y2="1">
        <stop
          offset="0%"
          stopColor="currentColor"
          className="text-foreground/85"
        />
        <stop
          offset="50%"
          stopColor="currentColor"
          className="text-foreground/60"
        />
        <stop
          offset="100%"
          stopColor="currentColor"
          className="text-foreground/95"
        />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${bgGradientId})`} />
  </>
);

const renderBoldStrokeCaption = (
  phraseIndex: number,
  phrase: CaptionPhrase,
  bgGradientId: string
) => {
  const isLong = phrase.single.length > 2;

  return (
    <svg viewBox="0 0 160 90" className="size-full">
      {renderBackground(bgGradientId)}
      <g
        key={phraseIndex}
        className="animate-in duration-200 fade-in-0 zoom-in-95"
      >
        <text
          x="80"
          y="52"
          textAnchor="middle"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="3"
          paintOrder="stroke fill"
          fontSize={isLong ? "16" : "20"}
          fontWeight="900"
          fontFamily="sans-serif"
          className="stroke-foreground/90 text-primary-foreground"
        >
          {phrase.single}
        </text>
      </g>
    </svg>
  );
};

const renderRedHighlightCaption = (
  beat: number,
  phrase: CaptionPhrase,
  isTopActive: boolean,
  bgGradientId: string
) => (
  <svg viewBox="0 0 160 90" className="size-full">
    <defs>
      <linearGradient id={bgGradientId} x1="0" y1="0" x2="0" y2="1">
        <stop
          offset="0%"
          stopColor="currentColor"
          className="text-foreground/85"
        />
        <stop
          offset="50%"
          stopColor="currentColor"
          className="text-foreground/60"
        />
        <stop
          offset="100%"
          stopColor="currentColor"
          className="text-foreground/95"
        />
      </linearGradient>
      <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="0"
          dy="0"
          stdDeviation="1.5"
          floodColor="currentColor"
          floodOpacity="0.8"
          className="text-destructive"
        />
      </filter>
      <filter id="black-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="0"
          dy="1"
          stdDeviation="1.5"
          floodColor="currentColor"
          floodOpacity="0.8"
          className="text-foreground"
        />
      </filter>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${bgGradientId})`} />
    <g key={beat} className="animate-in duration-150 fade-in-0 zoom-in-95">
      <text
        x="80"
        y="40"
        textAnchor="middle"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={isTopActive ? "1.5" : "2"}
        paintOrder="stroke fill"
        filter={isTopActive ? "url(#glow-red)" : "url(#black-shadow)"}
        fontSize="16"
        fontWeight="900"
        fontFamily="sans-serif"
        className={
          isTopActive
            ? "stroke-foreground/80 text-destructive"
            : "stroke-foreground/90 text-primary-foreground"
        }
      >
        {phrase.top}
      </text>
      <text
        x="80"
        y="60"
        textAnchor="middle"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={isTopActive ? "2" : "1.5"}
        paintOrder="stroke fill"
        filter={isTopActive ? "url(#black-shadow)" : "url(#glow-red)"}
        fontSize="16"
        fontWeight="900"
        fontFamily="sans-serif"
        className={
          isTopActive
            ? "stroke-foreground/90 text-primary-foreground"
            : "stroke-foreground/80 text-destructive"
        }
      >
        {phrase.bottom}
      </text>
    </g>
  </svg>
);

const renderSleekCaption = (
  beat: number,
  phrase: CaptionPhrase,
  isTopActive: boolean,
  bgGradientId: string
) => (
  <svg viewBox="0 0 160 90" className="size-full">
    <defs>
      <linearGradient id={bgGradientId} x1="0" y1="0" x2="0" y2="1">
        <stop
          offset="0%"
          stopColor="currentColor"
          className="text-foreground/70"
        />
        <stop
          offset="100%"
          stopColor="currentColor"
          className="text-foreground/95"
        />
      </linearGradient>
      <filter id="glow-sleek">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${bgGradientId})`} />
    <g key={beat} className="animate-in duration-150 fade-in-0 zoom-in-95">
      <text
        x="80"
        y="40"
        textAnchor="middle"
        fill="currentColor"
        filter={isTopActive ? "url(#glow-sleek)" : undefined}
        stroke={isTopActive ? "none" : "currentColor"}
        strokeWidth={isTopActive ? "0" : "1.5"}
        paintOrder="stroke fill"
        fontSize="16"
        fontWeight="900"
        fontFamily="sans-serif"
        className={
          isTopActive
            ? "text-primary-foreground"
            : "stroke-foreground/60 text-primary-foreground"
        }
      >
        {phrase.top}
      </text>
      <text
        x="80"
        y="60"
        textAnchor="middle"
        fill="currentColor"
        filter={isTopActive ? undefined : "url(#glow-sleek)"}
        stroke={isTopActive ? "currentColor" : "none"}
        strokeWidth={isTopActive ? "1.5" : "0"}
        paintOrder="stroke fill"
        fontSize="16"
        fontWeight="900"
        fontFamily="sans-serif"
        className={
          isTopActive
            ? "stroke-foreground/60 text-primary-foreground"
            : "text-primary-foreground"
        }
      >
        {phrase.bottom}
      </text>
    </g>
  </svg>
);

const renderKaraokeCaption = (
  beat: number,
  phrase: CaptionPhrase,
  bgGradientId: string
) => {
  const isTopActive = beat % 2 === 0;

  const isBottomActive = beat % 2 === 1;

  const topPillWidth =
    phrase.top.length === 1 ? 22 : phrase.top.length * 11 + 10;

  const topPillX = 80 - topPillWidth / 2;

  const bottomPillWidth =
    phrase.bottom.length === 1 ? 22 : phrase.bottom.length * 11 + 10;

  const bottomPillX = 80 - bottomPillWidth / 2;

  return (
    <svg viewBox="0 0 160 90" className="size-full">
      {renderBackground(bgGradientId)}
      <g key={beat} className="animate-in duration-150 fade-in-0 zoom-in-95">
        {/* Top word pill when top is active */}
        {isTopActive && (
          <rect
            x={topPillX}
            y={25}
            width={topPillWidth}
            height={18}
            rx={4}
            fill="currentColor"
            className="text-chart-2"
          />
        )}
        <text
          x="80"
          y="39"
          textAnchor="middle"
          fill="currentColor"
          stroke={isTopActive ? "none" : "currentColor"}
          strokeWidth={isTopActive ? "0" : "2.5"}
          paintOrder="stroke fill"
          fontSize="16"
          fontWeight="900"
          fontFamily="sans-serif"
          className={
            isTopActive
              ? "text-primary-foreground"
              : "stroke-foreground/90 text-primary-foreground"
          }
        >
          {phrase.top}
        </text>

        {/* Bottom word pill when bottom is active */}
        {isBottomActive && (
          <rect
            x={bottomPillX}
            y={46}
            width={bottomPillWidth}
            height={18}
            rx={4}
            fill="currentColor"
            className="text-chart-2"
          />
        )}
        <text
          x="80"
          y="60"
          textAnchor="middle"
          fill="currentColor"
          stroke={isTopActive ? "currentColor" : "none"}
          strokeWidth={isTopActive ? "2.5" : "0"}
          paintOrder="stroke fill"
          fontSize="16"
          fontWeight="900"
          fontFamily="sans-serif"
          className={
            isTopActive
              ? "stroke-foreground/90 text-primary-foreground"
              : "text-primary-foreground"
          }
        >
          {phrase.bottom}
        </text>
      </g>
    </svg>
  );
};

const renderMajesticCaption = (
  phraseIndex: number,
  phrase: CaptionPhrase,
  bgGradientId: string
) => (
  <svg viewBox="0 0 160 90" className="size-full">
    {renderBackground(bgGradientId)}
    <g
      key={phraseIndex}
      className="animate-in duration-200 fade-in-0 zoom-in-95"
    >
      <text
        x="81.5"
        y="41.5"
        textAnchor="middle"
        fill="currentColor"
        fontSize="16"
        fontWeight="900"
        fontStyle="italic"
        fontFamily="sans-serif"
        className="text-foreground/95"
      >
        {phrase.top}
      </text>
      <text
        x="80"
        y="40"
        textAnchor="middle"
        fill="currentColor"
        fontSize="16"
        fontWeight="900"
        fontStyle="italic"
        fontFamily="sans-serif"
        className="text-primary-foreground"
      >
        {phrase.top}
      </text>
      <text
        x="81.5"
        y="61.5"
        textAnchor="middle"
        fill="currentColor"
        fontSize="16"
        fontWeight="900"
        fontStyle="italic"
        fontFamily="sans-serif"
        className="text-foreground/95"
      >
        {phrase.bottom}
      </text>
      <text
        x="80"
        y="60"
        textAnchor="middle"
        fill="currentColor"
        fontSize="16"
        fontWeight="900"
        fontStyle="italic"
        fontFamily="sans-serif"
        className="text-primary-foreground"
      >
        {phrase.bottom}
      </text>
    </g>
  </svg>
);

const renderBeastCaption = (
  phraseIndex: number,
  phrase: CaptionPhrase,
  bgGradientId: string
) => (
  <svg viewBox="0 0 160 90" className="size-full">
    {renderBackground(bgGradientId)}
    <g
      key={phraseIndex}
      className="animate-in duration-200 fade-in-0 zoom-in-95"
    >
      <text
        x="80"
        y="53"
        textAnchor="middle"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="3"
        paintOrder="stroke fill"
        fontSize="22"
        fontWeight="900"
        fontStyle="italic"
        transform="rotate(-8 80 48)"
        fontFamily="sans-serif"
        className="stroke-foreground/90 text-primary-foreground"
      >
        {phrase.beast}
      </text>
    </g>
  </svg>
);

const renderElegantCaption = (
  phraseIndex: number,
  phrase: CaptionPhrase,
  bgGradientId: string
) => (
  <svg viewBox="0 0 160 90" className="size-full">
    {renderBackground(bgGradientId)}
    <g
      key={phraseIndex}
      className="animate-in duration-200 fade-in-0 zoom-in-95"
    >
      <text
        x="81"
        y="52"
        textAnchor="middle"
        fill="currentColor"
        fontSize="18"
        fontWeight="400"
        fontFamily="serif"
        letterSpacing="3"
        className="text-foreground/90"
      >
        {phrase.single}
      </text>
      <text
        x="80"
        y="51"
        textAnchor="middle"
        fill="currentColor"
        fontSize="18"
        fontWeight="400"
        fontFamily="serif"
        letterSpacing="3"
        className="text-primary-foreground"
      >
        {phrase.single}
      </text>
    </g>
  </svg>
);

const renderPixelCaption = (
  phraseIndex: number,
  phrase: CaptionPhrase,
  bgGradientId: string
) => (
  <svg viewBox="0 0 160 90" className="size-full">
    {renderBackground(bgGradientId)}
    <g
      key={phraseIndex}
      className="animate-in duration-200 fade-in-0 zoom-in-95"
    >
      <text
        x="80"
        y="52"
        textAnchor="middle"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="3"
        paintOrder="stroke fill"
        fontSize="18"
        fontWeight="900"
        fontFamily="monospace"
        className="stroke-foreground/90 text-primary-foreground"
      >
        {phrase.single}
      </text>
    </g>
  </svg>
);

const renderClarityCaption = (
  phraseIndex: number,
  phrase: CaptionPhrase,
  bgGradientId: string
) => (
  <svg viewBox="0 0 160 90" className="size-full">
    {renderBackground(bgGradientId)}
    <g
      key={phraseIndex}
      className="animate-in duration-200 fade-in-0 zoom-in-95"
    >
      <text
        x="81"
        y="51"
        textAnchor="middle"
        fill="currentColor"
        fontSize="16"
        fontWeight="500"
        fontFamily="sans-serif"
        className="text-foreground/80"
      >
        {phrase.clarity}
      </text>
      <text
        x="80"
        y="50"
        textAnchor="middle"
        fill="currentColor"
        fontSize="16"
        fontWeight="500"
        fontFamily="sans-serif"
        className="text-primary-foreground"
      >
        {phrase.clarity}
      </text>
    </g>
  </svg>
);

const renderCaptionPreview = (styleId: string, beat: number) => {
  const phraseIndex = Math.floor(beat / 2);
  const isTopActive = beat % 2 === 0;
  const phrase = CAPTION_PHRASES[phraseIndex] ?? CAPTION_PHRASES[0];
  const bgGradientId = `caption-bg-${styleId}`;

  switch (styleId) {
    case "bold-stroke": {
      return renderBoldStrokeCaption(phraseIndex, phrase, bgGradientId);
    }

    case "red-highlight": {
      return renderRedHighlightCaption(beat, phrase, isTopActive, bgGradientId);
    }

    case "sleek": {
      return renderSleekCaption(beat, phrase, isTopActive, bgGradientId);
    }

    case "karaoke": {
      return renderKaraokeCaption(beat, phrase, bgGradientId);
    }

    case "majestic": {
      return renderMajesticCaption(phraseIndex, phrase, bgGradientId);
    }

    case "beast": {
      return renderBeastCaption(phraseIndex, phrase, bgGradientId);
    }

    case "elegant": {
      return renderElegantCaption(phraseIndex, phrase, bgGradientId);
    }

    case "pixel": {
      return renderPixelCaption(phraseIndex, phrase, bgGradientId);
    }

    case "clarity": {
      return renderClarityCaption(phraseIndex, phrase, bgGradientId);
    }

    default: {
      return null;
    }
  }
};

export const StepFiveCaptionStyle = ({
  selectedCaptionId,
  onSelectCaptionStyle,
}: StepFiveCaptionStyleProps) => {
  const [beat, setBeat] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setBeat((prev) => (prev + 1) % (CAPTION_PHRASES.length * 2));
    }, 650);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Caption Style
          </h1>
          <Badge variant="outline">Step 5 of 8</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose how captions will appear in your video
        </p>
      </div>

      {/* Grid of Caption Styles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {SERIES_CAPTION_STYLES.map((style: SeriesCaptionStyle) => {
          const isSelected = selectedCaptionId === style.id;

          return (
            <Card
              key={style.id}
              size="sm"
              variant={isSelected ? "selected" : "interactive"}
              onClick={() => {
                onSelectCaptionStyle(style.id);
              }}
            >
              <CardContent>
                <div className="flex flex-col gap-2.5">
                  <div className="relative aspect-video w-full overflow-hidden rounded-md">
                    {renderCaptionPreview(style.id, beat)}

                    {isSelected && (
                      <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                        <Check className="size-3" />
                      </div>
                    )}
                  </div>

                  <span className="text-sm font-semibold text-foreground">
                    {style.name}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
