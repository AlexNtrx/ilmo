"use client";

import type {
  FormEventHandler,
  ReactElement,
  ReactNode,
} from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useStaffPollingPause } from "@/components/staff/staff-interaction-provider";
import { cn } from "@/lib/utils";

type ConfirmationTone = "primary" | "destructive" | "neutral";

const iconToneClasses: Record<ConfirmationTone, string> = {
  primary: "border-primary/25 bg-secondary text-primary",
  destructive:
    "border-destructive/25 bg-destructive/10 text-destructive",
  neutral: "border-border bg-muted text-foreground",
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  trigger,
  icon,
  tone,
  title,
  description,
  context,
  consequence,
  error,
  pending,
  cancelLabel,
  confirmLabel,
  pendingLabel,
  confirmVariant = "default",
  onSubmit,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactElement;
  icon: ReactNode;
  tone: ConfirmationTone;
  title: string;
  description?: string;
  context?: ReactNode;
  consequence: string;
  error: string | null;
  pending: boolean;
  cancelLabel: string;
  confirmLabel: string;
  pendingLabel: string;
  confirmVariant?: "default" | "destructive" | "secondary";
  onSubmit: FormEventHandler<HTMLFormElement>;
  children?: ReactNode;
}) {
  useStaffPollingPause(open || pending);

  const preventPendingDismiss = (event: Event) => {
    if (pending) {
      event.preventDefault();
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent
        className="max-h-[calc(100svh-1rem)] w-[calc(100%-1rem)] max-w-xl gap-0 overflow-y-auto p-0 sm:w-[calc(100%-2rem)]"
        onEscapeKeyDown={preventPendingDismiss}
        onOverlayClick={() => {
          if (!pending) {
            onOpenChange(false);
          }
        }}
      >
        <div className="space-y-5 p-5 sm:space-y-6 sm:p-7">
          <AlertDialogHeader className="items-center gap-4 text-center">
            <span
              aria-hidden="true"
              className={cn(
                "grid size-14 place-items-center rounded-2xl border",
                iconToneClasses[tone],
              )}
            >
              {icon}
            </span>
            <AlertDialogTitle className="max-w-md text-xl leading-7 font-bold text-balance sm:text-2xl sm:leading-8">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="max-w-md text-center leading-6">
              {description ?? consequence}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {context ? (
            <div className="rounded-xl border bg-muted/35 p-4 text-left">
              {context}
            </div>
          ) : null}

          {description ? (
            <p className="text-center text-sm leading-6 text-foreground">
              {consequence}
            </p>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={onSubmit}>
            {children}
            <AlertDialogFooter className="flex-col gap-2 border-t pt-5 sm:flex-row sm:pt-6">
              <AlertDialogCancel
                type="button"
                disabled={pending}
                className="min-h-12 w-full whitespace-normal px-4 py-3 sm:min-h-11 sm:w-auto"
              >
                {cancelLabel}
              </AlertDialogCancel>
              <Button
                type="submit"
                variant={confirmVariant}
                disabled={pending}
                className="min-h-12 w-full whitespace-normal px-4 py-3 text-center sm:min-h-11 sm:w-auto"
              >
                {pending ? <Spinner aria-label={pendingLabel} /> : null}
                {pending ? pendingLabel : confirmLabel}
              </Button>
            </AlertDialogFooter>
          </form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
