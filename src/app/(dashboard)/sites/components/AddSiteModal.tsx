"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, MapPin, X, Lock } from "lucide-react";
import { toast } from "sonner";

interface Props {
  maxSites: number | null;
  currentSites: number;
  wifiEnabled: boolean;
}

export function AddSiteModal({ maxSites, currentSites, wifiEnabled }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radius: "100",
    wifi_ssid: "",
  });

  const atLimit = maxSites !== null && currentSites >= maxSites;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          radius: parseInt(form.radius, 10),
          wifi_ssid: form.wifi_ssid || null,
        }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.message ?? "Erreur"); return; }
      toast.success("Site créé avec succès.");
      setOpen(false);
      setForm({ name: "", latitude: "", longitude: "", radius: "100", wifi_ssid: "" });
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSaving(false);
    }
  }

  function handleLocate() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        }));
        setLocating(false);
      },
      () => {
        setError("Impossible d'obtenir votre position.");
        setLocating(false);
      }
    );
  }

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50";

  return (
    <>
      <button
        type="button"
        onClick={() => !atLimit && setOpen(true)}
        disabled={atLimit}
        title={atLimit ? `Limite atteinte (${currentSites}/${maxSites} sites). Passez à un plan supérieur.` : undefined}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {atLimit ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        Nouveau site
        {maxSites !== null && (
          <span className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-xs">
            {currentSites}/{maxSites}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-card-foreground">Nouveau site</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-card-foreground">Nom du site</label>
                <input
                  type="text"
                  required
                  placeholder="Bureau principal"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-card-foreground">Coordonnées GPS</label>
                  <button
                    type="button"
                    onClick={handleLocate}
                    disabled={locating}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-60"
                  >
                    {locating ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                    Ma position
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Latitude"
                    value={form.latitude}
                    onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Longitude"
                    value={form.longitude}
                    onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-card-foreground">Rayon (mètres)</label>
                <input
                  type="number"
                  required
                  min={50}
                  max={5000}
                  value={form.radius}
                  onChange={(e) => setForm((f) => ({ ...f, radius: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-card-foreground">
                  Wi-Fi SSID{" "}
                  <span className="font-normal text-muted-foreground">(optionnel)</span>
                  {!wifiEnabled && (
                    <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">Plan Business+ requis</span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="Office-WiFi"
                  value={form.wifi_ssid}
                  disabled={!wifiEnabled}
                  onChange={(e) => setForm((f) => ({ ...f, wifi_ssid: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Créer le site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
