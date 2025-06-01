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
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import BloodParticles from "@/components/blood-particles";
import NavBar, { DiscordButton, menuItems } from "@/components/NavBar";
import CommandGenerator from "@/components/command-generator";
import FeatureCarousel from "@/app/components/ui/FeatureCarousel";
import BuildsList from "@/components/builds/BuildsList";
import SectionHeader from "@/app/components/ui/SectionHeader";

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

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      title: "Easy Commands",
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
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
        <div className="absolute inset-0 z-0">
          <BloodParticles />
        </div>
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="/hero-bg.png"
            alt="V Rising Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-12 flex flex-col items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Image
              src="/varena-logo.png"
              alt="Varena Logo"
              className="mr-10"
              width={550}
              height={379}
            />
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div
                variants={fadeIn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <DiscordButton size="lg" />
              </motion.div>
              <motion.div
                variants={fadeIn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 border-white/70 text-white hover:bg-zinc-900/70 bg-black relative overflow-hidden group"
                  onClick={() => (window.location.hash = "#generate-commands")}
                >
                  <span className="relative z-10">Get Started</span>
                  <Play className="h-4 w-4 relative z-10" />
                  <motion.span
                    className="absolute inset-0 bg-white/10"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative mx-auto max-w-5xl aspect-video rounded-lg overflow-hidden shadow-2xl shadow-purple-900/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative aspect-video">
              <iframe
                src="https://www.youtube.com/embed/pxQvrcn6Z6Y"
                title="V Rising Gameplay"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Now uses the FeatureCarousel component */}
      <FeatureCarousel features={featuresData} />

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

      {/* Builds Section */}
      <section id="builds" className="py-20 bg-black relative">
        <div className="container mx-auto px-4 relative">
          <SectionHeader
            title="Build Collection"
            subtitle="Your Builds"
            description="Manage your saved builds and create new combinations"
          />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <BuildsList
              maxBuilds={3}
              showViewAllButton={true}
              onBuildsLoaded={setHasBuilds}
            />
          </motion.div>

          {/* View All Builds Button - Only show when builds exist */}
          {hasBuilds && (
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
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-red-900 text-white hover:bg-red-900/20 hover:border-red-500
                           relative overflow-hidden group px-8 shadow-lg shadow-red-900/20"
                >
                  <Link href="/builds" className="flex items-center">
                    <span className="relative z-10 font-bold tracking-wider">
                      MANAGE ALL BUILDS
                    </span>
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-red-900/40 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
            </motion.div>
          )}
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
                        className="relative z-10"
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{
                          y: -10,
                          scale: 1.02,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <Link
                          href={`/news/${newsSlug}`}
                          className="bg-black/90 backdrop-blur-sm rounded-lg border-2 border-red-900/50 hover:border-red-500
                               transition-all duration-300 overflow-hidden group block h-full relative z-10"
                        >
                          {/* Glow effect on hover */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-transparent to-red-900/20" />
                          </div>

                          <div className="relative aspect-video z-10">
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
                            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                              <div className="bg-red-900/90 text-white text-xs px-3 py-1.5 rounded-full font-bold border border-red-500/50 shadow-lg shadow-red-900/50 flex items-center gap-2">
                                {IconComponent && (
                                  <IconComponent className="w-3 h-3" />
                                )}
                                {newsCategory}
                              </div>
                            </div>
                          </div>

                          <div className="p-6 relative z-10">
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
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-red-900 text-white hover:bg-red-900/20 hover:border-red-500
                           relative overflow-hidden group px-8 shadow-lg shadow-red-900/20"
                  >
                    <Link href="/news" className="flex items-center">
                      <span className="relative z-10 font-bold tracking-wider">
                        VIEW ALL NEWS
                      </span>
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                    </Link>
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-red-900/40 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
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
                      className="text-white bg-[#5865F2] hover:bg-[#4752C4] border-[#5865F2] hover:border-[#4752C4] transition-all duration-300 relative overflow-hidden group px-8 w-full py-8 gap-4"
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
      <footer className="bg-black border-t border-red-900/30 py-12 relative">
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <motion.div
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Image
                    src="/varena-logo.png"
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
            className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-gray-300"
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
