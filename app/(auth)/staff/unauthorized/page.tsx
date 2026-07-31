import Link from "next/link";
import { ShieldXIcon } from "lucide-react";

import { LogoutDialog } from "@/components/staff/logout-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function StaffUnauthorizedPage() {
  return (
    <main className="grid min-h-svh place-items-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardContent className="flex min-h-80 flex-col items-center justify-center gap-5 pt-5 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <ShieldXIcon aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">Ei käyttöoikeutta</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Tällä käyttäjätilillä ei ole oikeutta henkilökunnan näkymään.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" size="lg" className="h-11">
              <Link href="/staff/login">Kirjautumiseen</Link>
            </Button>
            <LogoutDialog
              trigger={
                <Button type="button" size="lg" className="h-11 w-full">
                  Kirjaudu ulos
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
