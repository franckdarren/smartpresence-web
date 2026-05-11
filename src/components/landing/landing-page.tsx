"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

// ── Design tokens (CSS variables — switch via .dark class) ─────────────────
const T = {
  bg: "var(--lp-bg)",
  ink: "var(--lp-ink)",
  muted: "var(--lp-muted)",
  line: "var(--lp-line)",
  soft: "var(--lp-soft)",
  accent: "var(--lp-accent)",
  accentDark: "var(--lp-accent-dark)",
  navy: "var(--lp-navy)",
};

// ── Static content ─────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Comment ça marche", href: "#how" },
  { label: "Tarifs", href: "#pricing" },
  { label: "Sécurité", href: "#security" },
  { label: "FAQ", href: "#faq" },
];

const FEATURES = [
  { icon: "qr" as const, title: "Pointage par QR Code", desc: "Un QR unique par site. Scan instantané depuis l'app mobile, aucun matériel additionnel." },
  { icon: "gps" as const, title: "Géolocalisation 100m", desc: "Vérification du rayon GPS autour du site. Les pointages à distance sont automatiquement bloqués." },
  { icon: "wifi" as const, title: "Vérification Wi-Fi", desc: "Double contrôle facultatif via le SSID de l'entreprise. Idéal pour les bureaux et bâtiments fermés." },
  { icon: "clock" as const, title: "Heures d'arrivée & départ", desc: "Enregistrement automatique du check-in et check-out, avec coordonnées et réseau Wi-Fi associés." },
  { icon: "shield" as const, title: "Multi-tenant sécurisé", desc: "Chaque entreprise est isolée. Row Level Security et JWT pour chaque requête." },
  { icon: "api" as const, title: "API REST complète", desc: "Intégrez SmartPresence à votre SIRH, votre paie ou vos outils métier via une API documentée." },
];

const STEPS = [
  { n: "01", title: "L'admin configure son site", desc: "Position GPS, rayon de pointage, SSID Wi-Fi (optionnel). Un QR Code unique est généré." },
  { n: "02", title: "L'employé scanne le QR", desc: "Depuis l'application mobile, en arrivant au bureau ou sur le chantier. Aucun login complexe." },
  { n: "03", title: "Le pointage est validé", desc: "GPS + Wi-Fi vérifiés en moins d'une seconde. L'historique est synchronisé en temps réel." },
];

const PLANS = [
  {
    name: "Starter", price: "25 000",
    target: "Petites entreprises, commerces, restaurants, ONG",
    features: ["Jusqu'à 15 employés", "1 site / 1 QR Code", "Pointage GPS + Wi-Fi", "Dashboard admin basique", "Support email"],
    cta: "Commencer", popular: false,
  },
  {
    name: "Business", price: "65 000",
    target: "PME, écoles, cliniques, agences",
    features: ["Jusqu'à 50 employés", "Jusqu'à 3 sites / 3 QR Codes", "Pointage GPS + Wi-Fi", "Dashboard complet + exports Excel", "Historique 12 mois", "Support WhatsApp"],
    cta: "Choisir Business", popular: true,
  },
  {
    name: "Enterprise", price: "150 000",
    target: "Grands groupes, banques, filiales pétrolières",
    features: ["Employés illimités", "Sites & QR Codes illimités", "API REST complète", "Rapports avancés + exports personnalisés", "Historique illimité", "Support téléphonique dédié + onboarding"],
    cta: "Parler aux ventes", popular: false,
  },
];

const FAQ_ITEMS = [
  { q: "Comment fonctionne la vérification GPS ?", a: "Lors du scan, l'application envoie la position de l'employé au serveur. Nous calculons la distance Haversine avec le site configuré. Si elle dépasse le rayon (100m par défaut), le pointage est refusé." },
  { q: "Et si l'employé n'est pas connecté au Wi-Fi de l'entreprise ?", a: "La vérification Wi-Fi est optionnelle, par site. Si vous l'activez, le SSID envoyé doit correspondre. Sinon, le pointage repose uniquement sur la géolocalisation." },
  { q: "Quels modes de paiement acceptez-vous ?", a: "Mobile Money (Airtel Money, Moov Money) en priorité. Virements bancaires et cartes acceptés sur demande. La facturation annuelle offre 2 mois gratuits." },
  { q: "Puis-je dépasser la limite d'employés de mon plan ?", a: "Oui, chaque employé supplémentaire au-delà du palier coûte 2 000 FCFA / mois. Vous pouvez aussi passer au plan supérieur à tout moment depuis votre dashboard." },
  { q: "Mes données sont-elles en sécurité ?", a: "Hébergement chiffré, isolation multi-tenant via Row Level Security, JWT pour chaque appel API. Les pointages d'une entreprise ne sont jamais visibles par une autre." },
  { q: "Existe-t-il une période d'essai ?", a: "Oui. Un mois gratuit pour tester l'ensemble des fonctionnalités, sans engagement et sans carte bancaire requise." },
];

