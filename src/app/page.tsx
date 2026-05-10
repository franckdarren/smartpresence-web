import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "SmartPresence — Gestion de présence QR Code + GPS",
  description: "SmartPresence remplace les feuilles de présence par un pointage QR Code + GPS + Wi-Fi. Conçu pour les entreprises africaines, des PME aux grands groupes.",
};

export default function Home() {
  return <LandingPage />;
}
