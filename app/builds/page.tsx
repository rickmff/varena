"use client";

import React, { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import BuildsList from "@/components/builds/BuildsList";
import PublicBuildsList from "@/components/builds/PublicBuildsList";
import SectionHeader from "@/app/components/ui/SectionHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Globe, Cloud, ThumbsUp, Hammer, Users } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

export default function Builds() {
  return (
    <Suspense>
      <BuildsContent />
    </Suspense>
  );
}

function BuildsContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabFromUrl = searchParams.get("tab");
  const validTabs = ["mine", "community"];
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "mine";

  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab state when URL changes
  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/builds?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      className="min-h-screen bg-black text-white overflow-auto"
      id="builder-page"
    >
      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="/hero-bg.webp"
            alt="V Rising Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <SectionHeader
            title="Build Collection"
            subtitle={activeTab === "mine" ? "Your Builds" : "Community Builds"}
          />
        </div>
      </section>

      {/* Builds Section */}
      <section className="bg-black relative -mt-20 pb-20">
        <div className="container mx-auto px-4 relative z-10">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg p-1.5 shadow-lg h-fit gap-2 w-full max-w-md mx-auto">
                <TabsTrigger
                  value="mine"
                  className="relative z-0 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-gray-400 hover:text-white hover:bg-white/5 transition-colors duration-300 rounded-md py-2.5 px-6 font-semibold text-sm uppercase tracking-wider data-[state=active]:text-white w-full"
                >
                  {activeTab === "mine" && (
                    <motion.div
                      layoutId="active-tab-bg"
                      className="absolute inset-0 bg-gradient-to-r from-red-900/70 to-red-800/50 rounded-md shadow-lg shadow-red-900/30 border border-red-700/30 z-[-1]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div className="flex items-center gap-2 relative z-10">
                    <Hammer className="w-4 h-4" />
                    <span>MY BUILDS</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="community"
                  className="relative z-0 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-gray-400 hover:text-white hover:bg-white/5 transition-colors duration-300 rounded-md py-2.5 px-6 font-semibold text-sm uppercase tracking-wider data-[state=active]:text-white w-full"
                >
                  {activeTab === "community" && (
                    <motion.div
                      layoutId="active-tab-bg"
                      className="absolute inset-0 bg-gradient-to-r from-red-900/70 to-red-800/50 rounded-md shadow-lg shadow-red-900/30 border border-red-700/30 z-[-1]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div className="flex items-center gap-2 relative z-10">
                    <Users className="w-4 h-4" />
                    <span>COMMUNITY</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Sign In Benefits Banner */}
            {!isAuthenticated && !authLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-4 rounded-lg border border-yellow-500/10 bg-yellow-500/5 backdrop-blur-sm"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-2">
                      Sign in to sync builds across devices, publish to the community, and vote on builds.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Cloud className="w-3.5 h-3.5" />
                        <span>Cloud sync</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Publish builds</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Vote & rate</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/auth/signin">
                      <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30">
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === "mine" ? (
                <motion.div
                  key="mine"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <BuildsList />
                </motion.div>
              ) : (
                <motion.div
                  key="community"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <PublicBuildsList />
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
