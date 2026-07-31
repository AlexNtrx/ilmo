import { z } from "zod";

const idSchema = z.coerce.number().int().positive();
const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_.]+$/);
const nameSchema = z.string().trim().min(1).max(100);
const roleSchema = z.enum(["admin", "staff"]);
const passwordSchema = z.string().min(8).max(128);

const categoryFields = {
  nameFi: z.string().trim().min(1).max(100),
  isUrgent: z.boolean(),
  mergeMode: z.enum(["MERGE_OPEN", "ALWAYS_CREATE"]),
  requiresDescription: z.boolean(),
  isActive: z.boolean(),
};

export const createCategorySchema = z.object(categoryFields);
export const updateCategorySchema = z.object({
  id: idSchema,
  ...categoryFields,
});
export const categoryActiveSchema = z.object({
  id: idSchema,
  isActive: z.boolean(),
});
export const categoryMoveSchema = z.object({
  id: idSchema,
  direction: z.enum(["UP", "DOWN"]),
});
export const categoryDeleteSchema = z.object({ id: idSchema });

export const createUserSchema = z.object({
  username: usernameSchema,
  name: nameSchema,
  password: passwordSchema,
  role: roleSchema.optional().default("staff"),
});
export const updateUserProfileSchema = z.object({
  userId: z.string().min(1),
  username: usernameSchema,
  name: nameSchema,
});
export const changeUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: roleSchema,
});
export const resetUserPasswordSchema = z.object({
  userId: z.string().min(1),
  password: passwordSchema,
});
export const deleteUserSchema = z.object({ userId: z.string().min(1) });
