import Link from "next/link";
import { AlertTriangle, Mail, Settings } from "lucide-react";

export default function SubscriptionExpiredPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Abonnement expiré
          </h1>
          <p className="text-sm text-muted-foreground">
            Votre période d&apos;abonnement SmartPresence est terminée. Vos
            données sont conservées. Contactez-nous pour réactiver votre accès.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="mailto:support@smartpresence.app"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Mail className="h-4 w-4" />
            Contacter le support
          </a>
          <Link
            href="/settings"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
            Voir mon abonnement
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          Accès à vos paramètres d&apos;abonnement toujours disponible via{" "}
          <Link href="/settings" className="underline underline-offset-2 hover:text-foreground">
            Paramètres
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
