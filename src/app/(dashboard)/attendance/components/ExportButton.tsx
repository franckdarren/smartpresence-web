"use client";

import { Download, Lock } from "lucide-react";
import Link from "next/link";

interface Props {
  enabled: boolean;
  date: string;
  employeeId?: string;
}

export function ExportButton({ enabled, date, employeeId }: Props) {
  const params = new URLSearchParams({ date });
  if (employeeId) params.set("employeeId", employeeId);
  const href = `/api/v1/attendance/admin/export?${params.toString()}`;

  if (!enabled) {
    return (
      <div className="group relative">
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground opacity-60"
        >
          <Lock className="h-4 w-4" />
          Exporter CSV
        </button>
        <div className="pointer-events-none absolute right-0 top-full z-10 mt-2 hidden w-52 rounded-lg border border-border bg-popover p-3 shadow-lg group-hover:block">
          <p className="text-xs font-medium text-popover-foreground">Fonctionnalité verrouillée</p>
          <p className="mt-1 text-xs text-muted-foreground">
            L&apos;export CSV est disponible à partir du plan <strong>Business</strong>.
          </p>
          <Link
            href="/my-subscription"
            className="pointer-events-auto mt-2 inline-block text-xs text-primary hover:underline"
          >
            Voir les plans →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
    >
      <Download className="h-4 w-4" />
      Exporter CSV
    </a>
  );
}
