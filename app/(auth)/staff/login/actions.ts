"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { staffLoginSchema } from "@/lib/staff/validation";

export type StaffLoginActionState = {
  status: "IDLE" | "VALIDATION_ERROR" | "INVALID_CREDENTIALS";
  message?: string;
  fieldErrors?: {
    username?: string[];
    password?: string[];
  };
};

export async function signInStaffAction(
  _previousState: StaffLoginActionState,
  formData: FormData,
): Promise<StaffLoginActionState> {
  const parsed = staffLoginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      status: "VALIDATION_ERROR",
      message: "Tarkista kirjautumistiedot.",
      fieldErrors,
    };
  }

  let signedIn = false;

  try {
    await auth.api.signInUsername({
      body: parsed.data,
    });
    signedIn = true;
  } catch {
    return {
      status: "INVALID_CREDENTIALS",
      message: "Käyttäjätunnus tai salasana on väärä.",
    };
  }

  if (signedIn) {
    redirect("/staff");
  }

  return {
    status: "INVALID_CREDENTIALS",
    message: "Kirjautuminen epäonnistui.",
  };
}
