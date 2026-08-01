"use client";

import { useState, useTransition, type FormEventHandler } from "react";
import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ShieldAlertIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  createCategoryAction,
  deleteCategoryAction,
  moveCategoryAction,
  setCategoryActiveAction,
  updateCategoryAction,
} from "@/app/(staff)/staff/admin/categories/actions";
import { ConfirmationDialog } from "@/components/staff/confirmation-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { formatIssueReferenceCount } from "@/lib/admin/category-copy";
import type { AdminActionResult, ManagedCategory } from "@/lib/admin/types";

const selectClassName =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type CategoryDraft = {
  nameFi: string;
  isUrgent: boolean;
  mergeMode: "MERGE_OPEN" | "ALWAYS_CREATE";
  requiresDescription: boolean;
  isActive: boolean;
};

function CategoryFields({
  draft,
  onChange,
}: {
  draft: CategoryDraft;
  onChange: (draft: CategoryDraft) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-2 sm:col-span-2">
        <span className="text-sm font-medium">Luokan nimi</span>
        <Input
          value={draft.nameFi}
          onChange={(event) => onChange({ ...draft, nameFi: event.target.value })}
          required
          maxLength={100}
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Yhdistämistapa</span>
        <select
          className={selectClassName}
          value={draft.mergeMode}
          onChange={(event) =>
            onChange({
              ...draft,
              mergeMode: event.target.value as CategoryDraft["mergeMode"],
            })
          }
        >
          <option value="MERGE_OPEN">Yhdistä avoimeen ilmoitukseen</option>
          <option value="ALWAYS_CREATE">Luo aina uusi ilmoitus</option>
        </select>
      </label>
      <div className="grid gap-3 rounded-lg border bg-muted/25 p-4">
        {[
          ["isUrgent", "Kiireellinen luokka"],
          ["requiresDescription", "Kuvaus vaaditaan"],
          ["isActive", "Käytössä julkisella lomakkeella"],
        ].map(([key, label]) => (
          <label key={key} className="flex min-h-8 items-center gap-3 text-sm">
            <Checkbox
              checked={draft[key as keyof CategoryDraft] as boolean}
              onCheckedChange={(checked) =>
                onChange({ ...draft, [key]: checked === true })
              }
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

/** Edits one category while keeping server validation and feedback authoritative. */
function CategoryEditor({ category }: { category: ManagedCategory }) {
  const [draft, setDraft] = useState<CategoryDraft>({
    nameFi: category.nameFi,
    isUrgent: category.isUrgent,
    mergeMode: category.mergeMode,
    requiresDescription: category.requiresDescription,
    isActive: category.isActive,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateCategoryAction({ id: category.id, ...draft });
      if (result.status === "SUCCESS") toast.success(result.message);
      else setError(result.message);
    });
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-4 border-t pt-4">
      <CategoryFields draft={draft} onChange={setDraft} />
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      <Button disabled={pending} type="submit">
        {pending ? <Spinner aria-label="Tallennetaan" /> : null}
        {pending ? "Tallennetaan…" : "Tallenna muutokset"}
      </Button>
    </form>
  );
}

/** Coordinates ordering, activation, editing, and safe deletion for one category. */
function CategoryRow({
  category,
  first,
  last,
}: {
  category: ManagedCategory;
  first: boolean;
  last: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const run = (operation: () => Promise<AdminActionResult>) => {
    setError(null);
    startTransition(async () => {
      const result = await operation();
      if (result.status === "SUCCESS") toast.success(result.message);
      else setError(result.message);
    });
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{category.nameFi}</h3>
              <span className="rounded-full border px-2 py-0.5 text-xs font-medium">
                {category.isActive ? "Käytössä" : "Ei käytössä"}
              </span>
              {category.isUrgent ? (
                <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  Kiireellinen
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatIssueReferenceCount(category.issueCount)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="icon-lg"
              variant="outline"
              disabled={pending || first}
              aria-label="Siirrä ylöspäin"
              onClick={() => run(() => moveCategoryAction({ id: category.id, direction: "UP" }))}
            >
              <ArrowUpIcon />
            </Button>
            <Button
              size="icon-lg"
              variant="outline"
              disabled={pending || last}
              aria-label="Siirrä alaspäin"
              onClick={() => run(() => moveCategoryAction({ id: category.id, direction: "DOWN" }))}
            >
              <ArrowDownIcon />
            </Button>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => run(() => setCategoryActiveAction({ id: category.id, isActive: !category.isActive }))}
            >
              {category.isActive ? "Poista käytöstä" : "Aktivoi"}
            </Button>
            <ConfirmationDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              trigger={<Button type="button" variant="outline" disabled={pending}><Trash2Icon />Poista</Button>}
              icon={<Trash2Icon className="size-6" />}
              tone="destructive"
              title="Poistetaanko luokka?"
              context={<p className="font-semibold break-words">{category.nameFi}</p>}
              consequence="Käytettyä luokkaa ei voi poistaa. Sen voi poistaa käytöstä."
              error={error}
              pending={pending}
              cancelLabel="Peruuta"
              confirmLabel="Poista luokka"
              pendingLabel="Poistetaan…"
              confirmVariant="destructive"
              onSubmit={(event) => {
                event.preventDefault();
                run(async () => {
                  const result = await deleteCategoryAction({ id: category.id });
                  if (result.status === "SUCCESS") setDeleteOpen(false);
                  return result;
                });
              }}
            />
          </div>
        </div>
        {error && !deleteOpen ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
        <details>
          <summary className="min-h-11 cursor-pointer rounded-md px-2 py-3 font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            Muokkaa luokkaa
          </summary>
          <CategoryEditor category={category} />
        </details>
      </CardContent>
    </Card>
  );
}

/** Manages category creation and the ordered set used by public reporting. */
export function CategoryManager({ categories }: { categories: ManagedCategory[] }) {
  const initialDraft: CategoryDraft = {
    nameFi: "",
    isUrgent: false,
    mergeMode: "MERGE_OPEN",
    requiresDescription: false,
    isActive: true,
  };
  const [draft, setDraft] = useState(initialDraft);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/staff" className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline">
          <ArrowLeftIcon className="size-4" />Avoimet ilmoitukset
        </Link>
        <p className="mt-4 text-sm font-semibold text-primary">Ylläpito</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Ilmoitusluokat</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Hallinnoi julkisella ilmoituslomakkeella näkyviä vaihtoehtoja.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Luo uusi luokka</CardTitle></CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              startTransition(async () => {
                const result = await createCategoryAction(draft);
                if (result.status === "SUCCESS") {
                  setDraft(initialDraft);
                  toast.success(result.message);
                } else setError(result.message);
              });
            }}
          >
            <CategoryFields draft={draft} onChange={setDraft} />
            {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner aria-label="Luodaan" /> : null}
              {pending ? "Luodaan…" : "Luo luokka"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section aria-labelledby="category-list-heading" className="space-y-4">
        <div className="flex items-center gap-3">
          <ShieldAlertIcon className="size-5 text-primary" aria-hidden="true" />
          <h2 id="category-list-heading" className="text-xl font-bold">Luokat ({categories.length})</h2>
        </div>
        {categories.map((category, index) => (
          <CategoryRow key={category.id} category={category} first={index === 0} last={index === categories.length - 1} />
        ))}
      </section>
    </div>
  );
}
