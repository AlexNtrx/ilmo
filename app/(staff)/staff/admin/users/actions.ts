"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { createBetterAuthUserAdmin } from "@/lib/admin/better-auth-user-admin";
import { prismaUserStore } from "@/lib/admin/prisma-store";
import type { AdminActionResult } from "@/lib/admin/types";
import { createUserService } from "@/lib/admin/user-service";
import {
  changeUserRoleSchema,
  createUserSchema,
  deleteUserSchema,
  resetUserPasswordSchema,
  updateUserProfileSchema,
} from "@/lib/admin/validation";
import { getAdminActor } from "@/lib/staff/auth";

async function runtime() {
  const authentication = await getAdminActor();
  if (authentication.status !== "AUTHENTICATED") {
    return { authentication, service: null };
  }
  const requestHeaders = await headers();
  return {
    authentication,
    service: createUserService({
      store: prismaUserStore,
      userAdmin: createBetterAuthUserAdmin(requestHeaders),
      createInternalEmail: () => `${randomUUID()}@users.ilmo.invalid`,
    }),
  };
}

function denied(status: "SESSION_EXPIRED" | "UNAUTHORIZED"): AdminActionResult {
  return status === "SESSION_EXPIRED"
    ? { status, message: "Istuntosi on vanhentunut. Kirjaudu uudelleen." }
    : { status, message: "Sinulla ei ole oikeutta hallita käyttäjiä." };
}

function refreshUsers() {
  revalidatePath("/staff/admin/users");
}

export async function createUserAction(input: unknown): Promise<AdminActionResult> {
  const { authentication, service } = await runtime();
  if (!service) return denied(authentication.status);
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "VALIDATION_ERROR", message: "Tarkista käyttäjän tiedot." };
  }
  try {
    await service.create(parsed.data);
    refreshUsers();
    return { status: "SUCCESS", message: "Käyttäjä on luotu." };
  } catch {
    return { status: "SERVER_ERROR", message: "Käyttäjää ei voitu luoda. Tarkista käyttäjätunnus." };
  }
}

export async function updateUserProfileAction(input: unknown): Promise<AdminActionResult> {
  const { authentication, service } = await runtime();
  if (!service) return denied(authentication.status);
  const parsed = updateUserProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "VALIDATION_ERROR", message: "Tarkista käyttäjän tiedot." };
  }
  try {
    const result = await service.updateProfile(parsed.data);
    if (result.status === "NOT_FOUND") {
      return { status: "NOT_FOUND", message: "Käyttäjää ei löytynyt." };
    }
    refreshUsers();
    return { status: "SUCCESS", message: "Käyttäjän tiedot on tallennettu." };
  } catch {
    return { status: "SERVER_ERROR", message: "Käyttäjän tietoja ei voitu tallentaa." };
  }
}

export async function changeUserRoleAction(input: unknown): Promise<AdminActionResult> {
  const { authentication, service } = await runtime();
  if (!service) return denied(authentication.status);
  const parsed = changeUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "VALIDATION_ERROR", message: "Valitse kelvollinen rooli." };
  }
  try {
    const result = await service.changeRole(parsed.data);
    if (result.status === "NOT_FOUND") {
      return { status: "NOT_FOUND", message: "Käyttäjää ei löytynyt." };
    }
    if (result.status === "LAST_ADMIN") {
      return { status: "LAST_ADMIN", message: "Viimeisen ylläpitäjän roolia ei voi muuttaa." };
    }
    refreshUsers();
    return { status: "SUCCESS", message: "Käyttäjän rooli on päivitetty." };
  } catch {
    return { status: "SERVER_ERROR", message: "Käyttäjän roolia ei voitu muuttaa." };
  }
}

export async function resetUserPasswordAction(input: unknown): Promise<AdminActionResult> {
  const { authentication, service } = await runtime();
  if (!service) return denied(authentication.status);
  const parsed = resetUserPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "VALIDATION_ERROR", message: "Salasanan tulee olla 8–128 merkkiä." };
  }
  try {
    const result = await service.resetPassword({
      actorId: authentication.actor.id,
      ...parsed.data,
    });
    if (result.status === "NOT_FOUND") {
      return { status: "NOT_FOUND", message: "Käyttäjää ei löytynyt." };
    }
    if (result.status === "PARTIAL_FAILURE") {
      return {
        status: "PARTIAL_FAILURE",
        message: "Salasana vaihdettiin, mutta kaikkia istuntoja ei voitu sulkea. Yritä istuntojen sulkemista uudelleen.",
      };
    }
    if (result.status === "SELF_SESSION_REVOKED") {
      return {
        status: "SELF_SESSION_REVOKED",
        message: "Salasanasi on vaihdettu. Kirjaudu uudelleen.",
      };
    }
    refreshUsers();
    return { status: "SUCCESS", message: "Salasana on vaihdettu ja käyttäjän istunnot on suljettu." };
  } catch {
    return { status: "SERVER_ERROR", message: "Salasanaa ei voitu vaihtaa." };
  }
}

export async function deleteUserAction(input: unknown): Promise<AdminActionResult> {
  const { authentication, service } = await runtime();
  if (!service) return denied(authentication.status);
  const parsed = deleteUserSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "VALIDATION_ERROR", message: "Toiminto ei ole kelvollinen." };
  }
  try {
    const result = await service.delete({
      actorId: authentication.actor.id,
      ...parsed.data,
    });
    if (result.status === "SELF_DELETE") {
      return { status: "SELF_DELETE", message: "Et voi poistaa omaa käyttäjätiliäsi." };
    }
    if (result.status === "LAST_ADMIN") {
      return { status: "LAST_ADMIN", message: "Viimeistä ylläpitäjää ei voi poistaa." };
    }
    if (result.status === "NOT_FOUND") {
      return { status: "NOT_FOUND", message: "Käyttäjää ei löytynyt." };
    }
    refreshUsers();
    return { status: "SUCCESS", message: "Käyttäjä on poistettu." };
  } catch {
    return { status: "SERVER_ERROR", message: "Käyttäjää ei voitu poistaa." };
  }
}
