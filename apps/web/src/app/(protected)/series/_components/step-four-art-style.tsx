"use client";

import { SERIES_ART_STYLES } from "@faceless/contracts";
import type { SeriesArtStyle } from "@faceless/contracts";
import { Badge } from "@faceless/ui/components/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@faceless/ui/components/carousel";
import { cn } from "@faceless/ui/lib/utils";
import { Check } from "lucide-react";
import Image from "next/image";

import { useSeriesWizard } from "../_context/series-wizard-context";

export const StepFourArtStyle = () => {
  const { selectedStyleId, handleSelectStyle } = useSeriesWizard();

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <div className="flex flex-col gap-6">
        {/* Header with Carousel Controls */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Art Style
              </h1>
              <Badge variant="outline">Step 4 of 8</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose the visual style for your video
            </p>
          </div>

          <div className="flex items-center gap-2">
            <CarouselPrevious className="static my-auto translate-y-0" />
            <CarouselNext className="static my-auto translate-y-0" />
          </div>
        </div>

        {/* Carousel of Art Styles */}
        <CarouselContent>
          {SERIES_ART_STYLES.map((style: SeriesArtStyle, index: number) => {
            const isSelected = selectedStyleId === style.id;

            return (
              <CarouselItem
                key={style.id}
                className="basis-1/2 sm:basis-1/3 md:basis-1/4"
              >
                <button
                  type="button"
                  onClick={() => {
                    handleSelectStyle(style.id);
                  }}
                  className="group flex w-full cursor-pointer flex-col gap-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div
                    className={cn(
                      "relative aspect-[9/16] w-full overflow-hidden rounded-2xl border-2 bg-muted transition-all",
                      isSelected
                        ? "border-primary"
                        : "border-transparent hover:border-primary/50"
                    )}
                  >
                    <Image
                      src={style.image}
                      alt={style.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      priority={index < 4}
                    />

                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                        <Check className="size-3.5" />
                      </div>
                    )}
                  </div>

                  <span className="text-sm font-semibold text-foreground">
                    {style.name}
                  </span>
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </div>
    </Carousel>
  );
};
