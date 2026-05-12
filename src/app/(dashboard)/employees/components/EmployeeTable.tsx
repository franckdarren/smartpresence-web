"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Users, Trash2, RotateCcw, Archive } from "lucide-react";
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
  deletedEmployees: User[];
}

export function EmployeeTable({ employees, deletedEmployees }: EmployeeTableProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const list = tab === "active" ? employees : deletedEmployees;
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paginated = list.slice(start, start + PAGE_SIZE);

  function switchTab(next: "active" | "archived") {
    setTab(next);
    setPage(1);
    setConfirmId(null);
  }

  async function handleDelete(id: string) {
    setActionId(id);
    try {
      const res = await fetch(`/api/v1/employees/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Erreur interne");
      setConfirmId(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setActionId(null);
    }
  }

  async function handleRestore(id: string) {
    setActionId(id);
    try {
      const res = await fetch(`/api/v1/employees/${id}/restore`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Erreur interne");
      setConfirmId(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la restauration");
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border px-4 pt-3">
        <button
          onClick={() => switchTab("active")}
          className={cn(
            "flex items-center gap-1.5 rounded-t px-4 py-2 text-sm font-medium transition-colors",
            tab === "active"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="h-4 w-4" />
          Actifs
          <span className={cn(
            "ml-1 rounded-full px-1.5 py-0.5 text-xs font-semibold",
            tab === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {employees.length}
          </span>
        </button>
        <button
          onClick={() => switchTab("archived")}
          className={cn(
            "flex items-center gap-1.5 rounded-t px-4 py-2 text-sm font-medium transition-colors",
            tab === "archived"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Archive className="h-4 w-4" />
          Archivés
          {deletedEmployees.length > 0 && (
            <span className={cn(
              "ml-1 rounded-full px-1.5 py-0.5 text-xs font-semibold",
              tab === "archived" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"
            )}>
              {deletedEmployees.length}
            </span>
          )}
        </button>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="rounded-full bg-muted p-3">
            {tab === "active" ? (
              <Users className="h-6 w-6 text-muted-foreground" />
            ) : (
              <Archive className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm font-medium text-card-foreground">
            {tab === "active" ? "Aucun employé actif" : "Aucun employé archivé"}
          </p>
          <p className="text-xs text-muted-foreground">
            {tab === "active"
              ? "Ajoutez votre premier employé avec le bouton ci-dessus."
              : "Les employés supprimés apparaîtront ici."}
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
                    {tab === "active" ? "Date d'ajout" : "Archivé le"}
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
                    className={cn(
                      "transition-colors hover:bg-muted/40",
                      tab === "archived" && "opacity-60"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground",
                          tab === "archived" ? "bg-muted-foreground" : "bg-primary"
                        )}>
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-card-foreground">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{emp.email}</td>
                    <td className="px-6 py-4">
                      <RoleBadge role={emp.role} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {tab === "active" ? formatDate(emp.created_at) : formatDate(emp.deleted_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tab === "active" ? (
                        confirmId === emp.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-muted-foreground">Confirmer ?</span>
                            <button
                              onClick={() => handleDelete(emp.id)}
                              disabled={actionId === emp.id}
                              className="rounded-md bg-red-500 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                            >
                              {actionId === emp.id ? "..." : "Oui"}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              disabled={actionId === emp.id}
                              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                            >
                              Non
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(emp.id)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                            aria-label={`Archiver ${emp.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )
                      ) : (
                        confirmId === emp.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-muted-foreground">Restaurer ?</span>
                            <button
                              onClick={() => handleRestore(emp.id)}
                              disabled={actionId === emp.id}
                              className="rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                            >
                              {actionId === emp.id ? "..." : "Oui"}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              disabled={actionId === emp.id}
                              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                            >
                              Non
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(emp.id)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                            aria-label={`Restaurer ${emp.name}`}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )
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
                {start + 1}–{Math.min(start + PAGE_SIZE, list.length)} sur{" "}
                {list.length} employé{list.length > 1 ? "s" : ""}
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
                <span className="min-w-16 text-center text-xs text-muted-foreground">
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
