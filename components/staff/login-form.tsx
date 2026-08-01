"use client";

import { useActionState } from "react";
import { LogInIcon } from "lucide-react";

import {
  signInStaffAction,
  type StaffLoginActionState,
} from "@/app/(auth)/staff/login/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

/** Submits username credentials to the server action and renders typed errors. */
export function LoginForm() {
  const initialState: StaffLoginActionState = { status: "IDLE" };
  const [state, formAction, pending] = useActionState(
    signInStaffAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <Field data-invalid={Boolean(state.fieldErrors?.username?.length)}>
        <FieldLabel htmlFor="username">Käyttäjätunnus</FieldLabel>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          aria-invalid={Boolean(state.fieldErrors?.username?.length)}
          aria-describedby={
            state.fieldErrors?.username?.length ? "username-error" : undefined
          }
        />
        <FieldError id="username-error">
          {state.fieldErrors?.username?.[0]}
        </FieldError>
      </Field>

      <Field data-invalid={Boolean(state.fieldErrors?.password?.length)}>
        <FieldLabel htmlFor="password">Salasana</FieldLabel>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password?.length)}
          aria-describedby={
            state.fieldErrors?.password?.length ? "password-error" : undefined
          }
        />
        <FieldError id="password-error">
          {state.fieldErrors?.password?.[0]}
        </FieldError>
      </Field>

      <Button type="submit" size="lg" className="h-12 w-full" disabled={pending}>
        {pending ? (
          <>
            <Spinner aria-label="Kirjaudutaan" />
            Kirjaudutaan…
          </>
        ) : (
          <>
            <LogInIcon aria-hidden="true" />
            Kirjaudu
          </>
        )}
      </Button>
    </form>
  );
}
