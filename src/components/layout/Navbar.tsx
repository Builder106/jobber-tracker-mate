
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-medium text-lg">
            CareerClutch
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
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full w-9 h-9 p-0">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
