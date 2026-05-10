"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { Download, RefreshCw, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { Company } from "@/lib/db/schema";

interface Props {
  company: Company;
}

interface FormState {
  name: string;
  radius: string;
  wifi_ssid: string;
}

export function SettingsForm({ company }: Props) {
  const router = useRouter();
  const qrRef = useRef<HTMLCanvasElement>(null);

  const [form, setForm] = useState<FormState>({
    name: company.name,
    radius: String(company.radius),
    wifi_ssid: company.wifi_ssid ?? "",
  });

  const [token, setToken] = useState(company.company_token);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/companies/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          radius: parseInt(form.radius, 10),
          wifi_ssid: form.wifi_ssid || null,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.message ?? "Une erreur est survenue.");
        return;
      }

      toast.success("Paramètres sauvegardés avec succès.");
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRegenerate() {
    if (
      !confirm(
        "Régénérer le QR Code invalidera l'ancien. Les employés devront scanner le nouveau code. Continuer ?"
      )
    )
      return;

    setRegenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/companies/settings/regenerate-token", {
        method: "POST",
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.message ?? "Une erreur est survenue.");
        return;
      }

      setToken(json.data.company_token);
      toast.success("QR Code régénéré avec succès.");
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setRegenerating(false);
    }
  }

  function handleDownload() {
    const canvas = qrRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode-${form.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  }

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50";

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Form */}
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold text-card-foreground">
              Informations de l&apos;entreprise
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Ces informations sont utilisées pour valider les pointages.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="s-name"
                className="block text-sm font-medium text-card-foreground"
              >
                Nom de l&apos;entreprise
              </label>
              <input
                id="s-name"
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Mon Entreprise"
                className={inputClass}
                disabled={saving}
              />
            </div>

            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-card-foreground">
                Coordonnées GPS
              </span>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs text-muted-foreground">Latitude</label>
                  <p className={`${inputClass} cursor-default select-text opacity-60`}>
                    {company.latitude}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs text-muted-foreground">Longitude</label>
                  <p className={`${inputClass} cursor-default select-text opacity-60`}>
                    {company.longitude}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Les coordonnées GPS ne peuvent pas être modifiées après la création.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="s-radius"
                className="block text-sm font-medium text-card-foreground"
              >
                Rayon de présence (mètres)
              </label>
              <input
                id="s-radius"
                type="number"
                required
                min={1}
                step={1}
                value={form.radius}
                onChange={(e) =>
                  setForm((f) => ({ ...f, radius: e.target.value }))
                }
                placeholder="100"
                className={inputClass}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Un employé doit se trouver dans ce rayon pour pouvoir pointer.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="s-wifi"
                className="block text-sm font-medium text-card-foreground"
              >
                Wi-Fi SSID{" "}
                <span className="font-normal text-muted-foreground">
                  (optionnel)
                </span>
              </label>
              <input
                id="s-wifi"
                type="text"
                value={form.wifi_ssid}
                onChange={(e) =>
                  setForm((f) => ({ ...f, wifi_ssid: e.target.value }))
                }
                placeholder="Office-WiFi"
                className={inputClass}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Si renseigné, le SSID Wi-Fi sera vérifié lors du pointage.
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Sauvegarde…" : "Sauvegarder"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* QR Code */}
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold text-card-foreground">
              QR Code entreprise
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Les employés scannent ce code pour pointer.
            </p>
          </div>

          <div className="flex flex-col items-center gap-5 px-6 py-6">
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <QRCodeCanvas
                ref={qrRef}
                value={token}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>

            <p className="max-w-[180px] break-all text-center font-mono text-[10px] text-muted-foreground">
              {token}
            </p>

            <div className="flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Download className="h-4 w-4" />
                Télécharger
              </button>

              <button
                type="button"
                onClick={handleRegenerate}
                disabled={regenerating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-60"
              >
                {regenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {regenerating ? "Régénération…" : "Régénérer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
