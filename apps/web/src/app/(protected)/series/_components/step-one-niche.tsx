"use client";

import { SERIES_PRESETS } from "@faceless/contracts";
import type { SeriesPreset } from "@faceless/contracts";
import { Badge } from "@faceless/ui/components/badge";
import { Card, CardHeader, CardTitle } from "@faceless/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@faceless/ui/components/field";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@faceless/ui/components/tabs";
import { Textarea } from "@faceless/ui/components/textarea";
import { Check, Layers, Paintbrush } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import * as React from "react";

const NICHE_MAX_LENGTH = 5000;
const SCRIPT_MAX_LENGTH = 2000;

const NICHE_TABS = ["presets", "custom"] as const;

const nicheTabParser = parseAsStringLiteral(NICHE_TABS).withDefault("presets");

interface StepOneNicheProps {
  selectedPresetId: string;
  customNiche: string;
  customScript: string;
  onSelectPreset: (id: string) => void;
  onChangeNiche: (value: string) => void;
  onChangeScript: (value: string) => void;
}

export const StepOneNiche = ({
  selectedPresetId,
  customNiche,
  customScript,
  onSelectPreset,
  onChangeNiche,
  onChangeScript,
}: StepOneNicheProps) => {
  const [tab, setTab] = useQueryState("tab", nicheTabParser);

  const handleTabChange = React.useCallback(
    (value: string | null) => {
      if (value === "presets" || value === "custom") {
        void setTab(value);
      }
    },
    [setTab]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Choose your niche
          </h1>
          <Badge variant="outline">Step 1 of 8</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Select a preset or describe your own niche
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList variant="line">
          <TabsTrigger value="presets">
            <Layers data-icon="inline-start" />
            Presets
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Paintbrush data-icon="inline-start" />
            Custom
          </TabsTrigger>
        </TabsList>

        {/* Presets tab content */}
        <TabsContent value="presets" className="mt-4">
          <div className="flex flex-col gap-3">
            {SERIES_PRESETS.map((preset: SeriesPreset) => {
              const isSelected = selectedPresetId === preset.id;

              return (
                <Card
                  key={preset.id}
                  className="relative"
                  variant={isSelected ? "selected" : "interactive"}
                  onClick={() => {
                    onSelectPreset(preset.id);
                  }}
                >
                  <CardHeader>
                    <CardTitle>{preset.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {preset.description}
                    </p>
                  </CardHeader>

                  {isSelected && (
                    <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                      <Check className="size-3" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Custom tab content */}
        <TabsContent value="custom" className="mt-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="custom-niche">Niche</FieldLabel>
              <Textarea
                id="custom-niche"
                maxLength={NICHE_MAX_LENGTH}
                rows={7}
                value={customNiche}
                onChange={(event) => {
                  onChangeNiche(event.target.value);
                }}
              />
              <div className="flex items-center justify-between">
                <FieldDescription>Describe your topic</FieldDescription>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {customNiche.length}/{NICHE_MAX_LENGTH}
                </span>
              </div>
            </Field>

            <Field>
              <div className="flex items-center gap-2">
                <FieldLabel htmlFor="custom-script">Example script</FieldLabel>
                <Badge variant="secondary">Optional</Badge>
              </div>
              <Textarea
                id="custom-script"
                maxLength={SCRIPT_MAX_LENGTH}
                rows={7}
                value={customScript}
                onChange={(event) => {
                  onChangeScript(event.target.value);
                }}
              />
              <div className="flex items-center justify-between">
                <FieldDescription>
                  Sets the writing style only. Video topics come from your niche
                  above
                </FieldDescription>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {customScript.length}/{SCRIPT_MAX_LENGTH}
                </span>
              </div>
            </Field>
          </FieldGroup>
        </TabsContent>
      </Tabs>
    </div>
  );
};
