import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ReportData } from "../reports.service";

const BRAND = "#6366f1"; // indigo-500
const BRAND_LIGHT = "#eef2ff"; // indigo-50
const GRAY_900 = "#0f172a";
const GRAY_600 = "#475569";
const GRAY_400 = "#94a3b8";
const GRAY_100 = "#f1f5f9";
const BORDER = "#e2e8f0";
const GREEN = "#16a34a";
const ORANGE = "#d97706";
const RED = "#dc2626";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: GRAY_900,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  // ── Header ────────────────────────────────────────────────
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  headerLeft: { flexDirection: "column" },
  badge: {
    backgroundColor: BRAND,
    color: "#fff",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: GRAY_900 },
  subtitle: { fontSize: 10, color: GRAY_600, marginTop: 3 },
  metaRight: { alignItems: "flex-end" },
  metaLabel: { fontSize: 8, color: GRAY_400 },
  metaValue: { fontSize: 9, color: GRAY_600, marginTop: 1 },
  divider: { borderTop: `1 solid ${BORDER}`, marginBottom: 20 },
  // ── Summary cards ─────────────────────────────────────────
  cardsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  card: {
    flex: 1,
    backgroundColor: GRAY_100,
    borderRadius: 6,
    padding: 12,
    border: `1 solid ${BORDER}`,
  },
  cardLabel: { fontSize: 8, color: GRAY_600, fontFamily: "Helvetica" },
  cardValue: { fontSize: 20, fontFamily: "Helvetica-Bold", color: GRAY_900, marginTop: 4 },
  cardSub: { fontSize: 8, color: GRAY_400, marginTop: 2 },
  // ── Section title ─────────────────────────────────────────
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: GRAY_900,
    marginBottom: 8,
    paddingBottom: 5,
    borderBottom: `1 solid ${BORDER}`,
  },
  // ── Table ─────────────────────────────────────────────────
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND_LIGHT,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: `1 solid ${GRAY_100}`,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: GRAY_100,
    borderBottom: `1 solid ${BORDER}`,
  },
  colName: { width: "28%", fontSize: 9 },
  colEmail: { width: "28%", fontSize: 8, color: GRAY_600 },
  colDays: { width: "11%", fontSize: 9, textAlign: "center" },
  colHours: { width: "11%", fontSize: 9, textAlign: "center" },
  colRate: { width: "11%", fontSize: 9, textAlign: "center" },
  colStatus: { width: "11%", fontSize: 9, textAlign: "center" },
  headerCell: { fontFamily: "Helvetica-Bold", fontSize: 8, color: BRAND },
  rateHigh: { color: GREEN },
  rateMid: { color: ORANGE },
  rateLow: { color: RED },
  // ── Footer ────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1 solid ${BORDER}`,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: GRAY_400 },
});

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

function rateStyle(rate: number) {
  if (rate >= 80) return s.rateHigh;
  if (rate >= 50) return s.rateMid;
  return s.rateLow;
}

interface Props {
  data: ReportData;
}

export function ReportDocument({ data }: Props) {
  return (
    <Document
      title={`Rapport de présences — ${data.companyName}`}
      author="SmartPresence"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Text style={s.badge}>SMARTPRESENCE</Text>
            <Text style={s.title}>{data.companyName}</Text>
            <Text style={s.subtitle}>
              Rapport de présences · {formatDate(data.from)} – {formatDate(data.to)}
            </Text>
          </View>
          <View style={s.metaRight}>
            <Text style={s.metaLabel}>Généré le</Text>
            <Text style={s.metaValue}>{formatDate(data.generatedAt)}</Text>
            <Text style={[s.metaLabel, { marginTop: 6 }]}>Jours ouvrés</Text>
            <Text style={s.metaValue}>{data.workingDays} jours</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Summary cards */}
        <View style={s.cardsRow}>
          <View style={s.card}>
            <Text style={s.cardLabel}>Employés</Text>
            <Text style={s.cardValue}>{data.totalEmployees}</Text>
            <Text style={s.cardSub}>dans la période</Text>
          </View>
          <View style={s.card}>
            <Text style={s.cardLabel}>Taux moyen</Text>
            <Text style={[s.cardValue, rateStyle(data.avgPresenceRate)]}>
              {data.avgPresenceRate}%
            </Text>
            <Text style={s.cardSub}>de présence</Text>
          </View>
          <View style={s.card}>
            <Text style={s.cardLabel}>Jours ouvrés</Text>
            <Text style={s.cardValue}>{data.workingDays}</Text>
            <Text style={s.cardSub}>lun. – ven.</Text>
          </View>
        </View>

        {/* Table */}
        <Text style={s.sectionTitle}>Détail par employé</Text>

        {/* Table header */}
        <View style={s.tableHeader}>
          <Text style={[s.colName, s.headerCell]}>Employé</Text>
          <Text style={[s.colEmail, s.headerCell]}>Email</Text>
          <Text style={[s.colDays, s.headerCell]}>Présent</Text>
          <Text style={[s.colDays, s.headerCell]}>Absent</Text>
          <Text style={[s.colHours, s.headerCell]}>Heures</Text>
          <Text style={[s.colRate, s.headerCell]}>Taux</Text>
        </View>

        {/* Table rows */}
        {data.employees.map((emp, i) => (
          <View key={emp.userId} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.colName, { fontFamily: "Helvetica-Bold" }]}>
              {emp.name}
            </Text>
            <Text style={s.colEmail}>{emp.email}</Text>
            <Text style={[s.colDays, { color: GREEN }]}>{emp.daysPresent}j</Text>
            <Text style={[s.colDays, emp.daysAbsent > 0 ? s.rateLow : {}]}>
              {emp.daysAbsent}j
            </Text>
            <Text style={s.colHours}>{formatMinutes(emp.totalMinutes)}</Text>
            <Text style={[s.colRate, rateStyle(emp.presenceRate)]}>
              {emp.presenceRate}%
            </Text>
          </View>
        ))}

        {data.employees.length === 0 && (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <Text style={{ color: GRAY_400, fontSize: 9 }}>
              Aucune présence enregistrée sur cette période
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            SmartPresence · {data.companyName}
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
