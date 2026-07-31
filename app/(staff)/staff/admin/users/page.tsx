import { UserManager } from "@/components/admin/user-manager";
import { listManagedUsers } from "@/lib/admin/queries";
import { requireAdminPageActor } from "@/lib/staff/auth";

export default async function UsersPage() {
  const actor = await requireAdminPageActor();
  const users = await listManagedUsers();
  return <UserManager actorId={actor.id} users={users} />;
}
