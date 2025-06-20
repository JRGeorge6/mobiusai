import { useState } from "react";
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
  User,
  Menu,
  X,
  CheckCircle
} from "lucide-react";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

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
              <h1 className="text-2xl font-bold text-neutral-800">StudyBot</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <a 
                href="/" 
                className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </a>
              <a 
                href="/library" 
                className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Library</span>
              </a>
              <a 
                href="/chat" 
                className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Study Chat</span>
              </a>
              <a 
                href="/flashcards" 
                className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Flashcards</span>
              </a>
              <a 
                href="/assessment" 
                className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <Target className="w-4 h-4" />
                <span>Assessment</span>
              </a>
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
                      <User className="w-4 h-4 text-neutral-600" />
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
                onClick={() => window.location.href = '/api/logout'}
                variant="outline"
                size="sm"
                className="hidden lg:inline-flex bg-white/50 hover:bg-white/70"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 bg-white/90 backdrop-blur-md">
            <div className="px-4 py-4 space-y-4">
              <a 
                href="/" 
                className="flex items-center space-x-3 text-neutral-700 hover:text-neutral-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </a>
              <a 
                href="/library" 
                className="flex items-center space-x-3 text-neutral-700 hover:text-neutral-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="w-5 h-5" />
                <span>Library</span>
              </a>
              <a 
                href="/chat" 
                className="flex items-center space-x-3 text-neutral-700 hover:text-neutral-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Study Chat</span>
              </a>
              <a 
                href="/flashcards" 
                className="flex items-center space-x-3 text-neutral-700 hover:text-neutral-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <CreditCard className="w-5 h-5" />
                <span>Flashcards</span>
              </a>
              <a 
                href="/assessment" 
                className="flex items-center space-x-3 text-neutral-700 hover:text-neutral-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Target className="w-5 h-5" />
                <span>Assessment</span>
              </a>
              
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
                        <User className="w-4 h-4 text-neutral-600" />
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
                  onClick={() => window.location.href = '/api/logout'}
                  variant="outline"
                  className="w-full bg-white/50 hover:bg-white/70"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Bottom Navigation (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glassmorphic border-t border-white/20 z-50">
        <div className="flex justify-around py-3">
          <a 
            href="/"
            className="flex flex-col items-center space-y-1 text-neutral-600 hover:text-coral transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </a>
          <a 
            href="/library"
            className="flex flex-col items-center space-y-1 text-neutral-600 hover:text-coral transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Library</span>
          </a>
          <a 
            href="/chat"
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-10 h-10 bg-coral rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
          </a>
          <a 
            href="/flashcards"
            className="flex flex-col items-center space-y-1 text-neutral-600 hover:text-coral transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-xs">Cards</span>
          </a>
          <a 
            href="/assessment"
            className="flex flex-col items-center space-y-1 text-neutral-600 hover:text-coral transition-colors"
          >
            <Target className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </a>
        </div>
      </nav>
    </>
  );
}
