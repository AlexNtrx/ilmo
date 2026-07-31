import { CategoryManager } from "@/components/admin/category-manager";
import { listManagedCategories } from "@/lib/admin/queries";
import { requireAdminPageActor } from "@/lib/staff/auth";

export default async function CategoriesPage() {
  await requireAdminPageActor();
  const categories = await listManagedCategories();
  return <CategoryManager categories={categories} />;
}
