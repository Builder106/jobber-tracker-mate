
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import PricingCard, { PricingTier } from "@/components/pricing/PricingCard";

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "Free",
    description: "Perfect for job seekers just getting started",
    highlighted: false,
    actionText: "Get Started",
    actionUrl: "/signup",
    features: [
      { name: "Track up to 10 applications", included: true },
      { name: "Basic application status tracking", included: true },
      { name: "Calendar integration", included: true },
      { name: "Email notifications", included: false },
      { name: "Interview preparation tools", included: false },
      { name: "Resume analysis", included: false },
      { name: "Priority support", included: false },
    ]
  },
  {
    name: "Pro",
    price: "$9.99",
    description: "For serious job seekers who need more features",
    highlighted: true,
    actionText: "Try Free for 14 Days",
    actionUrl: "/signup?plan=pro",
    features: [
      { name: "Unlimited applications", included: true },
      { name: "Advanced status tracking", included: true },
      { name: "Calendar integration", included: true },
      { name: "Email notifications", included: true },
      { name: "Interview preparation tools", included: true },
      { name: "Resume analysis", included: false },
      { name: "Priority support", included: false },
    ]
  },
  {
    name: "Premium",
    price: "$19.99",
    description: "The ultimate job search companion",
    highlighted: false,
    actionText: "Try Free for 14 Days",
    actionUrl: "/signup?plan=premium",
    features: [
      { name: "Unlimited applications", included: true },
      { name: "Advanced status tracking", included: true },
      { name: "Calendar integration", included: true },
      { name: "Email notifications", included: true },
      { name: "Interview preparation tools", included: true },
      { name: "Resume analysis", included: true },
      { name: "Priority support", included: true },
    ]
  }
];

const Pricing = () => {
  return (
    <AppLayout>
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that's right for your job search journey. 
          All plans come with a 14-day free trial.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {pricingTiers.map((tier, index) => (
          <PricingCard key={index} tier={tier} />
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Frequently Asked Questions
        </h2>
        
        <div className="max-w-3xl mx-auto grid gap-6 text-left">
          <div>
            <h3 className="font-medium text-lg">Can I change plans later?</h3>
            <p className="text-muted-foreground mt-1">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg">How does the 14-day trial work?</h3>
            <p className="text-muted-foreground mt-1">
              You'll get full access to all features for 14 days. No credit card required until you decide to continue.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg">What payment methods do you accept?</h3>
            <p className="text-muted-foreground mt-1">
              We accept all major credit cards and PayPal. Enterprise customers can also pay by invoice.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg">Can I get a refund?</h3>
            <p className="text-muted-foreground mt-1">
              If you're not satisfied with our service, contact us within 30 days of your purchase for a full refund.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Pricing;
