"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Users,
  Castle,
  Moon,
  Swords,
  ShieldCheck,
  CalendarClock,
  Terminal,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useRef, memo, useCallback } from "react";
import NavBar, { menuItems } from "@/components/NavBar";
import CommandGenerator from "@/components/command-generator";
import FeatureCarousel from "@/app/components/ui/FeatureCarousel";
import SectionHeader from "@/app/components/ui/SectionHeader";
import BuildsListHome from "@/components/builds/BuildsListHome";

// --- START: Icon mapping ---
// Helper to map icon names from Notion to actual components
const iconMap: { [key: string]: React.ElementType } = {
  Castle: Castle,
  Moon: Moon,
  Users: Users,
  Swords: Swords,
  ShieldCheck: ShieldCheck,
  CalendarClock: CalendarClock,
  Terminal: Terminal,
  // Add more mappings as needed based on the text you store in Notion for 'iconName'
};
// --- END: Icon mapping ---

// Global cache for loaded images to prevent reloading
const loadedImagesCache = new Set<string>();
const MAX_CACHE_SIZE = 50; // Limit cache size to prevent memory leaks

// Cleanup function for cache
const cleanupCache = () => {
  if (loadedImagesCache.size > MAX_CACHE_SIZE) {
    const cacheArray = Array.from(loadedImagesCache);
    const toRemove = cacheArray.slice(0, cacheArray.length - MAX_CACHE_SIZE);
    toRemove.forEach(url => loadedImagesCache.delete(url));
  }
};


