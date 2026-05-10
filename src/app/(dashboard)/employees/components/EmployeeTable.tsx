"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Users, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/db/schema";

const PAGE_SIZE = 10;

const ROLE_STYLES: Record<string, { label: string; className: string }> = {
  superadmin: {
    label: "Super Admin",
    className: "bg-violet-100 text-violet-700",
  },
  admin: {
    label: "Admin",
    className: "bg-blue-100 text-blue-700",
  },
  employee: {
    label: "Employé",
    className: "bg-emerald-100 text-emerald-700",
  },
};

function RoleBadge({ role }: { role: string }) {
  const style = ROLE_STYLES[role] ?? { label: role, className: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", style.className)}>
      {style.label}
    </span>
  );
}

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface EmployeeTableProps {
  employees: User[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(employees.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paginated = employees.slice(start, start + PAGE_SIZE);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/employees/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Erreur interne");
      setConfirmId(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="rounded-full bg-muted p-3">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-card-foreground">Aucun employé</p>
          <p className="text-xs text-muted-foreground">
            Ajoutez votre premier employé avec le bouton ci-dessus.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Nom
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Email
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Rôle
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Date d&apos;ajout
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((emp) => (
                  <tr
                    key={emp.id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-card-foreground">
                          {emp.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{emp.email}</td>
                    <td className="px-6 py-4">
                      <RoleBadge role={emp.role} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(emp.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {confirmId === emp.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-muted-foreground">Confirmer ?</span>
                          <button
                            onClick={() => handleDelete(emp.id)}
                            disabled={deletingId === emp.id}
                            className="rounded-md bg-red-500 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                          >
                            {deletingId === emp.id ? "..." : "Oui"}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            disabled={deletingId === emp.id}
                            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                          >
                            Non
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(emp.id)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                          aria-label={`Supprimer ${emp.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-3">
              <p className="text-xs text-muted-foreground">
                {start + 1}–{Math.min(start + PAGE_SIZE, employees.length)} sur{" "}
                {employees.length} employé{employees.length > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[4rem] text-center text-xs text-muted-foreground">
                  {safePage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
