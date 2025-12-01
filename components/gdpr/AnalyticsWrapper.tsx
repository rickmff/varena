"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";

export default function AnalyticsWrapper() {
  const { hasConsent, consentPreferences } = useCookieConsent();
  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(false);

  useEffect(() => {
    // Only load analytics if user has consented
    if (hasConsent === true && consentPreferences.analytics) {
      setShouldLoadAnalytics(true);
    } else if (hasConsent === false) {
      setShouldLoadAnalytics(false);
    }
    // If hasConsent is null, don't load analytics yet (waiting for user decision)
  }, [hasConsent, consentPreferences.analytics]);

  // Listen for consent updates
  useEffect(() => {
    const handleConsentUpdate = (event: CustomEvent) => {
      const prefs = event.detail;
      setShouldLoadAnalytics(prefs.analytics === true);
    };

    window.addEventListener("cookie-consent-updated", handleConsentUpdate as EventListener);
    return () => {
      window.removeEventListener("cookie-consent-updated", handleConsentUpdate as EventListener);
    };
  }, []);

  // Don't render Analytics if user hasn't consented or has rejected analytics
  if (!shouldLoadAnalytics) {
    return null;
  }

  return <Analytics />;
}

