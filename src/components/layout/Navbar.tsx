
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";

const NavItem = ({ 
  href, 
  children, 
  active 
}: { 
  href: string; 
  children: React.ReactNode;
  active: boolean;
}) => (
  <Link
    to={href}
    className={cn(
      "relative px-4 py-2 rounded-md text-sm font-medium transition-colors",
      active
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
    )}
  >
    {children}
    {active && (
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full mx-3 transform origin-left animate-scale-in" />
    )}
  </Link>
);

const Navbar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  // This would be from an auth context in a real app
  const isLoggedIn = true; // For demonstration purposes
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-medium text-lg">
            JobTracker
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-6">
            <NavItem href="/" active={pathname === "/"}>
              Dashboard
            </NavItem>
            <NavItem 
              href="/applications" 
              active={pathname === "/applications" || pathname.startsWith("/applications/")}
            >
              Applications
            </NavItem>
            <NavItem href="/calendar" active={pathname === "/calendar"}>
              Calendar
            </NavItem>
            <NavItem href="/pricing" active={pathname === "/pricing"}>
              Pricing
            </NavItem>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Button size="sm" className="animate-fade-in">
                <Plus className="w-4 h-4 mr-1" />
                New Application
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">
                  <User className="w-4 h-4" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
