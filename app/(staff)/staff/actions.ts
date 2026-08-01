"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getCloseIssueRevalidationPaths } from "@/lib/staff/action-policy";
import { getStaffActor } from "@/lib/staff/auth";
import { prismaStaffIssueStore } from "@/lib/staff/prisma-store";
import { createCloseIssueService } from "@/lib/staff/service";
import { createSignOutService } from "@/lib/staff/sign-out";
import type {
  CloseIssueActionResponse,
  CloseIssueActionResult,
  SignOutActionResult,
} from "@/lib/staff/types";
import { closeIssueSchema } from "@/lib/staff/validation";

const closeIssue = createCloseIssueService({
  store: prismaStaffIssueStore,
});

const signOutStaff = createSignOutService({
  signOut: async () =>
    auth.api.signOut({
      headers: await headers(),
    }),
});

/** Signs out the current staff session and returns a typed result for the dialog. */
export async function signOutStaffAction(): Promise<SignOutActionResult> {
  return signOutStaff();
}

/**
 * Reauthorizes and validates an Issue status change before invoking the atomic
 * close service, then revalidates every affected staff view on success.
 */
export async function closeIssueAction(
  _previousState: CloseIssueActionResult,
  formData: FormData,
): Promise<CloseIssueActionResponse> {
  const parsed = closeIssueSchema.safeParse({
    issueId: formData.get("issueId"),
    targetStatus: formData.get("targetStatus"),
  });

  if (!parsed.success) {
    return {
      status: "VALIDATION_ERROR",
      message: "Toiminnon tiedot eivät ole kelvolliset.",
    };
  }

  const authentication = await getStaffActor();

  if (authentication.status === "SESSION_EXPIRED") {
    return {
      status: "SESSION_EXPIRED",
      message: "Istuntosi on vanhentunut. Kirjaudu uudelleen.",
    };
  }

  if (authentication.status === "UNAUTHORIZED") {
    return {
      status: "UNAUTHORIZED",
      message: "Sinulla ei ole oikeutta tähän toimintoon.",
    };
  }

  try {
    const result = await closeIssue({
      issueId: parsed.data.issueId,
      targetStatus: parsed.data.targetStatus,
      actorId: authentication.actor.id,
    });

    if (result.status === "NOT_FOUND") {
      return {
        status: "NOT_FOUND",
        message: "Ilmoitusta ei löytynyt.",
      };
    }

    if (result.status === "ALREADY_CLOSED") {
      return {
        status: "ALREADY_CLOSED",
        message: "Ilmoitus on jo suljettu.",
      };
    }

    for (const path of getCloseIssueRevalidationPaths(result.issueId)) {
      revalidatePath(path);
    }

    return result;
  } catch {
    return {
      status: "SERVER_ERROR",
      message: "Ilmoituksen tilaa ei voitu päivittää. Yritä uudelleen.",
    };
  }
}
