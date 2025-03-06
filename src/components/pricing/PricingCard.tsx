
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PricingFeature {
  name: string;
  included: boolean;
}

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: PricingFeature[];
  highlighted?: boolean;
  actionText: string;
  actionUrl: string;
}

interface PricingCardProps {
  tier: PricingTier;
  className?: string;
}

const PricingCard = ({ tier, className }: PricingCardProps) => {
  return (
    <Card 
      className={cn(
        "flex flex-col",
        tier.highlighted && "border-primary shadow-lg scale-105 z-10",
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-xl">{tier.name}</CardTitle>
        <div className="mt-4">
          <span className="text-3xl font-bold">{tier.price}</span>
          {tier.price !== "Free" && <span className="text-muted-foreground ml-1">/month</span>}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className={cn(
                "mr-2 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full",
                feature.included ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {feature.included && <Check className="h-3.5 w-3.5" />}
              </span>
              <span className={feature.included ? "" : "text-muted-foreground line-through"}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4 mt-auto">
        {tier.actionText === "Current Plan" ? (
          <Button 
            variant={tier.highlighted ? "default" : "outline"} 
            className="w-full"
            disabled
          >
            {tier.actionText}
          </Button>
        ) : (
          <Button 
            variant={tier.highlighted ? "default" : "outline"} 
            className="w-full"
            asChild
          >
            <a href={tier.actionUrl}>{tier.actionText}</a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
