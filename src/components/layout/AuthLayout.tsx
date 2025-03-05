import React from "react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AuthLayout = ({ children, className }: AuthLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className={cn("flex-1 container py-6 md:py-10 animate-fade-in", className)}>
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