export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [hasScrolledToSection, setHasScrolledToSection] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      // Auto-scroll to features section on first scroll
      if (currentScrollY > 10 && !hasScrolledToSection) {
        setHasScrolledToSection(true);
        const featuresSection = document.getElementById("features");
        featuresSection?.scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrolledToSection]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  // Define features data here, or fetch from an API
  const featuresData = [
    {
      icon: "command",
      image: "/images/features/Horse.webp",
      title: "Qol Commands",
      description:
        "Enjoy a consequence free environment with commands designed for smooth practice.",
    },
    {
      icon: "crossed-swords",
      image: "/images/features/Pancake.webp",
      title: "Game Modes",
      description:
        "Experience unique game modes, including the fan-favorite, Capture the Pancake.",
    },
    {
      icon: "calendar-clock",
      image: "/images/features/Events.webp",
      title: "Events",
      description:
        "Participate in regular events and tournaments with the PvP community.",
    },
    {
      icon: "moderation",
      image: "/images/features/Moderation.webp",
      title: "Moderation",
      description:
        "Enjoy a protected, safe space with active moderation and support.",
    },
  ];


  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <NavBar />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black to-black">
        {/*
        <div className="absolute inset-0 z-0">
          <BloodParticles />
        </div>
        */}

        {/* Static Background Image */}
        <div className="absolute inset-0 z-1 opacity-60 overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src="/hero-bg.webp"
              alt="Arena Background"
              fill
              className="object-cover"
              priority
              quality={80}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black"></div>
          </div>
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 z-2 bg-gradient-to-b from-black/80 via-black/30 to-black"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 z-3">
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10 -mt-20">
          <motion.div
            className="max-w-4xl mx-auto text-center space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            {/* Logo with enhanced styling */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 blur-2xl opacity-15"
                animate={{
                  opacity: [0.0, 0.4, 0.0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  // ease: "easeOutBack"
                }}
              >
                <Image
                  src="/varena-logo.svg"
                  alt="Varena Logo Glow"
                  width={500} //650
                  height={450}
                  className="mx-auto"
                />
              </motion.div>
              <Image
                src="/varena-logo.svg"
                alt="Varena Logo"
                width={500} //650
                height={450}
                className="mx-auto relative z-10 hover:scale-102 transition-transform duration-300"
                priority
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Animated scroll indicator - positioned relative to hero section */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          onClick={() => {
            const featuresSection = document.getElementById("features");
            featuresSection?.scrollIntoView({ behavior: "smooth" });
          }}
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center group transition-all duration-300 hover:scale-110 overflow-hidden z-20"
        >
          {/* Animated border */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              y: [3, 0, 3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 border-2 border-white/30 group-hover:border-white/60 rounded-full transition-colors duration-300"
          />

          {/* Animated caret */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-white/60 group-hover:text-white transition-colors relative z-10"
          >
            <ChevronRight className="h-6 w-6 rotate-90" />
          </motion.div>
        </motion.button>
      </section>

      {/* Features Section - Now uses the FeatureCarousel component */}
      <section id="features">
        <FeatureCarousel features={featuresData} />
      </section>

      {/* Builds Section */}
      <section id="builds" className="py-20 bg-black relative">
        <div className="container mx-auto px-4 relative">
          <SectionHeader
            title="Build Collection"
            subtitle="Builds Creator"
            description="Manage your custom builds or search for builds created by the community"
          />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <BuildsListHome />
          </motion.div>
        </div>
      </section>

      {/* Command Generator Section */}
      <section id="commands" className="py-20 bg-black relative">
        <div className="container mx-auto px-4 relative">
          <SectionHeader
            title="Command Generator"
            subtitle="Server Commands"
            description="Generate commands for V Arena"
          />
          <CommandGenerator />
        </div>
      </section>


      {/* Call to Action */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black to-transparent"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-black"></div>
        {<div className="absolute inset-0 z-0">
          <Image
            src="/flower.webp"
            alt="Background Pattern"
            fill
            className="object-cover opacity-30"
            loading="lazy"
            sizes="100vw"
            quality={60}
          />
        </div>}
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-6xl mx-auto"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 items-center gap-8 md:gap-12">
              {/* Left side - Logo */}
              <div className="flex justify-center md:justify-start">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={400}
                  height={400}
                  className="w-full max-w-[300px] md:max-w-[400px] h-auto object-contain relative z-10"
                  priority
                />
              </div>

              {/* Right side - Call to action */}
              <div className="p-4 sm:p-8 md:p-12 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent uppercase">
                    United by our thirst for blood
                  </h2>
                  <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                    Join a community of both new and experienced players.
                    Sharpen your skills, test new playstyles, and join your kin
                    for the hunt!
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mb-6 sm:mb-8"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-white bg-[#0f0a47] hover:bg-[#4752C4] border-[#5865F2] hover:border-[#4752C4] transition-all duration-300 relative overflow-hidden group px-4 sm:px-8 w-full py-6 sm:py-8 gap-4"
                    >
                      <Link
                        href="https://discord.gg/varena"
                        target="_blank"
                        className="flex items-center justify-center gap-2 sm:gap-4"
                      >
                        <Image
                          src="/discord.svg"
                          alt="Discord"
                          width={32}
                          height={32}
                          className="h-6 w-6 sm:h-8 sm:w-8 group-hover:scale-110 transition-transform"
                        />
                        <span className="text-xl sm:text-2xl font-bold tracking-wider">
                          JOIN THE ARENA
                        </span>
                        <motion.span
                          className="absolute inset-0 bg-white/10"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </Link>
                    </Button>
                  </motion.div>
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 sm:gap-6 text-sm text-gray-400">
                    <motion.div
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.05, color: "#fff" }}
                    >
                      <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="font-semibold">7,000+ Members</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-2 text-center sm:text-left"
                      whileHover={{ scale: 1.05, color: "#fff" }}
                    >
                      <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="font-semibold">
                        Active 24/7 as long as Rendy doesn't sleep
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-slate-800 py-12 relative">
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <motion.div
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Image
                    src="/varena-logo.svg"
                    alt="Varena Logo"
                    width={200}
                    height={200}
                    className="hover:scale-110 transition-transform duration-300"
                  />
                </motion.div>
              </Link>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Links</h3>
              <ul className="space-y-2 text-sm text-gray-100">
                {menuItems.map(
                  (item: { name: string; href: string }, i: number) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        href={`${item.href}`}
                        className="hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    </motion.li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Community</h3>
              <ul className="space-y-2 text-sm text-gray-100">
                {[
                  { name: "Discord", href: "https://www.discord.gg/varena" },
                  { name: "Twitter", href: "https://www.x.com/VRisingVArena" },
                  {
                    name: "YouTube",
                    href: "https://www.youtube.com/@VRisingArena",
                  },
                  { name: "Twitch", href: "https://www.twitch.tv/varenatv" },
                ].map((item, i) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href={item.href}
                      className="hover:text-white transition-colors"
                      target="_blank"
                    >
                      {item.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-100">
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0 }}
                  viewport={{ once: true }}
                >
                  <Link href="/privacy-policy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href="/terms-of-service" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <Link href="/cookie-policy" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </motion.li>
              </ul>
            </div>
          </div>
          <motion.div
            className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-700"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p>© {new Date().getFullYear()} V Arena. All rights reserved.</p>
            <p className="mt-2">
              This is a fan-made website and is not affiliated with Stunlock
              Studios.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
