"use client";

import { SERIES_EFFECTS } from "@faceless/contracts";
import type { SeriesEffect } from "@faceless/contracts";
import { Badge } from "@faceless/ui/components/badge";
import { Card, CardContent } from "@faceless/ui/components/card";
import { Switch } from "@faceless/ui/components/switch";

import { useSeriesWizard } from "../_context/series-wizard-context";

export const StepSixEffects = () => {
  const { glitchEffect, handleToggleGlitchEffect } = useSeriesWizard();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Effects
          </h1>
          <Badge variant="outline">Step 6 of 8</Badge>
          <span className="text-xs text-muted-foreground">Optional</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Add visual effects to make your videos more engaging and eye-catching.
        </p>
      </div>

      {/* Effects list */}
      <div className="flex flex-col gap-3">
        {SERIES_EFFECTS.map((effect: SeriesEffect) => (
          <Card key={effect.id}>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {effect.name}
                    </span>
                    {effect.isNew === true && (
                      <Badge variant="secondary">NEW</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {effect.description}
                  </p>
                </div>

                <Switch
                  checked={glitchEffect}
                  onCheckedChange={handleToggleGlitchEffect}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
