"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronRight,
  Terminal,
  Castle,
  Moon,
  Users,
  Swords,
  ShieldCheck,
  CalendarClock,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import { NewsCardSkeletonGrid } from "@/components/NewsCardSkeleton";
import SectionHeader from "@/app/components/ui/SectionHeader";

// Icon mapping
const iconMap: { [key: string]: React.ElementType } = {
  Castle: Castle,
  Moon: Moon,
  Users: Users,
  Swords: Swords,
  ShieldCheck: ShieldCheck,
  CalendarClock: CalendarClock,
  Terminal: Terminal,
};

interface NewsItem {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  iconName: string;
  slug?: string;
  coverImageUrl?: string;
}

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/news");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setNewsItems(data as NewsItem[]);
      } catch (error) {
        console.error("Failed to fetch news:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch news"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
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

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      <div className="min-h-screen bg-black text-white">
        <NavBar />

        {/* Hero Section */}
        <section className="relative pt-24 pb-4 md:pt-32 overflow-hidden bg-gradient-to-b from-black to-black">
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
            <SectionHeader
              title="News & Updates"
              subtitle="📰 Chronicles of V Rising"
              description="Stay informed about the latest updates, events, and community highlights from the V Arena"
            />
          </div>
        </section>

        {/* News Grid */}
        <section className="pb-20 pt-4 bg-black relative">
          <div className="container mx-auto px-4 relative">
            {loading ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <NewsCardSkeletonGrid count={3} />
              </motion.div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-semibold text-red-400 mb-2">
                  Failed to Load News
                </h2>
                <p className="text-gray-400 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-red-900/50 border border-red-900/50 text-white font-medium rounded-lg hover:bg-red-900/70 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : newsItems.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {/* Is right now showing 9 news cards */}
                {newsItems.slice(0, 9).map((news, index) => {
                  const IconComponent = iconMap[news.iconName] || Terminal;
                  return (
                    <motion.div
                      key={news.id}
                      variants={scaleIn}
                      whileHover={{
                        y: -10,
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <Link
                        href={`/news/${news.slug || news.id}`}
                        className="bg-black/80 backdrop-blur-sm rounded-lg border-2 border-red-900/30 hover:border-red-500
                             transition-all duration-300 overflow-hidden group block h-full relative"
                      >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-transparent to-red-900/20" />
                        </div>

                        <div className="relative aspect-video">
                          <Image
                            src={news.coverImageUrl || `/news.png`}
                            alt={news.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110 filter brightness-60"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src !== "/news.png") {
                                target.src = "/news.png";
                              }
                            }}
                          />

                          {/* Category Badge */}
                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            <motion.div
                              className="bg-red-900/80 text-white text-xs px-3 py-1.5 rounded-full font-bold
                                   border border-red-500/50 shadow-lg shadow-red-900/50 pointer-events-none"
                              whileHover={{ scale: 1.05 }}
                            >
                              <div className="flex items-center gap-2">
                                {IconComponent && (
                                  <IconComponent className="w-3 h-3" />
                                )}
                                {news.category}
                              </div>
                            </motion.div>
                          </div>
                        </div>

                        <div className="p-6 relative">
                          <div className="text-red-500 text-sm mb-2 font-bold tracking-wider">
                            {new Date(news.date).toLocaleDateString()}
                          </div>
                          <h3 className="text-xl font-bold mb-3 group-hover:text-red-400 transition-colors">
                            {news.title}
                          </h3>
                          <p className="text-gray-300 line-clamp-3">
                            {news.excerpt}
                          </p>

                          {/* Read More Button */}
                          <motion.div
                            className="mt-6 flex items-center gap-2 text-red-500 text-sm font-bold
                                 group-hover:text-red-400 transition-colors"
                            initial={{ x: -10, opacity: 0 }}
                            whileHover={{ x: 5 }}
                            animate={{ x: 0, opacity: 1 }}
                          >
                            READ MORE
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                          </motion.div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <NewsCardSkeletonGrid count={9} />
                <div className="text-center py-12 mt-8">
                  <div className="text-6xl mb-4">📰</div>
                  <h2 className="text-2xl font-semibold text-gray-300 mb-2">
                    No News Yet
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Check back soon for new content, or make sure your Notion
                    page ID is configured correctly.
                  </p>
                  <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-yellow-300">
                      <strong>Setup tip:</strong> Add{" "}
                      <code className="bg-black/50 px-1 rounded">
                        NOTION_NEWS_PAGE_ID
                      </code>{" "}
                      to your .env file with the ID of your Notion page
                      containing news posts.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Back to Home */}
        {/* <section className="py-12 bg-black border-t border-red-900/30">
          <div className="container mx-auto px-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center py-3text-white font-medium transition-all duration-200 hover:scale-105"
            >
              ← Back to Home
            </Link>
          </div>
        </section> */}
      </div>
    </>
  );
}
