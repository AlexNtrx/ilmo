import type { SignOutActionResult } from "@/lib/staff/types";

/** Wraps Better Auth sign-out failures in the typed result used by the client dialog. */
export function createSignOutService({
  signOut,
}: {
  signOut: () => Promise<unknown>;
}) {
  return async (): Promise<SignOutActionResult> => {
    try {
      await signOut();
      return { status: "SUCCESS" };
    } catch {
      return {
        status: "SERVER_ERROR",
        message: "Uloskirjautuminen epäonnistui. Yritä uudelleen.",
      };
    }
  };
}
