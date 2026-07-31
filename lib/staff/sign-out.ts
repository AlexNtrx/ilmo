import type { SignOutActionResult } from "@/lib/staff/types";

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
