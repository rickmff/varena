"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Play,
  Users,
  Castle,
  Moon,
  Swords,
  ShieldCheck,
  CalendarClock,
  Terminal,
  Plus,
  Newspaper,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import BloodParticles from "@/components/blood-particles";
import NavBar, { DiscordButton, menuItems } from "@/components/NavBar";
import CommandGenerator from "@/components/command-generator";
import FeatureCarousel from "@/app/components/ui/FeatureCarousel";
import BuildsList from "@/components/builds/BuildsList";
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

// Define a type for your news items fetched from Notion
interface NewsItem {
  id: string; // Notion page ID
  title: string;
  date: string; // Or Date object, depending on how you process it
  excerpt: string;
  category: string;
  iconName: string; // e.g., "Castle", "Moon"
  slug?: string; // Optional slug for news posts
  coverImageUrl?: string; // Cover image from Notion
  // Additional optional properties that might come from different APIs
  _id?: string; // Alternative ID field
  name?: string; // Alternative title field
  createdAt?: string; // Alternative date field
  created_time?: string; // Another alternative date field
  description?: string; // Alternative excerpt field
  content?: string; // Full content field
  type?: string; // Alternative category field
  image?: string; // Alternative cover image field
  cover?: string; // Another alternative cover image field
  // Add other fields if necessary
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]); // State for news items
  const [isLoadingNews, setIsLoadingNews] = useState(true); // Add loading state
  const [newsError, setNewsError] = useState<string | null>(null); // Add error state
  const [hasBuilds, setHasBuilds] = useState(false); // State for whether user has builds
  const [hasScrolledToSection, setHasScrolledToSection] = useState(false); // Track if we've already scrolled to section

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

  const fetchNewsFromAPI = async (retryCount = 0) => {
    const maxRetries = 2;

    try {
      if (retryCount === 0) {
        setIsLoadingNews(true);
      }
      setNewsError(null); // Clear any previous errors

      const response = await fetch("/api/news", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Add cache control to prevent stale data
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      } else {
        // Ensure data is an array and has items
        const newsData = Array.isArray(data) ? data : [];

        // Set the news items immediately
        setNewsItems(newsData);
        setNewsError(null);

        // Success - set loading to false immediately
        setIsLoadingNews(false);
      }
    } catch (error) {
      // Retry logic
      if (retryCount < maxRetries) {
        setTimeout(() => {
          fetchNewsFromAPI(retryCount + 1);
        }, (retryCount + 1) * 1000); // Exponential backoff
      } else {
        // Max retries reached
        setNewsError(
          error instanceof Error
            ? error.message
            : "Failed to fetch news after multiple attempts"
        );
        setNewsItems([]);
        setIsLoadingNews(false);
      }
    }
  };

  useEffect(() => {
    fetchNewsFromAPI();
  }, []);

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
      image: "/images/features/Horse.png",
      title: "Qol Commands",
      description:
        "Enjoy a consequence free environment with commands designed for smooth practice.",
    },
    {
      icon: "crossed-swords",
      image: "/images/features/Pancake.png",
      title: "Game Modes",
      description:
        "Experience unique game modes, including the fan-favorite, Capture the Pancake.",
    },
    {
      icon: "calendar-clock",
      image: "/images/features/Events.png",
      title: "Events",
      description:
        "Participate in regular events and tournaments with the PvP community.",
    },
    {
      icon: "moderation",
      image: "/images/features/Moderation.png",
      title: "Moderation",
      description:
        "Enjoy a protected, safe space with active moderation and support.",
    },
  ];

  // News Card Skeleton Component
  const NewsCardSkeleton = () => (
    <motion.div
      variants={scaleIn}
      className="bg-black/80 backdrop-blur-sm rounded-lg border-2 border-red-900/30 overflow-hidden h-full relative"
    >
      {/* Image Skeleton */}
      <div className="relative aspect-video bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent animate-shimmer"></div>

        {/* Category Badge Skeleton */}
        <div className="absolute top-4 right-4">
          <div className="bg-zinc-800 rounded-full px-3 py-1.5 animate-pulse">
            <div className="w-16 h-3 bg-zinc-700 rounded"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6 space-y-3">
        {/* Date Skeleton */}
        <div className="w-24 h-3 bg-zinc-800 rounded animate-pulse"></div>

        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="w-full h-5 bg-zinc-800 rounded animate-pulse"></div>
          <div className="w-3/4 h-5 bg-zinc-800 rounded animate-pulse"></div>
        </div>

        {/* Excerpt Skeleton */}
        <div className="space-y-2 pt-2">
          <div className="w-full h-3 bg-zinc-800 rounded animate-pulse"></div>
          <div className="w-full h-3 bg-zinc-800 rounded animate-pulse"></div>
          <div className="w-2/3 h-3 bg-zinc-800 rounded animate-pulse"></div>
        </div>

        {/* Read More Button Skeleton */}
        <div className="pt-4">
          <div className="w-20 h-3 bg-zinc-800 rounded animate-pulse"></div>
        </div>
      </div>
    </motion.div>
  );

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

        {/* YouTube Video Background */}
        <div className="absolute inset-0 z-1 opacity-60">
          <div className="yt-embed-holder">
            <iframe
              src="https://www.youtube.com/embed/gjzwjlCSbes?autoplay=1&mute=1&loop=1&playlist=gjzwjlCSbes&controls=0&showinfo=0&rel=0&modestbranding=1"
              title="Arena Background"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
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
            subtitle="Build Library"
            description="Access starter templates and manage your custom builds"
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
            description="Generate commands for our V Arena Server"
          />
          <CommandGenerator />
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-20 bg-black relative">
        <div className="container mx-auto px-4 relative">
          <SectionHeader
            title="News & Updates"
            subtitle="Chronicles of V Rising"
            description="Stay informed about the latest updates, events, and community highlights"
          />
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          >
            {(() => {
              // Loading state
              if (isLoadingNews) {
                return [...Array(3)].map((_, index) => (
                  <NewsCardSkeleton key={`skeleton-${index}`} />
                ));
              }

              // Error state
              if (newsError) {
                return (
                  <motion.div
                    className="col-span-full text-center py-12"
                    variants={fadeInUp}
                  >
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-2xl font-semibold text-red-400 mb-2">
                      Failed to Load News
                    </h3>
                    <p className="text-gray-400 mb-4">{newsError}</p>
                    <button
                      onClick={() => fetchNewsFromAPI()}
                      className="px-4 py-2 bg-red-900/50 border border-red-900/50 text-white rounded-lg hover:bg-red-900/70 transition-colors"
                    >
                      Try Again
                    </button>
                  </motion.div>
                );
              }

              // Check if we have valid news items
              if (Array.isArray(newsItems) && newsItems.length > 0) {
                return newsItems
                  .slice(0, 3)
                  .map((news, index) => {
                    // More flexible validation - check if we have at least some content
                    if (!news) {
                      return null;
                    }

                    // Use fallbacks for missing properties
                    const newsId = news.id || news._id || `news-${index}`;
                    const newsTitle =
                      news.title || news.name || `News Item ${index + 1}`;
                    const newsSlug = news.slug || newsId;
                    const newsDate =
                      news.date ||
                      news.createdAt ||
                      news.created_time ||
                      new Date().toISOString();
                    const newsExcerpt =
                      news.excerpt ||
                      news.description ||
                      news.content?.substring(0, 150) ||
                      "Read more to discover the latest updates...";
                    const newsCategory = news.category || news.type || "News";
                    const newsCoverImage =
                      news.coverImageUrl ||
                      news.image ||
                      news.cover ||
                      "/news.png";

                    const IconComponent = iconMap[news.iconName] || Terminal;

                    return (
                      <motion.div
                        key={newsId}
                        whileHover={{
                          y: -10,
                          scale: 1.02,
                          transition: { duration: 0.2 },
                        }}
                        className="h-full"
                      >
                        <Link
                          href={`/news/${newsSlug}`}
                          className="bg-black/90 backdrop-blur-sm rounded-lg border-2 border-red-900/50 hover:border-red-500
                               transition-all duration-300 overflow-hidden group block h-full relative"
                        >
                          {/* Glow effect on hover */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-transparent to-red-900/20" />
                          </div>

                          <div className="relative aspect-video">
                            <img
                              src={newsCoverImage}
                              alt={newsTitle}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src !== "/news.png") {
                                  target.src = "/news.png";
                                }
                              }}
                            />

                            {/* Category Badge */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                              <div className="bg-red-900/90 text-white text-xs px-3 py-1.5 rounded-full font-bold border border-red-500/50 shadow-lg shadow-red-900/50 flex items-center gap-2 pointer-events-none">
                                {IconComponent && (
                                  <IconComponent className="w-3 h-3" />
                                )}
                                {newsCategory}
                              </div>
                            </div>
                          </div>

                          <div className="p-6 relative">
                            <div className="text-red-500 text-sm mb-2 font-bold tracking-wider">
                              {new Date(newsDate).toLocaleDateString()}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-red-400 transition-colors">
                              {newsTitle}
                            </h3>
                            <p className="text-gray-300 mb-4">{newsExcerpt}</p>

                            {/* Read More Button */}
                            <div className="flex items-center gap-2 text-red-500 text-sm font-bold group-hover:text-red-400 transition-colors">
                              READ MORE
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })
                  .filter(Boolean); // Remove any null items
              }

              // Empty state
              return (
                <motion.div
                  className="col-span-full text-center py-12"
                  variants={fadeInUp}
                >
                  <div className="text-6xl mb-4">📰</div>
                  <h3 className="text-2xl font-semibold text-gray-300 mb-2">
                    No News Available
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Check back later for the latest updates and announcements.
                  </p>
                  <p className="text-sm text-gray-500">
                    If this persists, please ensure your Notion integration is
                    correctly configured.
                  </p>
                </motion.div>
              );
            })()}
          </motion.div>

          {/* View All Button - Only show when not loading and has news */}
          {!isLoadingNews &&
            !newsError &&
            newsItems &&
            newsItems.length > 0 && (
              <motion.div
                className="text-center mt-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link
                    href="/builds"
                    className="flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 p-4 group cursor-pointer">
                      {/* Library icon */}
                      <div className="w-10 h-10 rounded-full border-2 border-red-900/50 flex items-center justify-center group-hover:border-red-500 transition-colors duration-300">
                        <Newspaper className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors duration-300" />
                      </div>

                      {/* Text */}
                      <span className="text-white group-hover:text-red-300 font-bold text-sm tracking-wide transition-colors duration-300">
                        VIEW ALL THE NEWS
                      </span>
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black to-transparent"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-black"></div>
        <div className="absolute inset-0 z-0 bg-[url('/flower.png')] bg-center bg-cover opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-6xl mx-auto "
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 items-center">
              {/* Left side - Discord preview */}

              <Image
                src="/logo.png"
                alt="Logo"
                width={400}
                height={400}
                className="w-full h-auto object-contain relative z-10"
              />

              {/* Right side - Call to action */}
              <div className="p-12 md:p-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent uppercase">
                    United by our thirst for blood
                  </h2>
                  <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                    Join a community of both new and experienced players.
                    Sharpen your skills, test new playstyles, and join your kin
                    for the hunt!
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mb-8"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-white bg-[#0f0a47] hover:bg-[#4752C4] border-[#5865F2] hover:border-[#4752C4] transition-all duration-300 relative overflow-hidden group px-8 w-full py-8 gap-4"
                    >
                      <Link
                        href="https://discord.gg/varena"
                        target="_blank"
                        className="flex items-center justify-center gap-4"
                      >
                        <Image
                          src="/discord.svg"
                          alt="Discord"
                          width={32}
                          height={32}
                          className="h-8 w-8 group-hover:scale-110 transition-transform"
                        />
                        <span className="text-2xl font-bold tracking-wider">
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
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400 truncate">
                    <motion.div
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.05, color: "#fff" }}
                    >
                      <Users className="h-5 w-5" />
                      <span className="font-semibold">7,000+ Members</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.05, color: "#fff" }}
                    >
                      <Moon className="h-5 w-5" />
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
                        href={`#${item.href}`}
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
            {/*             <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-100">
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "EULA"].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link href="#" className="hover:text-white transition-colors">
                      {item}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div> */}
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
