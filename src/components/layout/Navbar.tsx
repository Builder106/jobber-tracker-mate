
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, LogOut, Menu, X, BarChart, Briefcase, Calendar as CalendarIcon, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NavItem = ({ 
  href, 
  children, 
  active,
  icon,
  onClick
}: { 
  href: string; 
  children: React.ReactNode;
  active: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}) => (
  <Link
    to={href}
    onClick={onClick}
    className={cn(
      "relative group flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
      active
        ? "text-primary bg-primary/5"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    )}
  >
    {icon && <span className={cn("transition-colors", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>{icon}</span>}
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-semibold text-lg flex items-center gap-1.5">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">CC</span>
            </div>
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">CareerClutch</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-6">
            <NavItem 
              href="/" 
              active={pathname === "/"}
              icon={<BarChart className="w-4 h-4" />}
            >
              Dashboard
            </NavItem>
            <NavItem 
              href="/applications" 
              active={pathname === "/applications" || pathname.startsWith("/applications/")}
              icon={<Briefcase className="w-4 h-4" />}
            >
              Applications
            </NavItem>
            <NavItem 
              href="/calendar" 
              active={pathname === "/calendar"}
              icon={<CalendarIcon className="w-4 h-4" />}
            >
              Calendar
            </NavItem>

          </nav>
        </div>
        
        {/* Desktop user menu */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full w-9 h-9 p-0 border border-border hover:bg-muted/50">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">Manage your account</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="rounded-md">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="rounded-md">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 sm:w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between py-2">
                  <Link to="/" onClick={closeMobileMenu} className="font-semibold text-lg flex items-center gap-1.5">
                    <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">CC</span>
                    </div>
                    <span>CareerClutch</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-1 mt-6">
                  <NavItem 
                    href="/" 
                    active={pathname === "/"}
                    icon={<BarChart className="w-4 h-4" />}
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </NavItem>
                  <NavItem 
                    href="/applications" 
                    active={pathname === "/applications" || pathname.startsWith("/applications/")}
                    icon={<Briefcase className="w-4 h-4" />}
                    onClick={closeMobileMenu}
                  >
                    Applications
                  </NavItem>
                  <NavItem 
                    href="/calendar" 
                    active={pathname === "/calendar"}
                    icon={<CalendarIcon className="w-4 h-4" />}
                    onClick={closeMobileMenu}
                  >
                    Calendar
                  </NavItem>

                </nav>
                <div className="mt-auto pt-4 border-t">
                  {user ? (
                    <div className="space-y-3">
                      <div className="px-4 py-2">
                        <p className="text-sm font-medium">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Manage your account</p>
                      </div>
                      <NavItem 
                        href="/profile" 
                        active={pathname === "/profile"}
                        icon={<User className="w-4 h-4" />}
                        onClick={closeMobileMenu}
                      >
                        Profile
                      </NavItem>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-sm font-medium px-4 py-2 h-auto" 
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 px-3">
                      <Button variant="outline" asChild className="w-full">
                        <Link to="/auth" onClick={closeMobileMenu}>Sign In</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link to="/signup" onClick={closeMobileMenu}>Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
