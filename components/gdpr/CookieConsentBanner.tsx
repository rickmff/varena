"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Settings, Cookie } from "lucide-react";
import Link from "next/link";
import { useCookieConsent } from "@/hooks/use-cookie-consent";

export default function CookieConsentBanner() {
  const {
    hasConsent,
    consentPreferences,
    acceptAll,
    rejectAll,
    savePreferences,
    openSettings,
    closeSettings,
    isSettingsOpen,
    updatePreference
  } = useCookieConsent();

  if (hasConsent !== null) {
    return null; // User has already made a choice
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
      >
        <Card className="mx-auto max-w-4xl bg-black/95 border-[#5865F2]/50 backdrop-blur-lg shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Cookie className="h-6 w-6 text-[#5865F2]" />
                <div>
                  <CardTitle className="text-white text-lg md:text-xl">
                    We value your privacy
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-1">
                    We use cookies to enhance your browsing experience and analyze site traffic.
                  </CardDescription>
                </div>
              </div>
              {isSettingsOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeSettings}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {!isSettingsOpen ? (
              <>
                <p className="text-sm text-gray-300">
                  By clicking "Accept All", you consent to our use of cookies. You can customize your preferences or learn more in our{" "}
                  <Link href="/privacy-policy" className="text-[#5865F2] hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/cookie-policy" className="text-[#5865F2] hover:underline">
                    Cookie Policy
                  </Link>
                  .
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={acceptAll}
                    className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white"
                  >
                    Accept All
                  </Button>
                  <Button
                    onClick={rejectAll}
                    variant="outline"
                    className="flex-1 border-[#5865F2]/50 text-white hover:bg-[#0f0a47]"
                  >
                    Reject All
                  </Button>
                  <Button
                    onClick={openSettings}
                    variant="outline"
                    className="flex-1 border-[#5865F2]/50 text-white hover:bg-[#0f0a47] flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Customize
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f0a47]/30 border border-[#5865F2]/20">
                    <div className="flex-1">
                      <Label htmlFor="necessary" className="text-white font-medium cursor-pointer">
                            Necessary Cookies
                          </Label>
                      <p className="text-xs text-gray-400 mt-1">
                        Essential for the website to function. Cannot be disabled.
                      </p>
                    </div>
                    <Switch
                      id="necessary"
                      checked={true}
                      disabled
                      className="opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f0a47]/30 border border-[#5865F2]/20">
                    <div className="flex-1">
                      <Label htmlFor="analytics" className="text-white font-medium cursor-pointer">
                            Analytics Cookies
                          </Label>
                      <p className="text-xs text-gray-400 mt-1">
                        Help us understand how visitors interact with our website (Vercel Analytics).
                      </p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={consentPreferences.analytics}
                      onCheckedChange={(checked) => updatePreference("analytics", checked)}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={savePreferences}
                    className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white"
                  >
                    Save Preferences
                  </Button>
                  <Button
                    onClick={closeSettings}
                    variant="outline"
                    className="flex-1 border-[#5865F2]/50 text-white hover:bg-[#0f0a47]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

