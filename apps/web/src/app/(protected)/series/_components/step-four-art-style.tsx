"use client";

import { SERIES_ART_STYLES } from "@faceless/contracts";
import type { SeriesArtStyle } from "@faceless/contracts";
import { AspectRatio } from "@faceless/ui/components/aspect-ratio";
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

import { PageHeader } from "@/components/page-header";

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
        <PageHeader
          title="Art Style"
          description="Choose the visual style for your video"
          badge={<Badge variant="outline">Step 4 of 8</Badge>}
        >
          <div className="flex items-center gap-2">
            <CarouselPrevious className="static my-auto translate-y-0" />
            <CarouselNext className="static my-auto translate-y-0" />
          </div>
        </PageHeader>

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
                  className="group flex w-full cursor-pointer flex-col gap-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => {
                    handleSelectStyle(style.id);
                  }}
                  type="button"
                >
                  <div
                    className={cn(
                      "w-full overflow-hidden rounded-2xl border-2 bg-muted transition-all",
                      isSelected
                        ? "border-primary"
                        : "border-transparent hover:border-primary/50"
                    )}
                  >
                    <AspectRatio ratio={9 / 16}>
                      <Image
                        alt={style.name}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        fill
                        priority={index < 4}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        src={style.image}
                      />

                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                          <Check className="size-3.5" />
                        </div>
                      )}
                    </AspectRatio>
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
