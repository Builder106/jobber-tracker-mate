
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AppLayout = ({ children, className }: AppLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={cn("flex-1 container py-6 md:py-10 animate-fade-in", className)}>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
