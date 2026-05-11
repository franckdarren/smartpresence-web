"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type Role = "superadmin" | "admin" | "employee";

interface DashboardShellProps {
  role: Role;
  name: string;
  email: string;
  trialBanner?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardShell({
  role,
  name,
  email,
  trialBanner,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          name={name}
          email={email}
          role={role}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        {trialBanner}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
