"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import BuildsList from "@/components/builds/BuildsList";
import PublicBuildsList from "@/components/builds/PublicBuildsList";
import SectionHeader from "@/app/components/ui/SectionHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, Globe, Cloud, ThumbsUp } from "lucide-react";

export default function Builds() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("mine");

  // Set default tab to "community" for unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setActiveTab("community");
    }
  }, [isAuthenticated, authLoading]);

  return (
    <div
      className="min-h-screen bg-black text-white overflow-auto"
      id="builder-page"
    >
      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="/hero-bg.webp"
            alt="V Rising Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-black/50 border border-white/10">
              <TabsTrigger
                value="mine"
                className="data-[state=active]:bg-red-900/50 data-[state=active]:text-white"
              >
                MAKE YOUR OWN
              </TabsTrigger>
              <TabsTrigger
                value="community"
                className="data-[state=active]:bg-red-900/50 data-[state=active]:text-white"
              >
                COMMUNITY
              </TabsTrigger>
            </TabsList>

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

            <TabsContent value="mine">
              <BuildsList />
            </TabsContent>
            <TabsContent value="community">
              <PublicBuildsList />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
