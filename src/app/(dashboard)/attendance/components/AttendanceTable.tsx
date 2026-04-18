"use client";

import { Clock } from "lucide-react";
import type { AttendanceRow } from "@/modules/attendance/attendance.repository";

function formatTime(date: Date | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(checkIn: Date, checkOut: Date | null) {
  if (!checkOut) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        En cours
      </span>
    );
  }
  const minutes = Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60000
  );
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return (
    <span className="text-card-foreground">
      {h > 0 ? `${h}h ${m}m` : `${m}m`}
    </span>
  );
}

interface AttendanceTableProps {
  records: AttendanceRow[];
}

export function AttendanceTable({ records }: AttendanceTableProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="rounded-full bg-muted p-3">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-card-foreground">
            Aucun pointage
          </p>
          <p className="text-xs text-muted-foreground">
            Aucun employé n&apos;a pointé pour cette période.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Employé
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Arrivée
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Départ
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Durée
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Position GPS
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Wi-Fi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => (
              <tr
                key={record.id}
                className="transition-colors hover:bg-muted/40"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {record.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {record.user_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.user_email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {formatTime(record.check_in)}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {formatTime(record.check_out)}
                </td>
                <td className="px-6 py-4">
                  {formatDuration(record.check_in, record.check_out)}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                  {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                </td>
                <td className="px-6 py-4">
                  {record.wifi_ssid ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      {record.wifi_ssid}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
