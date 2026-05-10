"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Settings,
  Globe,
  Building2,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";

type Role = "superadmin" | "admin" | "employee";

const adminNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Employés", href: "/employees", icon: Users },
  { label: "Présences", href: "/attendance", icon: CalendarCheck },
  { label: "Paramètres", href: "/settings", icon: Settings },
  { label: "Mon abonnement", href: "/my-subscription", icon: CreditCard },
];

const superadminNavItems = [
  { label: "Vue globale", href: "/superadmin/overview", icon: Globe },
  { label: "Entreprises", href: "/companies", icon: Building2 },
  { label: "Utilisateurs", href: "/superadmin/users", icon: Users },
  { label: "Abonnements", href: "/subscriptions", icon: CreditCard },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const navItems = role === "superadmin" ? superadminNavItems : adminNavItems;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center border-b border-border px-6 text-sidebar-foreground">
        <BrandLogo size={28} showName nameFontSize={15} />
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="mb-1 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {role === "superadmin" ? "Administration" : "Navigation"}
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground">v1.0.0</p>
      </div>
    </aside>
  );
}
