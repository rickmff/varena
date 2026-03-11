"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { authClient } from "@/lib/better-auth/client";
import { migrateLocalBuilds } from "@/lib/migrate-local-builds";
import { migrateLocalTierLists } from "@/lib/migrate-local-tier-lists";

interface AuthContextType {
  user: any;
  session: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Constants for session refresh strategy
const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes instead of 60 seconds
const MIN_FETCH_INTERVAL = 30 * 1000; // Minimum 30 seconds between any fetches
const FOCUS_THROTTLE = 2 * 60 * 1000; // Only check on focus if last check was > 2 minutes ago

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef<number>(0);
  const lastFocusCheckRef = useRef<number>(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const migrationAttemptedRef = useRef(false);

  const fetchSession = useCallback(async (force = false) => {
    // Prevent multiple simultaneous calls
    if (fetchingRef.current) {
      return;
    }

    // Throttle: don't fetch if last fetch was less than MIN_FETCH_INTERVAL ago (unless forced)
    const now = Date.now();
    if (!force && now - lastFetchRef.current < MIN_FETCH_INTERVAL) {
      return;
    }

    fetchingRef.current = true;
    lastFetchRef.current = now;

    try {
      const result = await authClient.getSession({
        fetchOptions: { cache: "no-store" },
      });
      if (result.data) {
        // Always fetch admin status when session exists
        let adminStatus = false;
        try {
          const adminCheck = await fetch("/api/admin/check");
          if (adminCheck.ok) {
            const adminData = await adminCheck.json();
            adminStatus = adminData.isAdmin || false;
          }
        } catch (error) {
          // Silently fail - admin check is not critical
          console.error("Error checking admin status:", error);
        }

        // Set session with admin status included
        const sessionWithAdmin = {
          ...result.data,
          isAdmin: adminStatus,
        };
        setSession(sessionWithAdmin);
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

  // Setup polling based on session state
  useEffect(() => {
    // Clear existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Only poll if user is authenticated (no need to check every 5 min if not logged in)
    // This reduces unnecessary API calls when user is not logged in
    if (session?.user && !isLoading) {
      pollingIntervalRef.current = setInterval(() => {
        fetchSession();
      }, POLLING_INTERVAL);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [session?.user, isLoading, fetchSession]);

  // Setup event listeners and initial fetch
  useEffect(() => {
    // Fetch initial session
    fetchSession(true);

    // Revalidate when window receives focus (user returns to tab)
    // But only if enough time has passed since last check
    const handleFocus = () => {
      const now = Date.now();
      // Only check if last focus check was more than FOCUS_THROTTLE ago
      if (now - lastFocusCheckRef.current > FOCUS_THROTTLE) {
        lastFocusCheckRef.current = now;
        fetchSession();
      }
    };

    // Revalidate when page becomes visible
    // But only if enough time has passed since last check
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now();
        // Only check if last focus check was more than FOCUS_THROTTLE ago
        if (now - lastFocusCheckRef.current > FOCUS_THROTTLE) {
          lastFocusCheckRef.current = now;
          fetchSession();
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchSession]);

  // Migrate builds from localStorage when user session is established
  // This handles cases where user is already logged in (e.g., from previous tab)
  useEffect(() => {
    // Only run migration once per session establishment
    if (!session?.user || migrationAttemptedRef.current || isLoading) {
      return;
    }

    // Mark migration as attempted to prevent multiple runs
    migrationAttemptedRef.current = true;

    // Run migration asynchronously without blocking
    Promise.all([
      migrateLocalBuilds(),
      migrateLocalTierLists(),
    ])
      .then(([buildsResult, tierListsResult]) => {
        if (buildsResult.migrated > 0) {
          console.log(`[Session Provider] Migrated ${buildsResult.migrated} build(s) from localStorage`);
        }
        if (tierListsResult.migrated > 0) {
          console.log(`[Session Provider] Migrated ${tierListsResult.migrated} tier list(s) from localStorage`);
        }
      })
      .catch((error) => {
        console.error("[Session Provider] Error during migration:", error);
        // Reset flag on error so it can retry on next session establishment
        migrationAttemptedRef.current = false;
      });
  }, [session?.user?.id, isLoading]);

  // Reset migration flag when user logs out
  useEffect(() => {
    if (!session?.user) {
      migrationAttemptedRef.current = false;
    }
  }, [session?.user]);

  const value: AuthContextType = {
    user: session?.user || null,
    session: session,
    isAuthenticated: !!session?.user,
    isLoading,
    isAdmin: session?.isAdmin || false, // Get from session (set by API check)
    refetch: () => fetchSession(true), // Force refresh when explicitly called
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





