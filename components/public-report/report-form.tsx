"use client";

import { useRef, useState } from "react";
import { AlertCircleIcon, ShieldAlertIcon } from "lucide-react";

import { ReportState } from "@/components/public-report/report-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { PublicReportCategory } from "@/lib/reporting/queries";
import { cn } from "@/lib/utils";

type ReportFormProps = {
  publicCode: string;
  location: {
    nameFi: string;
    descriptionFi: string;
  };
  categories: PublicReportCategory[];
};

type FieldErrors = {
  categoryIds?: string;
  description?: string;
};

type ScreenState = "form" | "success" | "invalid" | "inactive";

/**
 * Collects a public report and submits all selected categories together.
 * Server responses control validation focus and the neutral result screen.
 */
export function ReportForm({
  publicCode,
  location,
  categories,
}: ReportFormProps) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [screenState, setScreenState] = useState<ScreenState>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const categoryGroupRef = useRef<HTMLFieldSetElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const serverErrorRef = useRef<HTMLDivElement>(null);

  if (screenState !== "form") {
    return <ReportState variant={screenState} />;
  }

  const selectedCategories = categories.filter((category) =>
    selectedCategoryIds.includes(category.id),
  );
  const descriptionRequired = selectedCategories.some(
    (category) => category.requiresDescription,
  );
  const showDescription = selectedCategoryIds.length > 0;

  function toggleCategory(categoryId: number, checked: boolean) {
    setSelectedCategoryIds((current) =>
      checked
        ? [...current, categoryId].sort((left, right) => left - right)
        : current.filter((id) => id !== categoryId),
    );
    setFieldErrors((current) => ({ ...current, categoryIds: undefined }));
    setServerError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setServerError(null);

    try {
      const response = await fetch(
        `/api/reports/${encodeURIComponent(publicCode)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryIds: selectedCategoryIds,
            description,
          }),
        },
      );
      const result = (await response.json().catch(() => null)) as {
        ok: boolean;
        error?: {
          code?: string;
          message?: string;
          fieldErrors?: FieldErrors;
        };
      } | null;

      if (response.ok && result?.ok) {
        setScreenState("success");
        return;
      }

      if (response.status === 404) {
        setScreenState("invalid");
        return;
      }

      if (response.status === 410) {
        setScreenState("inactive");
        return;
      }

      const nextFieldErrors = result?.error?.fieldErrors ?? {};
      setFieldErrors(nextFieldErrors);

      if (nextFieldErrors.categoryIds) {
        requestAnimationFrame(() => categoryGroupRef.current?.focus());
      } else if (nextFieldErrors.description) {
        requestAnimationFrame(() => descriptionRef.current?.focus());
      } else {
        setServerError(
          result?.error?.message ??
            "Ilmoituksen lähettäminen ei onnistunut. Yritä uudelleen.",
        );
        requestAnimationFrame(() => serverErrorRef.current?.focus());
      }
    } catch {
      setServerError(
        "Verkkoyhteydessä on häiriö. Tarkista yhteys ja yritä uudelleen.",
      );
      requestAnimationFrame(() => serverErrorRef.current?.focus());
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <header className="space-y-3">
        <p className="text-sm font-semibold tracking-[0.08em] text-primary uppercase">
          Ilmoituspaikka
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          {location.nameFi}
        </h1>
        <p className="max-w-[48ch] text-base leading-7 text-muted-foreground">
          {location.descriptionFi}
        </p>
      </header>

      <Separator className="my-8" />

      <form className="space-y-8" noValidate onSubmit={handleSubmit}>
      <FieldSet
        ref={categoryGroupRef}
        aria-describedby={
          fieldErrors.categoryIds ? "category-error" : "category-help"
        }
        aria-invalid={Boolean(fieldErrors.categoryIds)}
        className="gap-3"
        disabled={isSubmitting}
        tabIndex={-1}
      >
        <FieldLegend className="text-xl font-semibold tracking-[-0.02em]">
          Mitä haluat ilmoittaa?
        </FieldLegend>
        <p
          id="category-help"
          className="mb-2 text-sm leading-6 text-muted-foreground"
        >
          Voit valita yhden tai useamman vaihtoehdon.
        </p>

        <div className="grid gap-3">
          {categories.map((category) => {
            const checked = selectedCategoryIds.includes(category.id);
            const descriptionId = category.isUrgent
              ? `category-${category.id}-urgent`
              : undefined;

            return (
              <label
                key={category.id}
                className={cn(
                  "group flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border bg-card px-4 py-3.5 transition-colors",
                  "hover:border-primary/50 hover:bg-accent/45",
                  "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
                  checked && "border-primary bg-secondary",
                  category.isUrgent &&
                    "border-urgent/35 bg-urgent-surface hover:border-urgent/60 hover:bg-urgent-surface",
                  isSubmitting && "cursor-not-allowed opacity-65",
                )}
              >
                <Checkbox
                  aria-describedby={descriptionId}
                  aria-label={category.nameFi}
                  checked={checked}
                  className="mt-0.5 size-5"
                  disabled={isSubmitting}
                  onCheckedChange={(value) =>
                    toggleCategory(category.id, value === true)
                  }
                />
                <span className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
                  <span className="text-[0.95rem] leading-6 font-medium">
                    {category.nameFi}
                  </span>
                  <span className="flex items-center gap-2">
                    {category.isUrgent ? (
                      <Badge
                        id={descriptionId}
                        className="border-urgent/35 bg-transparent text-urgent-foreground"
                        variant="outline"
                      >
                        <ShieldAlertIcon aria-hidden="true" />
                        Kiireellinen
                      </Badge>
                    ) : null}
                    {checked ? (
                      <span className="text-xs font-bold tracking-[0.08em] text-primary uppercase">
                        Valittu
                      </span>
                    ) : null}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <FieldError id="category-error">{fieldErrors.categoryIds}</FieldError>
      </FieldSet>

      {showDescription ? (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <label
                className="text-base font-semibold"
                htmlFor="report-description"
              >
                Lisätiedot
                <span className="ml-1 font-normal text-muted-foreground">
                  {descriptionRequired ? "(pakollinen)" : "(valinnainen)"}
                </span>
              </label>
              <span
                aria-live="polite"
                className="text-xs tabular-nums text-muted-foreground"
              >
                {description.length}/200
              </span>
            </div>
            <p
              id="description-help"
              className="text-sm leading-6 text-muted-foreground"
            >
              Sama kuvaus liitetään kaikkiin valitsemiisi ilmoitustyyppeihin.
            </p>
            <Textarea
              ref={descriptionRef}
              id="report-description"
              aria-describedby={
                fieldErrors.description
                  ? "description-help description-error"
                  : "description-help"
              }
              aria-invalid={Boolean(fieldErrors.description)}
              className="min-h-28 resize-y bg-card text-base"
              disabled={isSubmitting}
              maxLength={200}
              onChange={(event) => {
                setDescription(event.target.value);
                setFieldErrors((current) => ({
                  ...current,
                  description: undefined,
                }));
                setServerError(null);
              }}
              placeholder="Kerro lyhyesti, mitä havaitsit."
              value={description}
            />
            <FieldError id="description-error">
              {fieldErrors.description}
            </FieldError>
          </div>
        </>
      ) : null}

      {serverError ? (
        <Alert ref={serverErrorRef} tabIndex={-1} variant="destructive">
          <AlertCircleIcon aria-hidden="true" />
          <AlertTitle>Lähettäminen ei onnistunut</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Älä kirjoita henkilötietoja. Ilmoitus lähetetään ilman kirjautumista.
        </p>
        <Button
          className="h-12 w-full text-base font-semibold"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <>
              <Spinner aria-hidden="true" />
              Lähetetään…
            </>
          ) : (
            "Lähetä ilmoitus"
          )}
        </Button>
      </div>
      </form>
    </>
  );
}
