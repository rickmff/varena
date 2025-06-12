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
import { useState, useEffect, useMemo, useRef, memo } from "react";
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
  slug: string; // Make slug required
  coverImageUrl: string; // Make coverImageUrl required
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
}

// News Card Component - Memoized
const NewsCard = memo(({ news, index, onImageError }: {
  news: NewsItem;
  index: number;
  onImageError: (url: string) => void;
}) => {
  // Add null check for news
  if (!news) {
    console.warn('NewsCard received null/undefined news prop');
    return null;
  }

  // Validate required properties
  if (!news.id || !news.title || !news.slug || !news.date || !news.excerpt || !news.category || !news.iconName || !news.coverImageUrl) {
    console.warn('NewsCard received news item with missing required properties:', news);
    return null;
  }

  const IconComponent = iconMap[news.iconName] || Terminal;
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const handleImageError = (url: string) => {
    setImageError(true);
    onImageError(url);
  };

  // Use fallback image if no cover image URL is provided or if there was an error
  const imageUrl = (!news.coverImageUrl || imageError) ? '/news.png' : news.coverImageUrl;

  return (
    <motion.div
      ref={cardRef}
      key={news.id}
      whileHover={{
        y: -10,
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className="h-full"
    >
      <Link
        href={`/news/${news.slug}`}
        className="bg-black/90 backdrop-blur-sm rounded-lg border-2 border-red-900/50 hover:border-red-500
                 transition-all duration-300 overflow-hidden group block h-full relative"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-transparent to-red-900/20" />
        </div>

        <div className="relative aspect-video">
          {isVisible && (
            <Image
              src={imageUrl}
              alt={news.title}
              width={640}
              height={360}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading={index === 0 ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwMDAwIiAvPjwvc3ZnPg=="
              onError={() => handleImageError(imageUrl)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={75}
              priority={index === 0}
              unoptimized={imageUrl.startsWith('data:') || imageUrl === '/news.png'}
            />
          )}

          {/* Category Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="bg-red-900/90 text-white text-xs px-3 py-1.5 rounded-full font-bold border border-red-500/50 shadow-lg shadow-red-900/50 flex items-center gap-2 pointer-events-none">
              {IconComponent && (
                <IconComponent className="w-3 h-3" />
              )}
              {news.category}
            </div>
          </div>
        </div>

        <div className="p-6 relative">
          <div className="text-red-500 text-sm mb-2 font-bold tracking-wider">
            {new Date(news.date).toLocaleDateString()}
          </div>
          <h3 className="text-xl font-bold mb-3 text-white group-hover:text-red-400 transition-colors">
            {news.title}
          </h3>
          <p className="text-gray-300 mb-4">{news.excerpt}</p>

          {/* Read More Button */}
          <div className="flex items-center gap-2 text-red-500 text-sm font-bold group-hover:text-red-400 transition-colors">
            READ MORE
            <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

NewsCard.displayName = 'NewsCard';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [hasBuilds, setHasBuilds] = useState(false);
  const [hasScrolledToSection, setHasScrolledToSection] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchNewsFromAPI = async (retryCount = 0) => {
    try {
      const response = await fetch("/api/news");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setNewsItems(data);
      setIsLoadingNews(false);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      if (retryCount < 3) {
        setTimeout(() => fetchNewsFromAPI(retryCount + 1), 1000 * Math.pow(2, retryCount));
      } else {
        setNewsError(error instanceof Error ? error.message : "Failed to fetch news");
        setIsLoadingNews(false);
      }
    }
  };

  useEffect(() => {
    fetchNewsFromAPI();
  }, []);

  const handleImageError = (imageUrl: string) => {
    setImageLoadErrors((prev) => ({ ...prev, [imageUrl]: true }));
  };

  return (
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
            subtitle="Echoes of V Arena"
            description="Stay informed about the latest updates, events, and community highlights"
          />
        </div>
      </section>

      {/* News Grid */}
      <section className="pb-20 pt-4 bg-black relative">
        <div className="container mx-auto px-4 relative">
          {isLoadingNews ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, scale: 0.9 },
                      visible: {
                        opacity: 1,
                        scale: 1,
                        transition: { duration: 0.5 },
                      },
                    }}
                  >
                    <div className="bg-black/90 backdrop-blur-sm rounded-lg border-2 border-red-900/50 overflow-hidden">
                      <div className="aspect-video bg-gray-900 animate-pulse" />
                      <div className="p-6">
                        <div className="h-4 w-24 bg-gray-800 rounded animate-pulse mb-2" />
                        <div className="h-6 w-3/4 bg-gray-800 rounded animate-pulse mb-3" />
                        <div className="h-4 w-full bg-gray-800 rounded animate-pulse mb-2" />
                        <div className="h-4 w-2/3 bg-gray-800 rounded animate-pulse" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : newsError ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                Failed to Load News
              </h2>
              <p className="text-gray-400 mb-6">{newsError}</p>
              <button
                onClick={() => fetchNewsFromAPI()}
                className="px-6 py-3 bg-red-900/50 border border-red-900/50 text-white font-medium rounded-lg hover:bg-red-900/70 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : newsItems.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {newsItems.map((news, index) => (
                <NewsCard
                  key={news.id}
                  news={news}
                  index={index}
                  onImageError={handleImageError}
                />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📰</div>
              <h2 className="text-2xl font-semibold text-gray-400 mb-2">
                No News Available
              </h2>
              <p className="text-gray-500">
                Check back later for updates and announcements.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}