"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import {
  Download,
  RefreshCw,
  Trash2,
  Loader2,
  Wifi,
  MapPin,
  Radius,
} from "lucide-react";
import type { Site } from "@/lib/db/schema";

interface Props {
  site: Site;
  wifiEnabled: boolean;
}

export function SiteCard({ site, wifiEnabled }: Props) {
  const router = useRouter();
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [token, setToken] = useState(site.qr_token);
  const [error, setError] = useState<string | null>(null);

  async function handleRegenerate() {
    if (!confirm("Régénérer le QR Code invalidera l'ancien. Continuer ?")) return;
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/sites/${site.id}/regenerate-token`, { method: "POST" });
      const json = await res.json();
      if (!json.success) { setError(json.message ?? "Erreur"); return; }
      setToken(json.data.qr_token);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer le site "${site.name}" ? Cette action est irréversible.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/sites/${site.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) { setError(json.message ?? "Erreur"); return; }
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setDeleting(false);
    }
  }

  function handleDownload() {
    const canvas = qrRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${site.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h3 className="font-semibold text-card-foreground">{site.name}</h3>
        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>

      <div className="grid gap-6 p-5 sm:grid-cols-2">
        {/* Infos */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="font-mono text-xs">
              {site.latitude.toFixed(6)}, {site.longitude.toFixed(6)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Radius className="h-4 w-4 shrink-0" />
            <span>Rayon : {site.radius}m</span>
          </div>
          {site.wifi_ssid && wifiEnabled && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wifi className="h-4 w-4 shrink-0" />
              <span>{site.wifi_ssid}</span>
            </div>
          )}
          {!wifiEnabled && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Vérification Wi-Fi non disponible sur votre plan.
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={regenerating}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-60"
            >
              {regenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Régénérer QR
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Supprimer
            </button>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
            <QRCodeCanvas ref={qrRef} value={token} size={140} level="M" includeMargin={false} />
          </div>
          <p className="max-w-[140px] break-all text-center font-mono text-[9px] text-muted-foreground">
            {token}
          </p>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            Télécharger
          </button>
        </div>
      </div>
    </div>
  );
}
