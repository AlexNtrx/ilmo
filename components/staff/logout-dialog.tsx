"use client";

import {
  useRef,
  useState,
  useTransition,
  type FormEventHandler,
  type ReactElement,
} from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";

import { signOutStaffAction } from "@/app/(staff)/staff/actions";
import { ConfirmationDialog } from "@/components/staff/confirmation-dialog";
import { getSignOutSuccessMessage } from "@/lib/staff/action-policy";

/** Confirms sign-out and reports success only after the server ends the session. */
export function LogoutDialog({ trigger }: { trigger: ReactElement }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const submitting = useRef(false);

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
    startTransition(async () => {
      const result = await signOutStaffAction();

      if (result.status === "SUCCESS") {
        const successMessage = getSignOutSuccessMessage(result);
        if (!successMessage) {
          return;
        }

        setOpen(false);
        toast.success(successMessage);
        router.replace("/staff/login");
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
      trigger={trigger}
      icon={<LogOutIcon className="size-6" />}
      tone="neutral"
      title="Kirjaudutaanko ulos?"
      description="Haluatko varmasti kirjautua ulos?"
      consequence="Sinut kirjataan ulos henkilökunnan työtilasta."
      error={error}
      pending={pending}
      cancelLabel="Peruuta"
      confirmLabel="Kirjaudu ulos"
      pendingLabel="Kirjaudutaan ulos…"
      confirmVariant="secondary"
      onSubmit={handleSubmit}
    />
  );
}
