
import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "outline" | "success" | "warning" | "danger" | "info" | "applied" | "interview" | "offer" | "rejected" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const Badge = ({ variant = "default", children, className }: BadgeProps) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-primary/10 text-primary",
    outline: "border border-border bg-background text-foreground",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    danger: "bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    applied: "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    interview: "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    offer: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    rejected: "bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
