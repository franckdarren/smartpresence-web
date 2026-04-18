"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { User } from "@/lib/db/schema";

interface AttendanceFiltersProps {
  employees: User[];
}

export function AttendanceFilters({ employees }: AttendanceFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentDate =
    searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const currentEmployee = searchParams.get("employeeId") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <label
          htmlFor="filter-date"
          className="text-sm font-medium text-foreground"
        >
          Date
        </label>
        <input
          id="filter-date"
          type="date"
          value={currentDate}
          onChange={(e) => updateParam("date", e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex items-center gap-2">
        <label
          htmlFor="filter-employee"
          className="text-sm font-medium text-foreground"
        >
          Employé
        </label>
        <select
          id="filter-employee"
          value={currentEmployee}
          onChange={(e) => updateParam("employeeId", e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tous les employés</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
