import React from "react";
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
    y: 5,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -5,
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3,
};

const AnimatedRoute = ({ component: Component }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    <Component />
  </motion.div>
);

const AuthenticatedRoutes = () => (
  <>
    <Navigation />
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
);

const UnauthenticatedRoutes = () => (
  <Switch>
    <Route path="/" component={Landing} />
    <Route path="/login" component={Login} />
    <Route path="/register" component={Register} />
    <Route component={Login} /> {/* Default to login for unknown routes */}
  </Switch>
);

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

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
      <AnimatePresence mode="wait">
        <motion.div
          key={isAuthenticated ? "authed" : "unauthed"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isAuthenticated ? <AuthenticatedRoutes /> : <UnauthenticatedRoutes />}
        </motion.div>
      </AnimatePresence>
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