import { redirect } from "next/navigation";

import { LoginForm } from "@/components/staff/login-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getStaffActor } from "@/lib/staff/auth";

export default async function StaffLoginPage() {
  const authentication = await getStaffActor();

  if (authentication.status === "AUTHENTICATED") {
    redirect("/staff");
  }

  if (authentication.status === "UNAUTHORIZED") {
    redirect("/staff/unauthorized");
  }

  return (
    <main className="grid min-h-svh place-items-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-md bg-primary text-sm font-extrabold tracking-[-0.08em] text-primary-foreground"
          >
            IL
          </span>
          <span className="font-bold tracking-[0.12em]">ILMO</span>
        </div>

        <Card>
          <CardHeader className="pb-6">
            <p className="text-sm font-semibold text-primary">
              Henkilökunnan näkymä
            </p>
            <h1 className="text-2xl font-semibold leading-none tracking-tight sm:text-3xl">
              Kirjaudu sisään
            </h1>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
