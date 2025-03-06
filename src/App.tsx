import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UNSAFE_DataRouterContext, UNSAFE_DataRouterStateContext } from "react-router-dom";
const router = {
  basename: "/",
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};
import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import Features from "./pages/Features";

const queryClient = new QueryClient();

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  // Only redirect if we're not loading and there's no user
  if (!isLoading && !user) {
    console.log('[ProtectedRoute] No authenticated user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }
  
  // Show a loading state while checking authentication
  if (isLoading) {
    console.log('[ProtectedRoute] Authentication state is loading');
    return <div>Loading...</div>; // You could replace this with a proper loading component
  }
  
  return children;
};

const App = () => {
  const { user, isLoading } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter {...router}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={isLoading ? <div>Loading...</div> : (user ? <Navigate to="/dashboard" /> : <Landing />)} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Navigate to="/auth" state={{ from: 'signup' }} replace />} />

            <Route path="/features" element={<Features />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;