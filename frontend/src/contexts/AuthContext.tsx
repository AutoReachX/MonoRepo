'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/authService';

interface User {
  id: number;
  username: string;
  twitter_username?: string;
  twitter_user_id?: string;
  full_name?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/auth/twitter/callback',
  '/auth/twitter/oauth2-callback',
  '/test-twitter-oauth2',
  '/terms',
  '/privacy',
  '/about',
  '/contact'
];

// Routes that should redirect to login if not authenticated
const PROTECTED_ROUTES = [
  '/dashboard',
  '/content',
  '/analytics',
  '/settings',
  '/profile'
];

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user && !!authService.getToken();

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  });

  // Check if current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  const refreshUser = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        setUser(null);
        return;
      }

      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      authService.logout();
    }
  };

  const login = async (credentials: { username: string; password: string }) => {
    try {
      await authService.login(credentials);
      // After successful login, fetch user data
      await refreshUser();
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/');
  };

  // Handle authentication state and routing
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      try {
        const token = authService.getToken();

        if (token) {
          // Try to get current user
          await refreshUser();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Handle route protection
  useEffect(() => {
    if (isLoading) return;

    // If user is not authenticated and trying to access protected route
    if (!isAuthenticated && isProtectedRoute) {
      console.log('Redirecting to login - protected route accessed without auth');
      router.push('/login');
      return;
    }

    // If user is authenticated and trying to access login page
    if (isAuthenticated && pathname === '/login') {
      console.log('Redirecting to dashboard - already authenticated');
      router.push('/dashboard');
      return;
    }

    // For any other route that's not explicitly public, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
      console.log('Redirecting to login - non-public route accessed without auth');
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, pathname, isProtectedRoute, isPublicRoute, router]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
