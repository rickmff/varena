"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { authClient } from "@/lib/better-auth/client";

interface AuthContextType {
  user: any;
  session: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef<number>(0);

  const fetchSession = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (fetchingRef.current) {
      return;
    }

    // Throttle: don't fetch if last fetch was less than 500ms ago
    const now = Date.now();
    if (now - lastFetchRef.current < 500) {
      return;
    }

    fetchingRef.current = true;
    lastFetchRef.current = now;

    try {
      const result = await authClient.getSession();
      if (result.data) {
        setSession(result.data);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      setSession(null);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Fetch initial session
    fetchSession();

    // Revalidate when window receives focus (user returns to tab)
    const handleFocus = () => {
      fetchSession();
    };

    // Revalidate when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSession();
      }
    };

    // Check periodically, but with longer interval (60s)
    const interval = setInterval(fetchSession, 60000);

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchSession]);

  const value: AuthContextType = {
    user: session?.user || null,
    session: session,
    isAuthenticated: !!session?.user,
    isLoading,
    refetch: fetchSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}





