"use client";

import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function StaffError({ reset }: { reset: () => void }) {
  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="flex min-h-72 flex-col items-center justify-center gap-5 pt-5 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangleIcon aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Ilmoituksia ei voitu ladata</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Yritä ladata tiedot uudelleen.
          </p>
        </div>
        <Button type="button" size="lg" className="h-11" onClick={reset}>
          <RefreshCwIcon aria-hidden="true" />
          Yritä uudelleen
        </Button>
      </CardContent>
    </Card>
  );
}
