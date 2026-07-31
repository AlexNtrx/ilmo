import assert from "node:assert/strict";
import test from "node:test";

import { createCategoryService, type CategoryStore } from "@/lib/admin/category-service";

function createStore(overrides: Partial<CategoryStore> = {}): CategoryStore {
  return {
    create: async () => undefined,
    update: async () => true,
    setActive: async () => true,
    move: async () => "MOVED",
    findIssueCount: async () => 0,
    delete: async () => true,
    isForeignKeyError: () => false,
    ...overrides,
  };
}

test("maps a referenced-category pre-check", async () => {
  let deleted = false;
  const service = createCategoryService(createStore({
    findIssueCount: async () => 2,
    delete: async () => { deleted = true; return true; },
  }));

  assert.deepEqual(await service.delete(1), { status: "REFERENCED" });
  assert.equal(deleted, false);
});

test("maps a database foreign-key rejection after a friendly pre-check", async () => {
  const foreignKeyError = new Error("foreign key");
  const service = createCategoryService(createStore({
    delete: async () => { throw foreignKeyError; },
    isForeignKeyError: (error) => error === foreignKeyError,
  }));

  assert.deepEqual(await service.delete(1), { status: "REFERENCED" });
});

test("returns deterministic move results from the store", async () => {
  const service = createCategoryService(createStore({ move: async () => "UNCHANGED" }));
  assert.deepEqual(await service.move(1, "UP"), { status: "UNCHANGED" });
});
