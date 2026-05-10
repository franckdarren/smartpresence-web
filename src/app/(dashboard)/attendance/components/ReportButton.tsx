"use client";

import { useState } from "react";
import { FileText, Lock, X, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Props {
  enabled: boolean;
  employees: { id: string; name: string }[];
}

type Preset = "week" | "month" | "custom";

function getWeekRange(): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().slice(0, 10),
    to: sunday.toISOString().slice(0, 10),
  };
}

function getMonthRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function ReportButton({ enabled, employees }: Props) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<Preset>("month");
  const [from, setFrom] = useState(() => getMonthRange().from);
  const [to, setTo] = useState(() => getMonthRange().to);
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);

  function selectPreset(p: Preset) {
    setPreset(p);
    if (p === "week") {
      const r = getWeekRange();
      setFrom(r.from);
      setTo(r.to);
    } else if (p === "month") {
      const r = getMonthRange();
      setFrom(r.from);
      setTo(r.to);
    }
  }

  async function handleGenerate() {
    if (!from || !to) {
      toast.error("Veuillez sélectionner une période");
      return;
    }
    if (from > to) {
      toast.error("La date de début doit être antérieure à la date de fin");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ from, to });
      if (employeeId) params.set("employeeId", employeeId);

      const res = await fetch(`/api/v1/reports/attendance?${params}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message ?? "Erreur lors de la génération");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport-presences_${from}_${to}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
      toast.success("Rapport PDF généré");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  if (!enabled) {
    return (
      <div className="group relative">
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground opacity-60"
        >
          <Lock className="h-4 w-4" />
          Rapport PDF
        </button>
        <div className="pointer-events-none absolute right-0 top-full z-10 mt-2 hidden w-56 rounded-lg border border-border bg-popover p-3 shadow-lg group-hover:block">
          <p className="text-xs font-medium text-popover-foreground">Fonctionnalité verrouillée</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Les rapports PDF sont disponibles à partir du plan{" "}
            <strong>Enterprise</strong>.
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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
      >
        <FileText className="h-4 w-4" />
        Rapport PDF
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            {/* Modal header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Générer un rapport PDF
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Sélectionnez la période et les filtres souhaités
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Preset buttons */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Période
              </p>
              <div className="flex gap-2">
                {(["week", "month", "custom"] as Preset[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => selectPreset(p)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      preset === p
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {p === "week" ? "Cette semaine" : p === "month" ? "Ce mois" : "Personnalisé"}
                  </button>
                ))}
              </div>
            </div>

            {/* Date inputs */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Du
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => { setFrom(e.target.value); setPreset("custom"); }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Au
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => { setTo(e.target.value); setPreset("custom"); }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Employee filter */}
            {employees.length > 0 && (
              <div className="mb-6">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Employé (optionnel)
                </label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Tous les employés</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {loading ? "Génération..." : "Télécharger"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
