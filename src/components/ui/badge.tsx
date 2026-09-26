import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-surface-muted text-foreground",
        draft: "bg-status-draft/10 text-status-draft",
        waiting: "bg-status-waiting/10 text-status-waiting",
        ready: "bg-status-ready/10 text-status-ready",
        done: "bg-status-done/10 text-status-done",
        canceled: "bg-status-canceled/10 text-status-canceled",
        healthy: "bg-health-healthy/10 text-health-healthy",
        low: "bg-health-low/10 text-health-low",
        critical: "bg-health-critical/10 text-health-critical",
        out: "bg-health-out/10 text-health-out",
        dead: "bg-health-dead/10 text-health-dead",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
