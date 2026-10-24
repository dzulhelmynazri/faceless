import type { Files } from "@faceless/storage";
import { FilesError } from "@faceless/storage";
import { isNonEmptyString } from "@faceless/utils";
import type { Authorize, FilesOperation } from "files-sdk/api";

export interface SessionWithOrg {
  user: {
    id: string;
    email: string;
    name: string;
  };
  session: {
    id: string;
    userId: string;
    activeOrganizationId?: string | null;
  };
}

export const ALLOWED_OPERATIONS = new Set<FilesOperation>([
  "capabilities",
  "list",
  "search",
  "head",
  "exists",
  "download",
  "url",
  "upload",
  "delete",
  "copy",
  "move",
  "signedUploadUrl",
  "trashed",
  "restoreTrashed",
  "versions",
  "restoreVersion",
]);

export interface TenantContext {
  user: SessionWithOrg["user"];
  organizationId: string;
}

export interface TenantPolicyOptions {
  files: Files;
  getSession: (headers: Headers) => Promise<SessionWithOrg | null>;
  getRole?: (userId: string, orgId: string) => Promise<string | null>;
}

export const tenantPolicy =
  (options: TenantPolicyOptions): Authorize<TenantContext> =>
  async ({ operation, key, req }) => {
    const session = await options.getSession(req.headers);

    if (!session) {
      throw new FilesError(
        "Unauthorized",
        "You must be signed in to access files."
      );
    }

    const orgId = session.session.activeOrganizationId;

    if (!isNonEmptyString(orgId)) {
      throw new FilesError(
        "Unauthorized",
        "An active organization is required to access files."
      );
    }

    // Role-based authorization for destructive / permanent purge operation
    if (operation === "purge") {
      const role = options.getRole
        ? await options.getRole(session.user.id, orgId)
        : null;

      const isAdmin = role === "owner" || role === "admin";

      if (!isAdmin) {
        throw new FilesError(
          "ReadOnly",
          "Only organization owners or admins can permanently purge trashed files"
        );
      }
    } else if (!ALLOWED_OPERATIONS.has(operation)) {
      throw new FilesError("ReadOnly", `${operation} is not allowed`);
    }

    const keyPrefix = `orgs/${orgId}/`;

    // Refuse to restore over a file that exists again (from Files SDK restore guide)
    if (
      operation === "restoreTrashed" &&
      isNonEmptyString(key) &&
      (await options.files.exists(`${keyPrefix}${key}`))
    ) {
      throw new FilesError("Conflict", `${key} already exists`);
    }

    // Allow inline disposition for URL operations so browser <img> tags can render previews
    // (by default, Files SDK forces Content-Disposition: attachment as an XSS guard)
    const disposition = operation === "url" ? "inline" : undefined;

    return {
      keyPrefix,
      maxExpiresIn: 300,
      ...(disposition !== undefined && { disposition }),
      context: {
        user: session.user,
        organizationId: orgId,
      },
    };
  };
