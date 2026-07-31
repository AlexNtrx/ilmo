import { z } from "zod";

import { PublicReportError } from "@/lib/reporting/errors";

const publicReportPayloadSchema = z
  .object({
    categoryIds: z
      .array(z.number().int().positive())
      .min(1, "Valitse vähintään yksi vaihtoehto."),
    description: z
      .string()
      .max(200, "Lisätiedot voivat olla enintään 200 merkkiä.")
      .nullable()
      .optional(),
  })
  .strict();

export type NormalizedPublicReportPayload = {
  categoryIds: number[];
  description: string | null;
};

export function parsePublicReportPayload(
  input: unknown,
): NormalizedPublicReportPayload {
  const result = publicReportPayloadSchema.safeParse(input);

  if (!result.success) {
    const categoryIssue = result.error.issues.find((issue) =>
      issue.path.includes("categoryIds"),
    );
    const descriptionIssue = result.error.issues.find((issue) =>
      issue.path.includes("description"),
    );

    throw new PublicReportError(
      "VALIDATION_ERROR",
      "Tarkista ilmoituksen tiedot.",
      {
        categoryIds: categoryIssue
          ? "Valitse vähintään yksi ilmoitustyyppi."
          : undefined,
        description: descriptionIssue
          ? "Lisätiedot voivat olla enintään 200 merkkiä."
          : undefined,
      },
    );
  }

  const description = result.data.description?.trim() || null;

  return {
    categoryIds: [...new Set(result.data.categoryIds)].sort(
      (left, right) => left - right,
    ),
    description,
  };
}
