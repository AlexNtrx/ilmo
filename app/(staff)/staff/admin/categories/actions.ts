"use server";

import { revalidatePath } from "next/cache";

import { createCategoryService } from "@/lib/admin/category-service";
import { prismaCategoryStore } from "@/lib/admin/prisma-store";
import type { AdminActionResult } from "@/lib/admin/types";
import {
  categoryActiveSchema,
  categoryDeleteSchema,
  categoryMoveSchema,
  createCategorySchema,
  updateCategorySchema,
} from "@/lib/admin/validation";
import { getAdminActor } from "@/lib/staff/auth";

const categoryService = createCategoryService(prismaCategoryStore);

async function authorize(): Promise<AdminActionResult | null> {
  const authentication = await getAdminActor();
  if (authentication.status === "SESSION_EXPIRED") {
    return {
      status: "SESSION_EXPIRED",
      message: "Istuntosi on vanhentunut. Kirjaudu uudelleen.",
    };
  }
  if (authentication.status === "UNAUTHORIZED") {
    return {
      status: "UNAUTHORIZED",
      message: "Sinulla ei ole oikeutta hallita luokkia.",
    };
  }
  return null;
}

function refreshCategoryViews() {
  revalidatePath("/staff", "layout");
  revalidatePath("/report/[publicCode]", "page");
}

export async function createCategoryAction(
  input: unknown,
): Promise<AdminActionResult> {
  const authorization = await authorize();
  if (authorization) return authorization;
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { status: "VALIDATION_ERROR", message: "Tarkista luokan tiedot." };
  }
  try {
    await categoryService.create(parsed.data);
    refreshCategoryViews();
    return { status: "SUCCESS", message: "Luokka on luotu." };
  } catch {
    return { status: "SERVER_ERROR", message: "Luokkaa ei voitu luoda." };
  }
}

export async function updateCategoryAction(
  input: unknown,
): Promise<AdminActionResult> {
  const authorization = await authorize();
  if (authorization) return authorization;
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { status: "VALIDATION_ERROR", message: "Tarkista luokan tiedot." };
  }
  const { id, ...data } = parsed.data;
  try {
    const result = await categoryService.update(id, data);
    if (result.status === "NOT_FOUND") {
      return { status: "NOT_FOUND", message: "Luokkaa ei löytynyt." };
    }
    refreshCategoryViews();
    return { status: "SUCCESS", message: "Luokan tiedot on tallennettu." };
  } catch {
    return { status: "SERVER_ERROR", message: "Luokkaa ei voitu tallentaa." };
  }
}

export async function setCategoryActiveAction(
  input: unknown,
): Promise<AdminActionResult> {
  const authorization = await authorize();
  if (authorization) return authorization;
  const parsed = categoryActiveSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "VALIDATION_ERROR", message: "Toiminto ei ole kelvollinen." };
  }
  try {
    const result = await categoryService.setActive(parsed.data.id, parsed.data.isActive);
    if (result.status === "NOT_FOUND") {
      return { status: "NOT_FOUND", message: "Luokkaa ei löytynyt." };
    }
    refreshCategoryViews();
    return {
      status: "SUCCESS",
      message: parsed.data.isActive ? "Luokka on aktivoitu." : "Luokka on poistettu käytöstä.",
    };
  } catch {
    return { status: "SERVER_ERROR", message: "Luokan tilaa ei voitu muuttaa." };
  }
}

export async function moveCategoryAction(
  input: unknown,
): Promise<AdminActionResult> {
  const authorization = await authorize();
  if (authorization) return authorization;
  const parsed = categoryMoveSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "VALIDATION_ERROR", message: "Siirto ei ole kelvollinen." };
  }
  try {
    const result = await categoryService.move(parsed.data.id, parsed.data.direction);
    if (result.status === "NOT_FOUND") {
      return { status: "NOT_FOUND", message: "Luokkaa ei löytynyt." };
    }
    if (result.status === "UNCHANGED") {
      return { status: "SUCCESS", message: "Luokka on jo listan reunassa." };
    }
    refreshCategoryViews();
    return { status: "SUCCESS", message: "Luokkien järjestys on päivitetty." };
  } catch {
    return { status: "SERVER_ERROR", message: "Järjestystä ei voitu muuttaa." };
  }
}

export async function deleteCategoryAction(
  input: unknown,
): Promise<AdminActionResult> {
  const authorization = await authorize();
  if (authorization) return authorization;
  const parsed = categoryDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "VALIDATION_ERROR", message: "Toiminto ei ole kelvollinen." };
  }
  try {
    const result = await categoryService.delete(parsed.data.id);
    if (result.status === "NOT_FOUND") {
      return { status: "NOT_FOUND", message: "Luokkaa ei löytynyt." };
    }
    if (result.status === "REFERENCED") {
      return {
        status: "REFERENCED",
        message: "Luokkaa käytetään ilmoituksissa. Poista se käytöstä tietojen säilyttämiseksi.",
      };
    }
    refreshCategoryViews();
    return { status: "SUCCESS", message: "Luokka on poistettu." };
  } catch {
    return { status: "SERVER_ERROR", message: "Luokkaa ei voitu poistaa." };
  }
}
