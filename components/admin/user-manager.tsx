"use client";

import { useState, useTransition, type FormEventHandler } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  KeyRoundIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  changeUserRoleAction,
  createUserAction,
  deleteUserAction,
  resetUserPasswordAction,
  updateUserProfileAction,
} from "@/app/(staff)/staff/admin/users/actions";
import { ConfirmationDialog } from "@/components/staff/confirmation-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { AdminActionResult, ManagedRole, ManagedUser } from "@/lib/admin/types";

const selectClassName =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function FormError({ message }: { message: string | null }) {
  return message ? (
    <Alert variant="destructive"><AlertDescription>{message}</AlertDescription></Alert>
  ) : null;
}

function LabeledInput({ label, ...props }: { label: string } & React.ComponentProps<typeof Input>) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <Input {...props} />
    </label>
  );
}

/**
 * Keeps profile, role, password, and deletion operations separate for one user.
 * Typed server results decide feedback and self-session navigation.
 */
function UserRow({ user, actorId }: { user: ManagedUser; actorId: string }) {
  const router = useRouter();
  const [profileError, setProfileError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [profilePending, startProfile] = useTransition();
  const [rolePending, startRole] = useTransition();
  const [passwordPending, startPassword] = useTransition();
  const [deletePending, startDelete] = useTransition();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<ManagedRole>(user.role ?? "staff");

  const handleResult = (result: AdminActionResult, setError: (message: string) => void) => {
    if (result.status === "SUCCESS") {
      toast.success(result.message);
      return true;
    }
    if (result.status === "SELF_SESSION_REVOKED") {
      toast.success(result.message);
      router.replace("/staff/login");
      router.refresh();
      return true;
    }
    setError(result.message);
    return false;
  };

  return (
    <Card>
      <CardContent className="space-y-5 pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{user.name}</h3>
              {user.id === actorId ? <span className="rounded-full border px-2 py-0.5 text-xs">Sinä</span> : null}
              <span className="rounded-full border bg-muted/40 px-2 py-0.5 text-xs font-medium">
                {user.role === "admin" ? "Ylläpitäjä" : user.role === "staff" ? "Henkilökunta" : "Tuntematon rooli"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">@{user.displayUsername ?? user.username ?? "—"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ConfirmationDialog
              open={passwordOpen}
              onOpenChange={(open) => { setPasswordOpen(open); if (open) setPasswordError(null); }}
              trigger={<Button type="button" variant="outline"><KeyRoundIcon />Vaihda salasana</Button>}
              icon={<KeyRoundIcon className="size-6" />}
              tone="neutral"
              title="Vaihdetaanko käyttäjän salasana?"
              context={<><p className="font-semibold">{user.name}</p><p className="mt-1 text-sm text-muted-foreground">@{user.displayUsername ?? user.username}</p></>}
              consequence="Uusi salasana sulkee käyttäjän kaikki nykyiset istunnot."
              error={passwordError}
              pending={passwordPending}
              cancelLabel="Peruuta"
              confirmLabel="Vaihda salasana"
              pendingLabel="Vaihdetaan…"
              confirmVariant="secondary"
              onSubmit={(event) => {
                event.preventDefault();
                setPasswordError(null);
                startPassword(async () => {
                  const result = await resetUserPasswordAction({ userId: user.id, password });
                  if (handleResult(result, setPasswordError)) {
                    setPassword("");
                    setPasswordOpen(false);
                  }
                });
              }}
            >
              <div className="mb-5 space-y-2">
                <label htmlFor={`password-${user.id}`} className="text-sm font-medium">Uusi salasana</label>
                <Input id={`password-${user.id}`} type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={128} required autoComplete="new-password" />
              </div>
            </ConfirmationDialog>
            <ConfirmationDialog
              open={deleteOpen}
              onOpenChange={(open) => { setDeleteOpen(open); if (open) setDeleteError(null); }}
              trigger={<Button type="button" variant="outline" disabled={user.id === actorId}><Trash2Icon />Poista</Button>}
              icon={<Trash2Icon className="size-6" />}
              tone="destructive"
              title="Poistetaanko käyttäjä?"
              context={<><p className="font-semibold">{user.name}</p><p className="mt-1 text-sm text-muted-foreground">@{user.displayUsername ?? user.username}</p></>}
              consequence="Käyttäjä ei voi enää kirjautua sisään."
              error={deleteError}
              pending={deletePending}
              cancelLabel="Peruuta"
              confirmLabel="Poista käyttäjä"
              pendingLabel="Poistetaan…"
              confirmVariant="destructive"
              onSubmit={(event) => {
                event.preventDefault();
                setDeleteError(null);
                startDelete(async () => {
                  const result = await deleteUserAction({ userId: user.id });
                  if (handleResult(result, setDeleteError)) setDeleteOpen(false);
                });
              }}
            />
          </div>
        </div>

        <details>
          <summary className="min-h-11 cursor-pointer rounded-md px-2 py-3 font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50">Muokkaa käyttäjää</summary>
          <div className="mt-4 grid gap-6 border-t pt-5 lg:grid-cols-2">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                setProfileError(null);
                startProfile(async () => {
                  const result = await updateUserProfileAction({
                    userId: user.id,
                    username: form.get("username"),
                    name: form.get("name"),
                  });
                  handleResult(result, setProfileError);
                });
              }}
            >
              <h4 className="font-semibold">Profiilitiedot</h4>
              <LabeledInput label="Käyttäjätunnus" name="username" defaultValue={user.displayUsername ?? user.username ?? ""} minLength={3} maxLength={30} required />
              <LabeledInput label="Nimi" name="name" defaultValue={user.name} maxLength={100} required />
              <FormError message={profileError} />
              <Button type="submit" disabled={profilePending}>{profilePending ? <Spinner aria-label="Tallennetaan" /> : null}{profilePending ? "Tallennetaan…" : "Tallenna profiili"}</Button>
            </form>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setRoleError(null);
                startRole(async () => {
                  const result = await changeUserRoleAction({ userId: user.id, role });
                  handleResult(result, setRoleError);
                });
              }}
            >
              <h4 className="font-semibold">Rooli</h4>
              <label className="space-y-2">
                <span className="text-sm font-medium">Käyttöoikeus</span>
                <select className={selectClassName} value={role} onChange={(event) => setRole(event.target.value as ManagedRole)}>
                  <option value="staff">Henkilökunta</option>
                  <option value="admin">Ylläpitäjä</option>
                </select>
              </label>
              <p className="text-sm leading-6 text-muted-foreground">Vain ylläpitäjä voi hallita luokkia ja käyttäjiä.</p>
              <FormError message={roleError} />
              <Button type="submit" variant="secondary" disabled={rolePending}>{rolePending ? <Spinner aria-label="Tallennetaan" /> : null}{rolePending ? "Tallennetaan…" : "Tallenna rooli"}</Button>
            </form>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

