"use client";

import { useState, useEffect, useCallback } from "react";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
}

const COOKIE_CONSENT_KEY = "cookie-consent";
const COOKIE_PREFERENCES_KEY = "cookie-preferences";

export function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [consentPreferences, setConsentPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (consent === "true") {
      setHasConsent(true);
      if (preferences) {
        try {
          const parsed = JSON.parse(preferences) as CookiePreferences;
          setConsentPreferences(parsed);
          applyCookiePreferences(parsed);
        } catch (e) {
          console.error("Error parsing cookie preferences:", e);
        }
      }
    } else if (consent === "false") {
      setHasConsent(false);
      applyCookiePreferences({ necessary: true, analytics: false });
    } else {
      setHasConsent(null); // No consent given yet
    }
  }, []);

  const applyCookiePreferences = useCallback((prefs: CookiePreferences) => {
    // Disable/enable analytics based on preference
    if (typeof window !== "undefined" && window.gtag) {
      if (prefs.analytics) {
        // Enable analytics
        window.gtag("consent", "update", {
          analytics_storage: "granted",
        });
      } else {
        // Disable analytics
        window.gtag("consent", "update", {
          analytics_storage: "denied",
        });
      }
    }

    // For Vercel Analytics, we'll handle it via a custom event
    // The Analytics component should respect this preference
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cookie-consent-updated", {
          detail: prefs,
        })
      );
    }
  }, []);

  const acceptAll = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: true,
    };
    setConsentPreferences(prefs);
    setHasConsent(true);
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    applyCookiePreferences(prefs);
  }, [applyCookiePreferences]);

  const rejectAll = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: false,
    };
    setConsentPreferences(prefs);
    setHasConsent(false);
    localStorage.setItem(COOKIE_CONSENT_KEY, "false");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    applyCookiePreferences(prefs);
  }, [applyCookiePreferences]);

  const savePreferences = useCallback(() => {
    setHasConsent(true);
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(consentPreferences));
    applyCookiePreferences(consentPreferences);
    setIsSettingsOpen(false);
  }, [consentPreferences, applyCookiePreferences]);

  const updatePreference = useCallback((key: keyof CookiePreferences, value: boolean) => {
    if (key === "necessary") return; // Cannot change necessary cookies
    setConsentPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  return {
    hasConsent,
    consentPreferences,
    acceptAll,
    rejectAll,
    savePreferences,
    updatePreference,
    openSettings,
    closeSettings,
    isSettingsOpen,
  };
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}