// ── SVG Icons ──────────────────────────────────────────────────────────────
type IconName = "qr" | "gps" | "wifi" | "clock" | "shield" | "api" | "check" | "arrow" | "menu" | "x";

function Icon({ name, size = 20, stroke = "currentColor", strokeWidth = 1.5 }: {
  name: IconName; size?: number; stroke?: string; strokeWidth?: number;
}) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "qr": return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v3M14 21h7"/></svg>;
    case "gps": return <svg {...p}><circle cx="12" cy="11" r="3"/><path d="M12 2a8 8 0 0 1 8 8c0 5.5-8 12-8 12S4 15.5 4 10a8 8 0 0 1 8-8z"/></svg>;
    case "wifi": return <svg {...p}><path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1" fill={stroke}/></svg>;
    case "clock": return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "shield": return <svg {...p}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>;
    case "api": return <svg {...p}><path d="M8 3v4M16 3v4M8 17v4M16 17v4M3 8h4M3 16h4M17 8h4M17 16h4"/><rect x="7" y="7" width="10" height="10" rx="2"/></svg>;
    case "check": return <svg {...p}><path d="M5 12l5 5L20 7"/></svg>;
    case "arrow": return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "menu": return <svg {...p}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
    case "x": return <svg {...p}><path d="M18 6L6 18M6 6l12 12"/></svg>;
    default: return null;
  }
}

// ── Logo mark ──────────────────────────────────────────────────────────────
function LogoMark({ size = 28 }: { size?: number }) {
  const r = Math.round(size * 0.28);
  const sq = Math.round(size * 10 / 32);
  const off = Math.round(size * 5 / 32);
  return (
    <div style={{ width: size, height: size, borderRadius: r, background: T.navy, position: "relative", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: off, left: off, width: sq, height: sq, background: T.accent, borderRadius: 2 }} />
      <div style={{ position: "absolute", top: off, right: off, width: sq, height: sq, background: "#fff", borderRadius: 2 }} />
      <div style={{ position: "absolute", bottom: off, left: off, width: sq, height: sq, background: "#fff", borderRadius: 2 }} />
    </div>
  );
}

