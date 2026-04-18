"use client";

import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { LogOut, Bell, ChevronDown } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface TopbarProps {
  user: User;
}

export function Topbar({ user }: TopbarProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const displayName = user.user_metadata?.name ?? user.email ?? "Utilisateur";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div />

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none text-foreground">
              {displayName}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
