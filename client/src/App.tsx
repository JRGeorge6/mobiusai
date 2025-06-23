import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Library from "@/pages/library";
import Chat from "@/pages/chat";
import Flashcards from "@/pages/flashcards";
import Assessment from "@/pages/assessment";
import Interleaved from "@/pages/interleaved";
import InterleavedSession from "@/pages/interleaved-session";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NotFound from "@/pages/not-found";
import { AnimatePresence, motion } from "framer-motion";

const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
};

// Custom hook to handle navigation with immediate fade
const useNavigationWithFade = () => {
  const [location, setLocation] = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<string | null>(null);

  const navigateWithFade = (newLocation: string) => {
    if (newLocation === location) return;
    
    setIsNavigating(true);
    setPendingLocation(newLocation);
    
    // Start fade out immediately
    setTimeout(() => {
      setLocation(newLocation);
      setIsNavigating(false);
      setPendingLocation(null);
    }, 150); // Half of the transition duration
  };

  return { location, navigateWithFade, isNavigating };
};

const AnimatedRoutes = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const { location, navigateWithFade, isNavigating } = useNavigationWithFade();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial="initial"
        animate={isNavigating ? "out" : "in"}
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="flex-1 flex flex-col"
      >
        {isAuthenticated ? (
          <>
            <Navigation onNavigate={navigateWithFade} />
            <main className="flex-1">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/library" component={Library} />
                <Route path="/chat" component={Chat} />
                <Route path="/flashcards" component={Flashcards} />
                <Route path="/assessment" component={Assessment} />
                <Route path="/interleaved" component={Interleaved} />
                <Route path="/interleaved/:sessionId" component={InterleavedSession} />
                <Route component={NotFound} />
              </Switch>
            </main>
            <Footer />
          </>
        ) : (
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route component={Login} />
          </Switch>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <AnimatedRoutes isAuthenticated={isAuthenticated} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;