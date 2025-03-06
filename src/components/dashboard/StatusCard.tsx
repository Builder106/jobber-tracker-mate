
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

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
    <Card className={cn("overflow-hidden transition-all duration-200 hover:shadow-sm border", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trendValue) && (
          <div className="mt-2 flex items-center">
            {trend && (
              <span 
                className={cn(
                  "flex items-center justify-center rounded-full w-5 h-5 mr-1.5",
                  trend === "up" ? "bg-emerald-100 text-emerald-600" : 
                  trend === "down" ? "bg-red-100 text-red-600" : 
                  "bg-gray-100 text-gray-600"
                )}
              >
                {trend === "up" ? <ArrowUpIcon className="h-3 w-3" /> : 
                 trend === "down" ? <ArrowDownIcon className="h-3 w-3" /> : null}
              </span>
            )}
            <p className="text-xs text-muted-foreground">
              {description}
              {trendValue && (
                <span className={cn("ml-1 font-medium", trendColor)}>
                  {trendValue}
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusCard;
