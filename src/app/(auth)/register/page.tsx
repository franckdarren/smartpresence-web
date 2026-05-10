"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand-logo";
import { MapPin, Loader2, Eye, EyeOff } from "lucide-react";

type Step = 1 | 2;

interface FormData {
  name: string;
  email: string;
  password: string;
  company_name: string;
  latitude: string;
  longitude: string;
}

const INITIAL: FormData = {
  name: "",
  email: "",
  password: "",
  company_name: "",
  latitude: "",
  longitude: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validateStep1(): string | null {
    if (form.name.trim().length < 2) return "Le nom doit contenir au moins 2 caractères.";
    if (!form.email.includes("@")) return "Adresse e-mail invalide.";
    if (form.password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    if (!/[A-Z]/.test(form.password)) return "Le mot de passe doit contenir une majuscule.";
    if (!/[0-9]/.test(form.password)) return "Le mot de passe doit contenir un chiffre.";
    return null;
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError(null);
    setStep(2);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Géolocalisation non disponible sur ce navigateur.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("latitude", String(pos.coords.latitude));
        set("longitude", String(pos.coords.longitude));
        setLocating(false);
        setError(null);
      },
      () => {
        setError("Impossible d'obtenir la position. Entrez les coordonnées manuellement.");
        setLocating(false);
      }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.company_name.trim().length < 2) {
      setError("Le nom de l'entreprise doit contenir au moins 2 caractères.");
      return;
    }
    if (!form.latitude || !form.longitude) {
      setError("Veuillez renseigner la position GPS de votre entreprise.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:         form.name.trim(),
          email:        form.email.trim().toLowerCase(),
          password:     form.password,
          company_name: form.company_name.trim(),
          latitude:     parseFloat(form.latitude),
          longitude:    parseFloat(form.longitude),
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.message ?? "Une erreur est survenue.");
        setLoading(false);
        return;
      }

      // Connexion automatique après inscription
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (signInError) {
        setError("Compte créé. Connectez-vous maintenant.");
        router.push("/login");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <BrandLogo size={48} showName={false} />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Démarrer gratuitement
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              30 jours d&apos;essai — sans engagement, sans carte bancaire
            </p>
          </div>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex items-center gap-3 mb-6">
          {([1, 2] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  s < step
                    ? "bg-primary text-primary-foreground"
                    : s === step
                    ? "border-2 border-primary text-primary"
                    : "border-2 border-border text-muted-foreground"
                }`}
              >
                {s < step ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s
                )}
              </div>
              <span className={`text-xs font-medium ${s === step ? "text-foreground" : "text-muted-foreground"}`}>
                {s === 1 ? "Votre compte" : "Votre entreprise"}
              </span>
              {s === 1 && <div className={`h-px flex-1 ${step > 1 ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          {/* ── Étape 1 ─────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nom complet
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Jean Dupont"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="vous@entreprise.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="Min. 8 caractères, 1 majuscule, 1 chiffre"
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  8 caractères minimum, 1 majuscule, 1 chiffre
                </p>
              </div>

              {error && <ErrorBox message={error} />}

              <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition">
                Continuer →
              </button>
            </form>
          )}

          {/* ── Étape 2 ─────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nom de l&apos;entreprise
                </label>
                <input
                  type="text"
                  required
                  value={form.company_name}
                  onChange={(e) => set("company_name", e.target.value)}
                  placeholder="Acme Corp"
                  className={inputCls}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    Position GPS du bureau
                  </label>
                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline disabled:opacity-50"
                  >
                    {locating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <MapPin className="h-3 w-3" />
                    )}
                    {locating ? "Localisation…" : "Utiliser ma position"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.latitude}
                      onChange={(e) => set("latitude", e.target.value)}
                      placeholder="Latitude (ex: 4.05)"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.longitude}
                      onChange={(e) => set("longitude", e.target.value)}
                      placeholder="Longitude (ex: 9.70)"
                      className={inputCls}
                    />
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Utilisé pour valider que les employés pointent bien depuis le bureau (rayon 100m).
                </p>
              </div>

              {error && <ErrorBox message={error} />}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(null); }}
                  className="flex-1 py-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition"
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Création…
                    </span>
                  ) : (
                    "Créer mon compte"
                  )}
                </button>
              </div>

              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                En créant un compte, vous acceptez nos{" "}
                <span className="underline cursor-pointer">Conditions d&apos;utilisation</span>
                {" "}et notre{" "}
                <span className="underline cursor-pointer">Politique de confidentialité</span>.
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-3">
          © {new Date().getFullYear()} SmartPresence
        </p>
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/20 px-3.5 py-3">
      <svg className="w-4 h-4 text-destructive mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}
