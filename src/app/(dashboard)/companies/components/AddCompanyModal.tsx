"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Building2, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormState {
  name: string;
  latitude: string;
  longitude: string;
  radius: string;
  wifi_ssid: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  latitude: "",
  longitude: "",
  radius: "100",
  wifi_ssid: "",
};

export function AddCompanyModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  function handleUseMyLocation() {
    if (!("geolocation" in navigator)) {
      setError("La géolocalisation n'est pas supportée par ce navigateur.");
      return;
    }
    setGeoLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setGeoLoading(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Permission refusée. Autorisez l'accès à la position dans votre navigateur.",
          2: "Position indisponible. Vérifiez votre connexion et réessayez.",
          3: "Délai dépassé. Réessayez.",
        };
        setError(messages[err.code] ?? "Impossible de récupérer la position.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  function handleClose() {
    if (loading) return;
    setIsOpen(false);
    setForm(INITIAL_FORM);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const latitude = parseFloat(form.latitude);
    const longitude = parseFloat(form.longitude);
    const radius = parseInt(form.radius, 10);

    if (isNaN(latitude) || isNaN(longitude)) {
      setError("Les coordonnées GPS doivent être des nombres valides.");
      setLoading(false);
      return;
    }

    if (isNaN(radius) || radius <= 0) {
      setError("Le rayon doit être un entier positif.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          latitude,
          longitude,
          radius,
          wifi_ssid: form.wifi_ssid || null,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.message ?? "Une erreur est survenue.");
        return;
      }

      handleClose();
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Building2 className="h-4 w-4" />
        Ajouter une entreprise
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2
                id="modal-title"
                className="text-base font-semibold text-card-foreground"
              >
                Ajouter une entreprise
              </h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none"
                aria-label="Fermer"
              >
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
                <label
                  htmlFor="co-name"
                  className="block text-sm font-medium text-card-foreground"
                >
                  Nom de l&apos;entreprise
                </label>
                <input
                  ref={firstInputRef}
                  id="co-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Acme Corp"
                  className={field}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">
                    Coordonnées GPS
                  </span>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={loading || geoLoading}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                  >
                    {geoLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5" />
                    )}
                    {geoLoading ? "Localisation…" : "Utiliser ma position"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="co-lat"
                      className="block text-xs font-medium text-muted-foreground"
                    >
                      Latitude
                    </label>
                    <input
                      id="co-lat"
                      type="number"
                      required
                      step="any"
                      value={form.latitude}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, latitude: e.target.value }))
                      }
                      placeholder="48.8566"
                      className={field}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="co-lng"
                      className="block text-xs font-medium text-muted-foreground"
                    >
                      Longitude
                    </label>
                    <input
                      id="co-lng"
                      type="number"
                      required
                      step="any"
                      value={form.longitude}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, longitude: e.target.value }))
                      }
                      placeholder="2.3522"
                      className={field}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="co-radius"
                  className="block text-sm font-medium text-card-foreground"
                >
                  Rayon de présence (mètres)
                </label>
                <input
                  id="co-radius"
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={form.radius}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, radius: e.target.value }))
                  }
                  placeholder="100"
                  className={field}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="co-wifi"
                  className="block text-sm font-medium text-card-foreground"
                >
                  Wi-Fi SSID{" "}
                  <span className="font-normal text-muted-foreground">
                    (optionnel)
                  </span>
                </label>
                <input
                  id="co-wifi"
                  type="text"
                  value={form.wifi_ssid}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, wifi_ssid: e.target.value }))
                  }
                  placeholder="Office-WiFi"
                  className={field}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
                  )}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Création…" : "Créer l'entreprise"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