/** Creates users and presents administrator-only account management controls. */
export function UserManager({ users, actorId }: { users: ManagedUser[]; actorId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const createUser: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setError(null);
    startTransition(async () => {
      const result = await createUserAction({
        username: form.get("username"),
        name: form.get("name"),
        password: form.get("password"),
        role: form.get("role"),
      });
      if (result.status === "SUCCESS") {
        formElement.reset();
        toast.success(result.message);
      } else setError(result.message);
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/staff" className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline"><ArrowLeftIcon className="size-4" />Avoimet ilmoitukset</Link>
        <p className="mt-4 text-sm font-semibold text-primary">Ylläpito</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Käyttäjät</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Luo ja hallinnoi henkilökunnan käyttäjätilejä.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserPlusIcon className="size-5 text-primary" />Luo käyttäjä</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="grid gap-4 sm:grid-cols-2">
            <LabeledInput label="Käyttäjätunnus" name="username" minLength={3} maxLength={30} required autoComplete="off" />
            <LabeledInput label="Nimi" name="name" maxLength={100} required />
            <LabeledInput label="Väliaikainen salasana" name="password" type="password" minLength={8} maxLength={128} required autoComplete="new-password" />
            <label className="space-y-2">
              <span className="text-sm font-medium">Rooli</span>
              <select name="role" defaultValue="staff" className={selectClassName}>
                <option value="staff">Henkilökunta</option>
                <option value="admin">Ylläpitäjä</option>
              </select>
            </label>
            <div className="sm:col-span-2"><FormError message={error} /></div>
            <Button type="submit" disabled={pending} className="sm:col-span-2 sm:w-fit">{pending ? <Spinner aria-label="Luodaan" /> : null}{pending ? "Luodaan…" : "Luo käyttäjä"}</Button>
          </form>
        </CardContent>
      </Card>

      <section aria-labelledby="user-list-heading" className="space-y-4">
        <div className="flex items-center gap-3"><UsersIcon className="size-5 text-primary" /><h2 id="user-list-heading" className="text-xl font-bold">Käyttäjät ({users.length})</h2></div>
        {users.map((user) => <UserRow key={user.id} user={user} actorId={actorId} />)}
      </section>
    </div>
  );
}
