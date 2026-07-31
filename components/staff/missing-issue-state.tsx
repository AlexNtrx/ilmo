import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function MissingIssueState() {
  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="flex min-h-72 flex-col items-center justify-center gap-5 pt-5 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
          <SearchXIcon aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Ilmoitusta ei löytynyt</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ilmoitus on voitu poistaa tai osoite on virheellinen.
          </p>
        </div>
        <Button asChild size="lg" className="h-11">
          <Link href="/staff">Takaisin ilmoituksiin</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
