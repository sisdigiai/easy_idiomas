import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-surface-variant text-on-surface-variant border-transparent",
    success: "bg-[#e8f5e9] text-[#1b5e20] border-transparent",
    warning: "bg-[#fff3e0] text-[#e65100] border-transparent",
    error: "bg-error-container text-on-error-container border-transparent",
    outline: "text-secondary border-outline-variant",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 font-label-sm text-label-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
