import { z } from "zod";

export const staffLoginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Syötä käyttäjätunnus.")
    .max(30, "Käyttäjätunnus on liian pitkä.")
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Käyttäjätunnuksessa on virheellisiä merkkejä.",
    ),
  password: z.string().min(1, "Syötä salasana."),
});

export const closeIssueSchema = z.object({
  issueId: z.coerce.number().int().positive(),
  targetStatus: z.enum(["RESOLVED", "INVALID"]),
});
