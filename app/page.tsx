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
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import BloodParticles from "@/components/blood-particles";
import NavBar, { menuItems } from "@/components/NavBar";
import CommandGenerator from "@/components/command-generator";
import FeatureCarousel from "@/app/components/ui/FeatureCarousel";

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
  // Add other fields if necessary
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]) // State for news items

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchNewsFromAPI = async () => {
      try {
        const response = await fetch('/api/news');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          console.error("API returned error:", data.error);
          setNewsItems([]);
          return;
        }

        setNewsItems(data as NewsItem[]);
      } catch (error) {
        console.error("Failed to fetch news:", error);
        setNewsItems([]);
      }
    };

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
        "Commands to make it easier to practice and improve your skills.",
    },
    {
      icon: "crossed-swords",
      image: "/images/features/Pancake.png",
      title: "Game Modes",
      description: "Experience unique game modes like Pancake.",
    },
    {
      icon: "calendar-clock",
      image: "/images/features/Events.png",
      title: "Events",
      description:
        "Participate in exciting events and challenges to earn rewards.",
    },
    {
      icon: "moderation",
      image: "/images/features/Moderation.png",
      title: "Moderation",
      description:
        "Maintaining a safe and enjoyable environment for all players.",
    },
  ];

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
              width={600}
              height={400}
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
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 relative overflow-hidden group border-purple-900 hover:bg-zinc-900/70 bg-black text-white flex items-center"
                >
                  <Link
                    href="https://discord.gg/varena"
                    target="_blank"
                    className="flex items-center justify-center gap-4"
                  >
                    <Image
                      src="/discord.svg"
                      alt="Varena Logo"
                      width={20}
                      height={20}
                      className="h-5 w-5 mr-2"
                    />
                    <span className="relative z-10">JOIN US</span>
                    <motion.span
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </Button>
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

      <section className="py-32 relative" id="generate-commands">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black to-transparent"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-black"></div>
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/background/Powers.png"
            alt="Spellbook Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="inline-block rounded-md bg-red-900/50 border border-red-900/50 px-6 py-2 text-xs mb-6 shadow-lg shadow-red-900/20">
              COMMAND GENERATOR
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white uppercase tracking-wider">
              Server Commands
            </h2>
            <p className="text-gray-100 max-w-2xl mx-auto text-lg">
              Generate commands for our V Arena Server
            </p>
          </motion.div>
          <CommandGenerator />
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-20 bg-black relative">
        <div className="container mx-auto px-4 relative">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="inline-block rounded-md bg-red-900/50 border border-red-900/50 px-6 py-2 text-xs mb-6 shadow-lg shadow-red-900/20">
              NEWS & UPDATES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white uppercase tracking-wider">
              Chronicles of V Rising
            </h2>
            <p className="text-gray-100 max-w-2xl mx-auto text-lg">
              Stay informed about the latest updates, events, and community
              highlights
            </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {newsItems.length > 0 ? newsItems.slice(0, 3).map((news, index) => {
              const IconComponent = iconMap[news.iconName] || Terminal; // Default icon if not found
              return (
                <motion.div
                  key={news.id} // Use Notion page ID as key
                  variants={scaleIn}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <Link
                    href={`/news/${news.slug || news.id}`} // Link to dynamic news page
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
                        // Use Notion cover image if available, otherwise fallback to news.png
                        src={news.coverImageUrl || `/news.png`}
                        alt={news.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/news.png') {
                            target.src = '/news.png';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />

                      {/* Category Badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <motion.div
                          className="bg-red-900/80 text-white text-xs px-3 py-1.5 rounded-full font-bold
                                 border border-red-500/50 shadow-lg shadow-red-900/50"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="flex items-center gap-2">
                            {IconComponent && <IconComponent className="w-3 h-3" />}
                            {news.category}
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    <div className="p-6 relative">
                      <div className="text-red-500 text-sm mb-2 font-bold tracking-wider">{new Date(news.date).toLocaleDateString()}</div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-red-400 transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-gray-300">{news.excerpt}</p>

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
              )
            }) : (
              <p className="text-center col-span-full py-10 text-gray-400">
                Loading news... If this message persists, please ensure your Notion integration is correctly configured in <code>.env.local</code>.
              </p>
            )}
          </motion.div>

          {/* View All Button */}
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
                      className="border-2 border-red-900 text-white hover:bg-red-900/20 hover:border-red-500
                         relative overflow-hidden group px-8 shadow-lg shadow-red-900/20 w-full py-8 gap-4"
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
                      <span className="font-semibold">6,200+ Members</span>
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
                {["Discord", "Twitter", "YouTube", "Twitch"].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href={`https://${item.toLowerCase()}.com`}
                      className="hover:text-white transition-colors"
                      target="_blank"
                    >
                      {item}
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
