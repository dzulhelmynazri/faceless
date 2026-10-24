import { isNonEmptyString } from "@faceless/utils";
import { useForm } from "@tanstack/react-form";
import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  Surface,
  TextField,
  useToast,
} from "heroui-native";
import { useRef } from "react";
import type { TextInput } from "react-native";
import { Text, View } from "react-native";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .pipe(z.email("Enter a valid email address")),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Use at least 8 characters"),
});

type FormErrorInput =
  | string
  | Error
  | { message?: string }
  | (string | Error | { message?: string })[]
  | undefined;

const extractError = (error: FormErrorInput): string | null => {
  if (isNonEmptyString(error)) {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (Array.isArray(error)) {
    for (const issue of error) {
      const message = extractError(issue);

      if (isNonEmptyString(message)) {
        return message;
      }
    }
  }

  return null;
};

export const SignUp = () => {
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
    onSubmit: async ({ value, formApi }) => {
      await authClient.signUp.email(
        {
          email: value.email.trim(),
          name: value.name.trim(),
          password: value.password,
        },
        {
          onError(error) {
            toast.show({
              label: error.error?.message ?? "Failed to sign up",
              variant: "danger",
            });
          },
          onSuccess() {
            formApi.reset();
            toast.show({
              label: "Account created successfully",
              variant: "success",
            });
            void queryClient.refetchQueries();
          },
        }
      );
    },
    validators: {
      onSubmit: signUpSchema,
    },
  });

  return (
    <Surface variant="secondary" className="rounded-lg p-4">
      <Text className="mb-4 font-medium text-foreground">Create Account</Text>

      <form.Subscribe
        selector={(state) => ({
          isSubmitting: state.isSubmitting,
          validationError: extractError(state.errorMap.onSubmit),
        })}
      >
        {({ isSubmitting, validationError }) => {
          const formError = validationError;
          const hasError = isNonEmptyString(formError);

          return (
            <>
              <FieldError isInvalid={hasError} className="mb-3">
                {formError}
              </FieldError>

              <View className="gap-3">
                <form.Field name="name">
                  {(field) => (
                    <TextField>
                      <Label>Name</Label>
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChangeText={field.handleChange}
                        placeholder="John Doe"
                        autoComplete="name"
                        textContentType="name"
                        returnKeyType="next"
                        submitBehavior="submit"
                        onSubmitEditing={() => {
                          emailInputRef.current?.focus();
                        }}
                      />
                    </TextField>
                  )}
                </form.Field>

                <form.Field name="email">
                  {(field) => (
                    <TextField>
                      <Label>Email</Label>
                      <Input
                        ref={emailInputRef}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChangeText={field.handleChange}
                        placeholder="email@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        textContentType="emailAddress"
                        returnKeyType="next"
                        submitBehavior="submit"
                        onSubmitEditing={() => {
                          passwordInputRef.current?.focus();
                        }}
                      />
                    </TextField>
                  )}
                </form.Field>

                <form.Field name="password">
                  {(field) => (
                    <TextField>
                      <Label>Password</Label>
                      <Input
                        ref={passwordInputRef}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChangeText={field.handleChange}
                        placeholder="••••••••"
                        secureTextEntry
                        autoComplete="new-password"
                        textContentType="newPassword"
                        returnKeyType="go"
                        onSubmitEditing={() => {
                          void form.handleSubmit();
                        }}
                      />
                    </TextField>
                  )}
                </form.Field>

                <Button
                  onPress={() => {
                    void form.handleSubmit();
                  }}
                  isDisabled={isSubmitting}
                  className="mt-1"
                >
                  {isSubmitting ? (
                    <Spinner size="sm" color="default" />
                  ) : (
                    <Button.Label>Create Account</Button.Label>
                  )}
                </Button>
              </View>
            </>
          );
        }}
      </form.Subscribe>
    </Surface>
  );
};