// ── Phone mock ─────────────────────────────────────────────────────────────
function PhoneMock() {
  const corners = [
    { pos: { top: 30, left: 30 } as CSSProperties, bT: true, bL: true },
    { pos: { top: 30, right: 30 } as CSSProperties, bT: true, bR: true },
    { pos: { bottom: 30, left: 30 } as CSSProperties, bB: true, bL: true },
    { pos: { bottom: 30, right: 30 } as CSSProperties, bB: true, bR: true },
  ];
  return (
    <div style={{ width: 280, height: 560, borderRadius: 44, background: T.navy, padding: 12, boxShadow: "0 30px 60px -20px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.06)", position: "relative" }}>
      <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 100, height: 22, background: "#000", borderRadius: 14, zIndex: 2 }} />
      <div style={{ width: "100%", height: "100%", borderRadius: 32, background: "#0F1A2E", overflow: "hidden", display: "flex", flexDirection: "column", padding: "44px 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff", fontSize: 11, marginBottom: 18 }}>
          <span style={{ fontWeight: 600 }}>9:41</span>
          <span style={{ width: 16, height: 10, border: "1px solid #fff", borderRadius: 2, position: "relative", display: "inline-block" }}>
            <span style={{ position: "absolute", inset: 1, background: "#fff", width: "70%", borderRadius: 1 }} />
          </span>
        </div>
        <div style={{ color: "rgba(255,255,255,.6)", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>SmartPresence</div>
        <div style={{ color: "#fff", fontSize: 22, fontWeight: 600, lineHeight: 1.15, marginBottom: 20 }}>Scannez le QR<br />de votre site</div>
        <div style={{ flex: 1, borderRadius: 18, background: "#000", border: "1px solid rgba(255,255,255,.08)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 150, height: 150, background: "#fff", padding: 10, borderRadius: 6 }}>
            <div style={{ width: "100%", height: "100%", backgroundImage: "radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px)", backgroundSize: "8px 8px", backgroundPosition: "0 0, 4px 4px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 28, height: 28, border: "5px solid #000", background: "#fff" }}><div style={{ position: "absolute", inset: 4, background: "#000" }} /></div>
              <div style={{ position: "absolute", top: 0, right: 0, width: 28, height: 28, border: "5px solid #000", background: "#fff" }}><div style={{ position: "absolute", inset: 4, background: "#000" }} /></div>
              <div style={{ position: "absolute", bottom: 0, left: 0, width: 28, height: 28, border: "5px solid #000", background: "#fff" }}><div style={{ position: "absolute", inset: 4, background: "#000" }} /></div>
            </div>
          </div>
          {corners.map((c, i) => (
            <div key={i} style={{ position: "absolute", width: 26, height: 26, ...c.pos, borderTop: c.bT ? `3px solid ${T.accent}` : "none", borderBottom: c.bB ? `3px solid ${T.accent}` : "none", borderLeft: c.bL ? `3px solid ${T.accent}` : "none", borderRight: c.bR ? `3px solid ${T.accent}` : "none", borderRadius: 6 }} />
          ))}
          <div style={{ position: "absolute", top: "30%", left: "10%", right: "10%", height: 2, background: T.accent, boxShadow: `0 0 12px ${T.accent}`, opacity: 0.85 }} />
        </div>
        <div style={{ marginTop: 18, padding: "14px 16px", background: T.accent, color: "#001b10", borderRadius: 14, fontWeight: 600, fontSize: 14, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="check" size={18} stroke="#001b10" strokeWidth={2.5} />
          Pointage validé · 08:42
        </div>
        <div style={{ marginTop: 10, color: "rgba(255,255,255,.6)", fontSize: 11, textAlign: "center" }}>GPS · 12m · Wi-Fi Office vérifié</div>
      </div>
    </div>
  );
}

// ── Dashboard mock ─────────────────────────────────────────────────────────
function DashboardMock() {
  const rows = [
    { n: "Aïcha N.", in: "08:42", out: "—", st: "Présent" },
    { n: "Moussa K.", in: "08:51", out: "—", st: "Présent" },
    { n: "Tania B.", in: "09:14", out: "—", st: "Retard" },
    { n: "Jules O.", in: "08:35", out: "12:32", st: "Pause" },
    { n: "Fatou S.", in: "—", out: "—", st: "Absent" },
  ];
  const stats = [
    { l: "Présents", v: "42", sub: "/48", color: T.accent, pct: "87%" },
    { l: "En retard", v: "3", sub: "≥ 9:00", color: "#f59e0b", pct: "30%" },
    { l: "Absents", v: "3", sub: "non pointés", color: "#ef4444", pct: "20%" },
  ];
  const badgeColor = (st: string) => ({
    bg: st === "Présent" ? "#10b98122" : st === "Retard" ? "#f59e0b22" : st === "Pause" ? "#94a3b822" : "#ef444422",
    fg: st === "Présent" ? T.accent : st === "Retard" ? "#b45309" : st === "Pause" ? "#475569" : "#b91c1c",
  });
  return (
    <div style={{ width: 620, borderRadius: 14, background: T.bg, border: `1px solid ${T.line}`, boxShadow: "var(--lp-dash-shadow)", overflow: "hidden", fontFamily: "inherit" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${T.line}`, background: T.bg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: "#ef4444" }} />
          <div style={{ width: 8, height: 8, borderRadius: 4, background: "#f59e0b" }} />
          <div style={{ width: 8, height: 8, borderRadius: 4, background: "#10b981" }} />
          <span style={{ fontSize: 12, color: T.muted, marginLeft: 12 }}>app.smartpresence.io / dashboard</span>
        </div>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: T.accent, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>A</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", minHeight: 360 }}>
        <div style={{ background: T.soft, borderRight: `1px solid ${T.line}`, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 10, color: T.muted, padding: "0 8px 8px", textTransform: "uppercase", letterSpacing: 1 }}>Menu</div>
          {[{ l: "Dashboard", active: true }, { l: "Employés" }, { l: "Présences" }, { l: "Paramètres" }].map((it, i) => (
            <div key={i} style={{ padding: "8px 10px", borderRadius: 6, fontSize: 12, color: it.active ? T.ink : T.muted, background: it.active ? "var(--lp-active-item)" : "transparent", border: it.active ? `1px solid ${T.line}` : "1px solid transparent", fontWeight: it.active ? 600 : 500 }}>{it.l}</div>
          ))}
        </div>
        <div style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: T.ink }}>Présence aujourd&apos;hui</div>
              <div style={{ fontSize: 11, color: T.muted }}>Lundi 12 mai 2026 · Site Libreville</div>
            </div>
            <div style={{ fontSize: 11, color: T.muted, padding: "4px 8px", border: `1px solid ${T.line}`, borderRadius: 999 }}>Temps réel</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
            {stats.map((c, i) => (
              <div key={i} style={{ padding: 12, border: `1px solid ${T.line}`, borderRadius: 8, background: T.bg }}>
                <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: .8 }}>{c.l}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: T.ink }}>{c.v}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{c.sub}</div>
                </div>
                <div style={{ height: 3, background: "var(--lp-bar-track)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: c.pct, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ border: `1px solid ${T.line}`, borderRadius: 8, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr .8fr", padding: "8px 12px", fontSize: 10, color: T.muted, background: T.soft, textTransform: "uppercase", letterSpacing: .8, fontWeight: 600 }}>
              <div>Employé</div><div>Arrivée</div><div>Sortie</div><div>Statut</div>
            </div>
            {rows.map((r, i) => {
              const { bg, fg } = badgeColor(r.st);
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr .8fr", padding: "10px 12px", fontSize: 12, color: T.ink, borderTop: `1px solid ${T.line}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: T.soft, border: `1px solid ${T.line}`, fontSize: 10, fontWeight: 600, color: T.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>{r.n[0]}</div>
                    {r.n}
                  </div>
                  <div style={{ color: T.muted }}>{r.in}</div>
                  <div style={{ color: T.muted }}>{r.out}</div>
                  <div><span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 600, background: bg, color: fg }}>{r.st}</span></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sections ───────────────────────────────────────────────────────────────
function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <header className="lp-nav" style={{ borderBottom: `1px solid ${T.line}`, background: T.bg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LogoMark />
          <span style={{ fontSize: 17, fontWeight: 600, color: T.ink, letterSpacing: -0.2 }}>SmartPresence</span>
        </div>
        <nav className="lp-nav-links">
          {NAV_LINKS.map(n => (
            <a key={n.href} href={n.href} style={{ fontSize: 14, color: T.muted, textDecoration: "none", fontWeight: 500 }}>{n.label}</a>
          ))}
        </nav>
        <div className="lp-nav-actions">
          <a href="/login" className="lp-nav-login" style={{ fontSize: 14, fontWeight: 500, color: T.ink, textDecoration: "none" }}>Connexion</a>
          <a href="/register" style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: T.navy, padding: "10px 16px", borderRadius: 8, textDecoration: "none" }}>Essai gratuit</a>
        </div>
        <button
          className="lp-mobile-menu-btn"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          style={{ color: T.ink }}
        >
          <Icon name={menuOpen ? "x" : "menu"} size={24} stroke={T.ink} />
        </button>
      </header>
      <div className={`lp-mobile-menu${menuOpen ? " lp-open" : ""}`} style={{ background: T.bg, borderBottom: menuOpen ? `1px solid ${T.line}` : "none" }}>
        {NAV_LINKS.map(n => (
          <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)}
            style={{ fontSize: 15, color: T.ink, textDecoration: "none", fontWeight: 500, padding: "12px 0", borderBottom: `1px solid ${T.line}` }}>
            {n.label}
          </a>
        ))}
        <div style={{ display: "flex", gap: 8, paddingTop: 14 }}>
          <a href="/login" style={{ flex: 1, textAlign: "center", padding: "11px", color: T.ink, textDecoration: "none", fontWeight: 500, fontSize: 14, border: `1px solid ${T.line}`, borderRadius: 8 }}>Connexion</a>
          <a href="/register" style={{ flex: 1, textAlign: "center", padding: "11px", color: "#fff", background: T.navy, textDecoration: "none", fontWeight: 600, fontSize: 14, borderRadius: 8 }}>Essai gratuit</a>
        </div>
      </div>
    </>
  );
}

function Hero() {
  return (
    <section className="lp-hero-section" style={{ background: T.bg }}>
      <div className="lp-hero-grid">
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, border: `1px solid ${T.line}`, fontSize: 12, color: T.muted, marginBottom: 24, fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: T.accent, display: "inline-block" }} />
            Nouveau · Application mobile disponible sur Android
          </div>
          <h1 className="lp-hero-h1" style={{ fontWeight: 600, lineHeight: 1.05, color: T.ink, margin: 0 }}>
            La présence<br />de vos équipes,<br />
            <span style={{ color: T.muted }}>vérifiée au mètre près.</span>
          </h1>
          <p className="lp-hero-desc" style={{ lineHeight: 1.6, color: T.muted, maxWidth: 520, marginTop: 24, marginBottom: 0 }}>
            SmartPresence remplace les feuilles de présence et les badgeuses par un pointage QR Code + GPS + Wi-Fi. Conçu pour les entreprises africaines, des PME aux grands groupes.
          </p>
          <div className="lp-hero-actions">
            <a href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 22px", background: T.navy, color: "#fff", borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
              Démarrer 1 mois gratuit
              <Icon name="arrow" size={16} stroke="#fff" strokeWidth={2} />
            </a>
            <a href="#features" style={{ display: "inline-flex", alignItems: "center", padding: "14px 22px", color: T.ink, borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: "none", border: `1px solid ${T.line}` }}>
              Voir une démo
            </a>
          </div>
          <div className="lp-hero-stats" style={{ borderTop: `1px solid ${T.line}` }}>
            {[{ v: "< 1s", l: "Validation de pointage" }, { v: "100m", l: "Rayon GPS par site" }, { v: "API", l: "REST documentée" }].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 22, fontWeight: 600, color: T.ink, letterSpacing: -0.5 }}>{s.v}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lp-hero-visual">
          <div style={{ position: "absolute", top: 20, right: 0 }}>
            <DashboardMock />
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, transform: "rotate(-4deg)" }}>
            <PhoneMock />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(${T.line} 1px, transparent 1px)`, backgroundSize: "24px 24px", WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)", opacity: 0.5, zIndex: -1 }} />
    </section>
  );
}

function Steps() {
  return (
    <section id="how" className="lp-section" style={{ background: T.soft, borderTop: `1px solid ${T.line}` }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ fontSize: 12, color: T.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Comment ça marche</div>
        <h2 className="lp-section-h2" style={{ fontWeight: 600, color: T.ink, margin: 0, maxWidth: 720 }}>
          Trois étapes pour digitaliser le pointage de votre entreprise.
        </h2>
        <div className="lp-steps-grid">
          {STEPS.map((s, i) => (
            <div key={i} style={{ padding: 32, background: T.bg, borderRadius: 14, border: `1px solid ${T.line}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                <span style={{ fontSize: 32, fontWeight: 600, color: T.accent, fontVariantNumeric: "tabular-nums" }}>{s.n}</span>
                <span style={{ width: 32, height: 1, background: T.line, display: "inline-block" }} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: T.ink, margin: 0, letterSpacing: -0.3 }}>{s.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: T.muted, marginTop: 10, marginBottom: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="lp-section" style={{ background: T.bg }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="lp-features-header">
          <div>
            <div style={{ fontSize: 12, color: T.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Fonctionnalités</div>
            <h2 className="lp-section-h2" style={{ fontWeight: 600, color: T.ink, margin: 0 }}>
              Tout ce qu&apos;il faut pour suivre la présence.
            </h2>
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: T.muted, alignSelf: "end", margin: 0 }}>
            Pensé pour fonctionner sur le terrain : connexion intermittente, multi-sites, chantiers ou bureaux. Pas de matériel à acheter, pas d&apos;installation lourde.
          </p>
        </div>
        <div className="lp-features-grid" style={{ background: T.line, border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden" }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ padding: 32, background: T.bg, minHeight: 200 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#10b98114", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <Icon name={f.icon} size={20} stroke={T.accent} strokeWidth={1.75} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: T.ink, margin: 0, letterSpacing: -0.2 }}>{f.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: T.muted, marginTop: 8, marginBottom: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Security() {
  const badges = [
    { t: "Chiffrement TLS 1.3", d: "Toutes les communications API et mobile sont chiffrées de bout en bout." },
    { t: "Row Level Security", d: "PostgreSQL applique les politiques d'isolation au niveau de la base." },
    { t: "JWT par requête", d: "Chaque appel API vérifie l'identité et l'entreprise de l'utilisateur." },
    { t: "Conformité RGPD", d: "Hébergement régional, droit à l'oubli et exports complets sur demande." },
  ];
  return (
    <section id="security" className="lp-security-section" style={{ background: T.navy, color: "#fff" }}>
      <div className="lp-security-inner">
        <div>
          <div style={{ fontSize: 12, color: T.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Sécurité & conformité</div>
          <h2 className="lp-section-h2" style={{ fontWeight: 600, letterSpacing: -1, margin: 0, lineHeight: 1.1 }}>
            Vos données restent les vôtres. Isolation stricte par entreprise.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,.65)", marginTop: 20, maxWidth: 480, marginBottom: 0 }}>
            SmartPresence est multi-tenant par conception. Chaque pointage est rattaché à votre entreprise via Row Level Security PostgreSQL et JWT signés.
          </p>
        </div>
        <div className="lp-security-badges" style={{ background: "rgba(255,255,255,.08)", borderRadius: 14, overflow: "hidden" }}>
          {badges.map((b, i) => (
            <div key={i} style={{ padding: 24, background: T.navy }}>
              <Icon name="shield" size={20} stroke={T.accent} strokeWidth={1.75} />
              <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 14, marginBottom: 6 }}>{b.t}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,.6)", margin: 0 }}>{b.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="lp-section" style={{ background: T.bg }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: T.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Tarifs</div>
          <h2 className="lp-section-h2" style={{ fontWeight: 600, color: T.ink, margin: 0 }}>Simple. Transparent. Sans engagement.</h2>
          <p style={{ fontSize: 16, color: T.muted, marginTop: 14, maxWidth: 560, marginLeft: "auto", marginRight: "auto", marginBottom: 0 }}>
            1 mois gratuit pour tester. Paiement annuel : 2 mois offerts. Mobile Money (Airtel Money, Moov Money) accepté.
          </p>
          <div style={{ display: "inline-flex", marginTop: 28, padding: 4, background: T.soft, borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
            <span style={{ padding: "8px 16px", borderRadius: 8, background: T.bg, color: T.ink, boxShadow: `0 0 0 1px ${T.line}` }}>Mensuel</span>
            <span style={{ padding: "8px 16px", color: T.muted, display: "inline-flex", alignItems: "center", gap: 6 }}>
              Annuel
              <span style={{ fontSize: 10, padding: "2px 6px", background: "#10b98122", color: T.accentDark, borderRadius: 999 }}>−2 mois</span>
            </span>
          </div>
        </div>
        <div className="lp-pricing-grid">
          {PLANS.map((p, i) => (
            <div key={i} style={{ padding: 32, borderRadius: 16, background: p.popular ? T.navy : T.bg, color: p.popular ? "#fff" : T.ink, border: p.popular ? "1px solid transparent" : `1px solid ${T.line}`, position: "relative" }}>
              {p.popular && (
                <span style={{ position: "absolute", top: -10, right: 24, padding: "4px 10px", background: T.accent, color: "#001b10", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: .5 }}>POPULAIRE</span>
              )}
              <div style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: p.popular ? "rgba(255,255,255,.6)" : T.muted, marginTop: 4, minHeight: 36 }}>{p.target}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 24, paddingBottom: 24, borderBottom: p.popular ? "1px solid rgba(255,255,255,.1)" : `1px solid ${T.line}` }}>
                <span style={{ fontSize: 38, fontWeight: 600, letterSpacing: -1 }}>{p.price}</span>
                <span style={{ fontSize: 13, color: p.popular ? "rgba(255,255,255,.6)" : T.muted }}>FCFA / mois</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "24px 0", display: "flex", flexDirection: "column", gap: 10 }}>
                {p.features.map((f, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14 }}>
                    <Icon name="check" size={16} stroke={T.accent} strokeWidth={2.25} />
                    <span style={{ color: p.popular ? "rgba(255,255,255,.85)" : T.ink }}>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="/register" style={{ display: "block", textAlign: "center", padding: "12px 16px", borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: "none", background: p.popular ? T.accent : T.bg, color: p.popular ? "#001b10" : T.ink, border: p.popular ? "none" : `1px solid ${T.line}` }}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
        <div className="lp-pricing-addon" style={{ marginTop: 24, padding: "16px 24px", background: T.soft, border: `1px solid ${T.line}`, borderRadius: 10, fontSize: 13, color: T.muted }}>
          <span><strong style={{ color: T.ink }}>Add-on</strong> · Au-delà du palier : +2 000 FCFA / employé supplémentaire / mois.</span>
          <span>Tous les plans · Mobile Money accepté</span>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="lp-section" style={{ background: T.soft }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: T.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>FAQ</div>
          <h2 className="lp-section-h2" style={{ fontWeight: 600, color: T.ink, margin: 0 }}>Questions fréquentes</h2>
        </div>
        <div style={{ background: T.bg, border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden" }}>
          {FAQ_ITEMS.map((f, i) => (
            <details key={i} style={{ borderTop: i ? `1px solid ${T.line}` : "none" }}>
              <summary style={{ padding: "20px 24px", fontSize: 16, fontWeight: 600, color: T.ink, cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{f.q}</span>
                <span className="faq-toggle" style={{ width: 24, height: 24, borderRadius: 12, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, fontSize: 18, lineHeight: "1", flexShrink: 0 }}>+</span>
              </summary>
              <div style={{ padding: "0 24px 20px", fontSize: 14, lineHeight: 1.65, color: T.muted, maxWidth: 720 }}>{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="lp-cta-section" style={{ background: T.bg }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="lp-cta-inner" style={{ background: T.navy, color: "#fff" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, #10b98133, transparent 70%)" }} />
          <div className="lp-cta-grid">
            <div>
              <h2 className="lp-cta-h2" style={{ fontWeight: 600, margin: 0, lineHeight: 1.05 }}>
                Essayez SmartPresence gratuitement<br />pendant 1 mois.
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,.7)", marginTop: 16, maxWidth: 460, marginBottom: 0 }}>
                Aucune carte bancaire requise. Annulation à tout moment. Migration depuis Excel ou autre solution incluse.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="/register" style={{ padding: "16px 24px", background: T.accent, color: "#001b10", borderRadius: 10, fontWeight: 600, fontSize: 15, textAlign: "center", textDecoration: "none" }}>Démarrer gratuitement</a>
              <a href="#features" style={{ padding: "16px 24px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, fontWeight: 600, fontSize: 15, textAlign: "center", textDecoration: "none" }}>Planifier une démo</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { t: "Produit", links: ["Fonctionnalités", "Tarifs", "API", "Sécurité"] },
    { t: "Entreprise", links: ["À propos", "Clients", "Carrières", "Contact"] },
    { t: "Ressources", links: ["Documentation", "Guides", "Blog", "Status"] },
    { t: "Légal", links: ["Mentions", "Confidentialité", "CGU", "RGPD"] },
  ];
  return (
    <footer className="lp-footer" style={{ background: T.bg, borderTop: `1px solid ${T.line}`, color: T.muted }}>
      <div className="lp-footer-grid">
        <div className="lp-footer-brand">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <LogoMark size={24} />
            <span style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>SmartPresence</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 280, margin: 0 }}>
            La plateforme de pointage QR + GPS conçue pour les entreprises africaines.
          </p>
        </div>
        {cols.map((c, i) => (
          <div key={i}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>{c.t}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {c.links.map((l, j) => <li key={j} style={{ fontSize: 13 }}>{l}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="lp-footer-bottom" style={{ borderTop: `1px solid ${T.line}` }}>
        <span>© 2026 SmartPresence · Tous droits réservés</span>
        <span>SANTEGAB</span>
      </div>
    </footer>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function LandingPage() {
  return (
    <div style={{ background: T.bg, color: T.ink, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", width: "100%", fontFeatureSettings: '"ss01", "cv11"' }}>
      <Nav />
      <Hero />
      <Steps />
      <Features />
      <Security />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
