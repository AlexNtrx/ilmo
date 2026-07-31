import {
  AlertCircleIcon,
  CheckCircle2Icon,
  MapPinOffIcon,
  PauseCircleIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ReportStateVariant = "success" | "invalid" | "inactive" | "unavailable";

const stateContent = {
  success: {
    icon: CheckCircle2Icon,
    title: "Kiitos ilmoituksesta",
    description:
      "Ilmoituksesi on vastaanotettu. Henkilökunta käsittelee sen mahdollisimman pian.",
  },
  invalid: {
    icon: MapPinOffIcon,
    title: "Sijaintia ei löytynyt",
    description:
      "Tämä ilmoituslinkki ei ole voimassa. Tarkista QR-koodi ja yritä uudelleen.",
  },
  inactive: {
    icon: PauseCircleIcon,
    title: "Ilmoittaminen ei ole käytössä",
    description: "Tässä kohteessa ei voi tällä hetkellä tehdä ilmoitusta.",
  },
  unavailable: {
    icon: AlertCircleIcon,
    title: "Ilmoittaminen ei juuri nyt onnistu",
    description:
      "Ilmoitustyyppejä ei ole saatavilla. Yritä myöhemmin uudelleen.",
  },
} satisfies Record<
  ReportStateVariant,
  { icon: typeof CheckCircle2Icon; title: string; description: string }
>;

export function ReportState({ variant }: { variant: ReportStateVariant }) {
  const content = stateContent[variant];
  const Icon = content.icon;

  return (
    <section
      aria-labelledby={`${variant}-state-title`}
      className="border-t border-border pt-10 sm:pt-14"
    >
      <div className="max-w-md">
        <div className="mb-6 grid size-12 place-items-center rounded-full bg-secondary text-primary">
          <Icon aria-hidden="true" className="size-6" strokeWidth={1.8} />
        </div>
        <h1
          id={`${variant}-state-title`}
          className="text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
        >
          {content.title}
        </h1>
        <p className="mt-4 max-w-[46ch] text-pretty text-base leading-7 text-muted-foreground">
          {content.description}
        </p>
      </div>

      {variant === "unavailable" ? (
        <Alert className="mt-8 max-w-md">
          <AlertCircleIcon aria-hidden="true" />
          <AlertTitle>Palvelu ei ole käytettävissä</AlertTitle>
          <AlertDescription>
            Voit ilmoittaa asiasta suoraan henkilökunnalle.
          </AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}
