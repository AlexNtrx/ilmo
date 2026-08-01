"use client";

import {
  useRef,
  useState,
  useTransition,
  type FormEventHandler,
} from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, SearchXIcon } from "lucide-react";
import { toast } from "sonner";

import { closeIssueAction } from "@/app/(staff)/staff/actions";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/staff/confirmation-dialog";
import { getCloseIssueSuccessMessage } from "@/lib/staff/action-policy";
import {
  initialCloseIssueActionResult,
  type CloseIssueTarget,
} from "@/lib/staff/types";

const actionContent: Record<
  CloseIssueTarget,
  {
    title: string;
    consequence: string;
    triggerLabel: string;
    confirmLabel: string;
    pendingLabel: string;
  }
> = {
  RESOLVED: {
    title: "Merkitäänkö ongelma ratkaistuksi?",
    consequence: "Ilmoitus poistuu avoimien ilmoitusten listalta.",
    triggerLabel: "Merkitse ratkaistuksi",
    confirmLabel: "Merkitse ratkaistuksi",
    pendingLabel: "Merkitään ratkaistuksi…",
  },
  INVALID: {
    title: "Merkitäänkö ilmoitus virheelliseksi?",
    consequence: "Ilmoitus poistuu avoimien ilmoitusten listalta.",
    triggerLabel: "Merkitse virheelliseksi",
    confirmLabel: "Merkitse virheelliseksi",
    pendingLabel: "Merkitään virheelliseksi…",
  },
};

/**
 * Runs one OPEN-only status change and shows success only after confirmation.
 * Failed results stay in the dialog and never produce a success toast.
 */
function IssueActionDialog({
  issueId,
  categoryNameFi,
  locationNameFi,
  targetStatus,
}: {
  issueId: number;
  categoryNameFi: string;
  locationNameFi: string;
  targetStatus: CloseIssueTarget;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const submitting = useRef(false);
  const invalid = targetStatus === "INVALID";
  const content = actionContent[targetStatus];

  const handleOpenChange = (nextOpen: boolean) => {
    if (pending || submitting.current) {
      return;
    }

    setOpen(nextOpen);
    if (nextOpen) {
      setError(null);
    }
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (pending || submitting.current) {
      return;
    }

    submitting.current = true;
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await closeIssueAction(
        initialCloseIssueActionResult,
        formData,
      );

      if (result.status === "SUCCESS") {
        const successMessage = getCloseIssueSuccessMessage(result);
        if (!successMessage) {
          return;
        }

        setOpen(false);
        toast.success(successMessage);
        router.replace("/staff");
        return;
      }

      submitting.current = false;
      setError(result.message);
    });
  };

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        <Button
          type="button"
          size="lg"
          variant={invalid ? "outline" : "default"}
          className="min-h-12 w-full whitespace-normal px-4 py-3 text-center sm:w-auto"
        >
          {invalid ? (
            <SearchXIcon aria-hidden="true" />
          ) : (
            <CheckIcon aria-hidden="true" />
          )}
          {content.triggerLabel}
        </Button>
      }
      icon={
        invalid ? (
          <SearchXIcon className="size-6" />
        ) : (
          <CheckIcon className="size-6" />
        )
      }
      tone={invalid ? "destructive" : "primary"}
      title={content.title}
      context={
        <>
          <p className="font-semibold break-words">{categoryNameFi}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground break-words">
            {locationNameFi}
          </p>
        </>
      }
      consequence={content.consequence}
      error={error}
      pending={pending}
      cancelLabel="Peruuta"
      confirmLabel={content.confirmLabel}
      pendingLabel={content.pendingLabel}
      confirmVariant={invalid ? "destructive" : "default"}
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="issueId" value={issueId} />
      <input type="hidden" name="targetStatus" value={targetStatus} />
    </ConfirmationDialog>
  );
}

/** Presents the approved resolve and invalid actions for an open issue. */
export function IssueActions({
  issueId,
  categoryNameFi,
  locationNameFi,
}: {
  issueId: number;
  categoryNameFi: string;
  locationNameFi: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <IssueActionDialog
        issueId={issueId}
        categoryNameFi={categoryNameFi}
        locationNameFi={locationNameFi}
        targetStatus="RESOLVED"
      />
      <IssueActionDialog
        issueId={issueId}
        categoryNameFi={categoryNameFi}
        locationNameFi={locationNameFi}
        targetStatus="INVALID"
      />
    </div>
  );
}
