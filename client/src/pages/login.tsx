import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Github, Chrome, User, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthProviders {
  demo: boolean;
  local: boolean;
  google?: boolean;
  github?: boolean;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<AuthProviders>({
    demo: true,
    local: true
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, demoLogin } = useAuth();

  // Fetch available auth providers on component mount
  React.useEffect(() => {
    fetchAuthProviders();
  }, []);

  const fetchAuthProviders = async () => {
    try {
      const response = await fetch('/api/auth/login');
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('Failed to fetch auth providers:', error);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const result = await demoLogin();
      if (result.success) {
        toast({ title: "Welcome!", description: "You're now logged in as a demo user." });
        setLocation('/dashboard');
      } else {
        throw new Error(result.error || 'Demo login failed');
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Unable to log in with demo account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Email and Password Required",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);
    if (result.success) {
      toast({ title: "Welcome!", description: `Logged in as ${email}` });
      setLocation('/dashboard');
    } else {
      toast({
        title: "Login Failed",
        description: result.error || "Unable to log in. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    const urls = {
      google: '/api/auth/google',
      github: '/api/auth/github'
    };
    window.location.href = urls[provider];
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to MobiusAI
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your AI-powered study assistant
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Demo Login */}
          {providers.demo && (
            <div className="space-y-2">
              <Button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <User className="mr-2 h-4 w-4" />
                )}
                Try Demo Account
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Quick access for testing and exploration
              </p>
            </div>
          )}

          {/* OAuth Providers */}
          {(providers.google || providers.github) && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center">Or continue with</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {providers.google && (
                    <Button
                      variant="outline"
                      onClick={() => handleOAuthLogin('google')}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Chrome className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                  )}
                  
                  {providers.github && (
                    <Button
                      variant="outline"
                      onClick={() => handleOAuthLogin('github')}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Local Login */}
          {providers.local && (
            <>
              <Separator />
              <form onSubmit={handleLocalLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !email.trim() || !password.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  Log In
                </Button>
                <Separator />
                <p className="text-xs text-gray-500 text-center">
                  Don't have an account?{' '}
                  <span
                    className="text-blue-600 hover:underline cursor-pointer"
                    onClick={() => setLocation('/register')}
                  >
                    Register
                  </span>
                </p>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 