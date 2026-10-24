import type { Files } from "@faceless/storage";
import { FilesError } from "@faceless/storage";
import { isNonEmptyString } from "@faceless/utils";
import type { Authorize, FilesOperation } from "files-sdk/api";

export interface SessionWithUser {
  user: {
    id: string;
    email: string;
    name: string;
  };
  session: {
    id: string;
    userId: string;
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
  "purge",
]);

export interface UserContext {
  user: SessionWithUser["user"];
}

export interface UserPolicyOptions {
  files: Files;
  getSession: (headers: Headers) => Promise<SessionWithUser | null>;
}

export const userPolicy =
  (options: UserPolicyOptions): Authorize<UserContext> =>
  async ({ operation, key, req }) => {
    const session = await options.getSession(req.headers);

    if (!session) {
      throw new FilesError(
        "Unauthorized",
        "You must be signed in to access files."
      );
    }

    if (!ALLOWED_OPERATIONS.has(operation)) {
      throw new FilesError("ReadOnly", `${operation} is not allowed`);
    }

    const keyPrefix = `users/${session.user.id}/`;

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
      },
    };
  };
