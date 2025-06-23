import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Home, 
  BookOpen, 
  MessageSquare, 
  CreditCard, 
  Target,
  User as UserIcon,
  Menu,
  X,
  CheckCircle,
  RotateCcw,
  LogOut
} from "lucide-react";

interface NavigationProps {
  onNavigate?: (path: string) => void;
}

export default function Navigation({ onNavigate }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    if (onNavigate) {
      onNavigate('/');
    } else {
      setLocation('/');
    }
  };

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      setLocation(path);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="glassmorphic shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-coral rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-800">MobiusAI</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <button 
                onClick={() => handleNavigation('/')}
                className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button 
                onClick={() => handleNavigation('/library')}
                className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Library</span>
              </button>
              <button 
                onClick={() => handleNavigation('/chat')}
                className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Study Chat</span>
              </button>
              <button 
                onClick={() => handleNavigation('/flashcards')}
                className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Flashcards</span>
              </button>
              <button 
                onClick={() => handleNavigation('/interleaved')}
                className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Interleaved</span>
              </button>
              <button 
                onClick={() => handleNavigation('/assessment')}
                className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <Target className="w-4 h-4" />
                <span>Assessment</span>
              </button>
            </nav>

            {/* Canvas Integration Status & User Profile */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-lime" />
                <span className="text-sm font-medium text-green-800">Canvas Connected</span>
              </div>
              
              {/* User Profile */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-8 h-8 bg-neutral-300 rounded-full overflow-hidden">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-300 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-neutral-600" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-neutral-800">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || 'User'
                  }
                </span>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden bg-white/50 hover:bg-white/70"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>

              {/* Logout Button (Desktop) */}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="hidden lg:inline-flex bg-white/50 hover:bg-white/70"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 bg-white/90 backdrop-blur-md">
            <div className="px-4 py-4 space-y-4">
              <button 
                onClick={() => handleNavigation('/')}
                className="flex items-center space-x-3 text-neutral-700 hover:text-neutral-900 transition-colors w-full text-left"
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button 
                onClick={() => handleNavigation('/library')}
                className="flex items-center space-x-3 text-neutral-700 hover:text-neutral-900 transition-colors w-full text-left"
              >
                <BookOpen className="w-5 h-5" />
                <span>Library</span>
              </button>
              <button 
                onClick={() => handleNavigation('/chat')}
                className="flex items-center space-x-3 text-neutral-700 hover:text-neutral-900 transition-colors w-full text-left"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Study Chat</span>
              </button>
              <button 
                onClick={() => handleNavigation('/flashcards')}
                className="flex items-center space-x-3 text-neutral-700 hover:text-neutral-900 transition-colors w-full text-left"
              >
                <CreditCard className="w-5 h-5" />
                <span>Flashcards</span>
              </button>
              <button 
                onClick={() => handleNavigation('/interleaved')}
                className="flex items-center space-x-3 text-neutral-700 hover:text-neutral-900 transition-colors w-full text-left"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Interleaved</span>
              </button>
              <button 
                onClick={() => handleNavigation('/assessment')}
                className="flex items-center space-x-3 text-neutral-700 hover:text-neutral-900 transition-colors w-full text-left"
              >
                <Target className="w-5 h-5" />
                <span>Assessment</span>
              </button>
              
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-neutral-300 rounded-full overflow-hidden">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-300 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-neutral-600" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-neutral-800">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || 'User'
                    }
                  </span>
                </div>
                
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>
    </>
  );
}
