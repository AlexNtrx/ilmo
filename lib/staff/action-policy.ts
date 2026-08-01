import type {
  CloseIssueActionResult,
  SignOutActionResult,
} from "@/lib/staff/types";

/** Returns every staff route whose Server Component data changes after closure. */
export function getCloseIssueRevalidationPaths(issueId: number) {
  return ["/staff", `/staff/issues/${issueId}`] as const;
}

export function isSuccessfulCloseAction(
  result: CloseIssueActionResult,
): result is Extract<CloseIssueActionResult, { status: "SUCCESS" }> {
  return result.status === "SUCCESS";
}

/** Returns success feedback only for a confirmed Issue-closing result. */
export function getCloseIssueSuccessMessage(
  result: CloseIssueActionResult,
): string | null {
  if (!isSuccessfulCloseAction(result)) {
    return null;
  }

  return result.targetStatus === "RESOLVED"
    ? "Ongelma on merkitty ratkaistuksi."
    : "Ilmoitus on merkitty virheelliseksi.";
}

/** Returns logout feedback only after Better Auth confirms sign-out. */
export function getSignOutSuccessMessage(
  result: SignOutActionResult,
): string | null {
  return result.status === "SUCCESS" ? "Olet kirjautunut ulos." : null;
}
