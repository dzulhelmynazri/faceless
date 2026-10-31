"use client";

import {
  EPISODE_MAX_TITLE_LENGTH,
  updateEpisodeDetailsInputSchema,
} from "@faceless/contracts/series";
import { Button } from "@faceless/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@faceless/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@faceless/ui/components/field";
import { Input } from "@faceless/ui/components/input";
import { Spinner } from "@faceless/ui/components/spinner";
import { Textarea } from "@faceless/ui/components/textarea";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

import { useEpisodeStudioContext } from "../_context/episode-studio-context";

const episodeDetailsFormSchema = updateEpisodeDetailsInputSchema.omit({
  episodeId: true,
});

export const EpisodeMetadataCard = () => {
  const { episode } = useEpisodeStudioContext();
  const episodeId = episode.id;
  const queryClient = useQueryClient();

  const updateMutation = useMutation(
    trpc.series.updateEpisodeDetails.mutationOptions({
      onSuccess: () => {
        toast.success("Episode title and description saved!");
        void queryClient.invalidateQueries(
          trpc.series.getEpisodeById.queryFilter({ episodeId })
        );
      },
      onError: () => {
        toast.error("Failed to save episode details");
      },
    })
  );

  const form = useForm({
    defaultValues: {
      description: episode.description,
      title: episode.title,
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        description: value.description,
        episodeId,
        title: value.title,
      });
    },
    validators: {
      onChange: episodeDetailsFormSchema,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Title & Description</CardTitle>
        <CardDescription>
          Post details for manual and auto publishing.
        </CardDescription>
      </CardHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <CardContent>
          <FieldGroup>
            {/* Title Field with TanStack Form */}
            <form.Field name="title">
              {(field) => {
                const isInvalid = field.state.meta.errors.length > 0;
                const valueLength = field.state.value.length;
                const isTooLong = valueLength > EPISODE_MAX_TITLE_LENGTH;

                return (
                  <Field data-invalid={isInvalid}>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor={field.name}>Video Title</FieldLabel>
                      <span
                        className={`text-xs ${
                          isTooLong
                            ? "font-semibold text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {valueLength} / {EPISODE_MAX_TITLE_LENGTH}
                      </span>
                    </div>

                    <Input
                      aria-invalid={isInvalid}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                      }}
                      placeholder="Enter YouTube Short title..."
                      value={field.state.value}
                    />
                    <FieldDescription>
                      Only supported by YouTube.
                    </FieldDescription>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            {/* Description Field with TanStack Form */}
            <form.Field name="description">
              {(field) => {
                const isInvalid = field.state.meta.errors.length > 0;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Description & Hashtags
                    </FieldLabel>

                    <Textarea
                      aria-invalid={isInvalid}
                      className="min-h-24"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                      }}
                      placeholder="Add video description and #hashtags..."
                      value={field.state.value}
                    />
                    <FieldDescription>
                      Supported by TikTok, YouTube, Instagram.
                    </FieldDescription>

                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <form.Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isDirty,
              state.isSubmitting,
            ]}
          >
            {([canSubmit, isDirty, isSubmitting]) => (
              <Button
                className="mt-4 w-full"
                disabled={
                  !canSubmit ||
                  !isDirty ||
                  isSubmitting ||
                  updateMutation.isPending
                }
                type="submit"
                variant="default"
              >
                {isSubmitting || updateMutation.isPending ? (
                  <Spinner data-icon="inline-start" />
                ) : null}
                <span>Save Changes</span>
              </Button>
            )}
          </form.Subscribe>
        </CardFooter>
      </form>
    </Card>
  );
};
