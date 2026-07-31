import type { CategoryDirection, ManagedCategory } from "@/lib/admin/types";

export type CategoryWriteInput = Omit<
  ManagedCategory,
  "id" | "sortOrder" | "issueCount"
>;

export type CategoryStore = {
  create(input: CategoryWriteInput): Promise<void>;
  update(id: number, input: CategoryWriteInput): Promise<boolean>;
  setActive(id: number, isActive: boolean): Promise<boolean>;
  move(id: number, direction: CategoryDirection): Promise<"MOVED" | "UNCHANGED" | "NOT_FOUND">;
  findIssueCount(id: number): Promise<number | null>;
  delete(id: number): Promise<boolean>;
  isForeignKeyError(error: unknown): boolean;
};

export function createCategoryService(store: CategoryStore) {
  return {
    async create(input: CategoryWriteInput) {
      await store.create(input);
      return { status: "SUCCESS" as const };
    },
    async update(id: number, input: CategoryWriteInput) {
      return {
        status: (await store.update(id, input))
          ? ("SUCCESS" as const)
          : ("NOT_FOUND" as const),
      };
    },
    async setActive(id: number, isActive: boolean) {
      return {
        status: (await store.setActive(id, isActive))
          ? ("SUCCESS" as const)
          : ("NOT_FOUND" as const),
      };
    },
    async move(id: number, direction: CategoryDirection) {
      return { status: await store.move(id, direction) };
    },
    async delete(id: number) {
      const issueCount = await store.findIssueCount(id);
      if (issueCount === null) {
        return { status: "NOT_FOUND" as const };
      }
      if (issueCount > 0) {
        return { status: "REFERENCED" as const };
      }

      try {
        return {
          status: (await store.delete(id))
            ? ("SUCCESS" as const)
            : ("NOT_FOUND" as const),
        };
      } catch (error) {
        if (store.isForeignKeyError(error)) {
          return { status: "REFERENCED" as const };
        }
        throw error;
      }
    },
  };
}
