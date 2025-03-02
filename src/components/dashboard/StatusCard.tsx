
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

const StatusCard = ({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  className,
}: StatusCardProps) => {
  const trendColor = trend === "up" 
    ? "text-emerald-600" 
    : trend === "down" 
      ? "text-red-600" 
      : "text-muted-foreground";

  return (
    <Card className={cn("overflow-hidden transition-all duration-200", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trendValue) && (
          <p className="mt-1 text-xs text-muted-foreground">
            {description}
            {trendValue && (
              <span className={cn("ml-1", trendColor)}>
                {trendValue}
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusCard;
