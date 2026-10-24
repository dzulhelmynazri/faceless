import { z } from "zod";

const SLUG_REGEX = /^[a-z0-9-]+$/u;

export const ORG_ROLES = ["owner", "admin", "member"] as const;
export const orgRoleSchema = z.enum(ORG_ROLES);

export type OrgRole = z.infer<typeof orgRoleSchema>;

export const INVITATION_ROLES = ["admin", "member"] as const;
export const invitationRoleSchema = z.enum(INVITATION_ROLES);

export type InvitationRole = z.infer<typeof invitationRoleSchema>;

export const INVITATION_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "canceled",
] as const;

export const invitationStatusSchema = z.enum(INVITATION_STATUSES);

export type InvitationStatus = z.infer<typeof invitationStatusSchema>;

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50)
    .regex(
      SLUG_REGEX,
      "Slug must only contain lowercase letters, numbers, and hyphens"
    ),
  logo: z.url().optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const inviteMemberSchema = z.object({
  email: z.email("Please provide a valid email address"),
  role: invitationRoleSchema.default("member"),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const cancelInvitationSchema = z.object({
  invitationId: z.string().min(1, "Invitation ID is required"),
});

export type CancelInvitationInput = z.infer<typeof cancelInvitationSchema>;

export const removeMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
});

export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;

export const updateMemberRoleSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  role: invitationRoleSchema,
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
