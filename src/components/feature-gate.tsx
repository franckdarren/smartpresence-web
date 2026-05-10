"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FeatureGateProps {
  enabled: boolean;
  featureName: string;
  planRequired: string;
  children: React.ReactNode;
  className?: string;
}

export function FeatureGate({
  enabled,
  featureName,
  planRequired,
  children,
  className,
}: FeatureGateProps) {
  if (enabled) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none select-none opacity-40">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-[2px]">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-muted p-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-xs font-medium text-card-foreground">
            {featureName}
          </p>
          <p className="text-xs text-muted-foreground">
            Plan <strong>{planRequired}</strong> requis
          </p>
          <Link
            href="/my-subscription"
            className="mt-1 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            Passer au plan supérieur
          </Link>
        </div>
      </div>
    </div>
  );
}
