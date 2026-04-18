import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
        <ShieldOff className="h-8 w-8 text-rose-500" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Accès refusé
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.
        Seuls les super administrateurs peuvent y accéder.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Retour au dashboard
      </Link>
    </div>
  );
}
