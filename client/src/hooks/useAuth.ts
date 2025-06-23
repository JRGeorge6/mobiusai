import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { setCsrfToken } from "@/lib/csrf";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  authProvider?: string;
  authProviderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const fetchCsrfToken = async () => {
    try {
      const response = await apiRequest("GET", "/api/csrf-token");
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } else {
        setCsrfToken(null);
        console.error("Failed to fetch CSRF token: Response not OK");
      }
    } catch (error) {
      console.error("Failed to fetch CSRF token", error);
      setCsrfToken(null);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await apiRequest("GET", "/api/auth/status");
      if (response.ok) {
        const user = await response.json();
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await fetchCsrfToken();
      await checkAuthStatus();
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, error: null, isLoading: true }));
    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await response.json();
      if (response.ok) {
        await checkAuthStatus();
      } else {
        setAuthState(prev => ({ ...prev, error: data.message || "Login failed", isLoading: false }));
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, error: error.message || "An unexpected error occurred.", isLoading: false }));
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setAuthState(prev => ({ ...prev, error: null, isLoading: true }));
    try {
      const response = await apiRequest("POST", "/api/auth/register", { email, password, firstName, lastName });
      const data = await response.json();
      if (response.ok) {
        await checkAuthStatus();
      } else {
        setAuthState(prev => ({ ...prev, error: data.message || "Registration failed", isLoading: false }));
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, error: error.message || "An unexpected error occurred.", isLoading: false }));
    }
  };

  const demoLogin = async () => {
    setAuthState(prev => ({ ...prev, error: null, isLoading: true }));
    try {
      const response = await apiRequest("POST", "/api/auth/demo");
       if (response.ok) {
        await checkAuthStatus();
      } else {
        const data = await response.json();
        setAuthState(prev => ({ ...prev, error: data.message || "Demo login failed", isLoading: false }));
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, error: error.message || "An unexpected error occurred.", isLoading: false }));
    }
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      await fetchCsrfToken();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const refreshAuth = () => {
    checkAuthStatus();
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    register,
    demoLogin,
    logout,
    refreshAuth,
  };
} 