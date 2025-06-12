"use client";

import { motion } from "framer-motion";
import { Terminal, Swords, CalendarClock, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import SectionHeader from "./SectionHeader";
import Image from 'next/image';

// Define the props for the FeatureCarousel component
interface Feature {
  icon: string;
  image: string;
  title: string;
  description: string;
}

interface FeatureCarouselProps {
  features: Feature[];
}

// Animation variants (can be moved to a separate file if they grow)
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.4 } },
};

// Create a cache to store preloaded images
const imageCache = new Map();

const FeatureCarousel: React.FC<FeatureCarouselProps> = ({ features }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const bg1Ref = useRef<HTMLDivElement | null>(null);
  const bg2Ref = useRef<HTMLDivElement | null>(null);

  const [isHoveringCard, setIsHoveringCard] = useState(false);
  // currentBgIndex stores the index of the feature image currently visible/active.
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [activeBgLayer, setActiveBgLayer] = useState<
    "bg-image-1" | "bg-image-2"
  >("bg-image-1");
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Memoize the image URLs to prevent unnecessary reloads
  const imageUrls = useMemo(() => {
    return features.map(feature => feature.image);
  }, [features]);

  useEffect(() => {
    // Get DOM elements once after mount
    bg1Ref.current = document.getElementById("bg-image-1") as HTMLDivElement;
    bg2Ref.current = document.getElementById("bg-image-2") as HTMLDivElement;
  }, []);

  // Effect for preloading images and setting initial background state
  useEffect(() => {
    if (
      !features ||
      features.length === 0 ||
      !bg1Ref.current ||
      !bg2Ref.current ||
      imagesLoaded
    )
      return;

    // Check if images are already in cache
    const allImagesInCache = features.every(feature =>
      imageCache.has(feature.image)
    );

    if (allImagesInCache) {
      setImagesLoaded(true);
      const bg1 = bg1Ref.current;
      const bg2 = bg2Ref.current;

      bg1.style.backgroundImage = `url(${features[0].image})`;
      bg1.style.opacity = "1";
      bg2.style.opacity = "0";

      if (features.length > 1) {
        bg2.style.backgroundImage = `url(${features[1].image})`;
      }

      setActiveBgLayer("bg-image-1");
      setCurrentBgIndex(0);
      return;
    }

    // Only preload the first two images initially
    Promise.all(features.slice(0, 2).map(feature => {
      return new Promise((resolve) => {
        if (imageCache.has(feature.image)) {
          resolve(feature.image);
          return;
        }

        const img = new window.Image();
        img.onload = () => {
          imageCache.set(feature.image, true);
          resolve(feature.image);
        };
        img.onerror = () => resolve(null);
        img.src = feature.image;
      });
    })).then(() => {
      if (!bg1Ref.current || !bg2Ref.current) return;

      const bg1 = bg1Ref.current;
      const bg2 = bg2Ref.current;

      bg1.style.backgroundImage = `url(${features[0].image})`;
      bg1.style.opacity = "1";
      bg2.style.opacity = "0";

      if (features.length > 1) {
        bg2.style.backgroundImage = `url(${features[1].image})`;
      }

      setActiveBgLayer("bg-image-1");
      setCurrentBgIndex(0);
      setImagesLoaded(true);
    });
  }, [features, imagesLoaded, imageUrls]);

  // Lazy load remaining images when user starts interacting
  useEffect(() => {
    if (features.length <= 2 || !imagesLoaded) return;

    const lazyLoadImages = () => {
      features.slice(2).forEach((feature) => {
        if (imageCache.has(feature.image)) return;

        const img = new window.Image();
        img.onload = () => {
          imageCache.set(feature.image, true);
        };
        img.src = feature.image;
      });
      window.removeEventListener('mousemove', lazyLoadImages);
    };

    window.addEventListener('mousemove', lazyLoadImages);
    return () => window.removeEventListener('mousemove', lazyLoadImages);
  }, [features, imagesLoaded]);

  // Effect for Intersection Observer and Interval Logic for carousel
  useEffect(() => {
    if (
      !features ||
      features.length <= 1 ||
      !carouselRef.current ||
      !bg1Ref.current ||
      !bg2Ref.current ||
      !imagesLoaded
    ) {
      return; // No carousel for 0 or 1 image, or if refs aren't set
    }

    const bg1 = bg1Ref.current;
    const bg2 = bg2Ref.current;
    let intervalId: NodeJS.Timeout;

    const startCarousel = () => {
      intervalId = setInterval(() => {
        if (!isHoveringCard) {
          const nextImageIndex = (currentBgIndex + 1) % features.length;

          const currentActiveDOMElement =
            activeBgLayer === "bg-image-1" ? bg1 : bg2;
          const currentInactiveDOMElement =
            activeBgLayer === "bg-image-1" ? bg2 : bg1;

          currentInactiveDOMElement.style.backgroundImage = `url(${features[nextImageIndex].image})`;
          currentActiveDOMElement.style.opacity = "0";
          currentInactiveDOMElement.style.opacity = "1";

          setActiveBgLayer(
            activeBgLayer === "bg-image-1" ? "bg-image-2" : "bg-image-1"
          );
          setCurrentBgIndex(nextImageIndex);
        }
      }, 5000);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCarousel();
        } else {
          clearInterval(intervalId);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(carouselRef.current);

    return () => {
      clearInterval(intervalId);
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, [features, isHoveringCard, currentBgIndex, activeBgLayer, carouselRef, imagesLoaded]);

  const handleCardMouseEnter = (featureImage: string) => {
    if (!bg1Ref.current || !bg2Ref.current || features.length === 0) return;
    setIsHoveringCard(true);

    const bg1 = bg1Ref.current;
    const bg2 = bg2Ref.current;

    const currentActiveDOMElement = activeBgLayer === "bg-image-1" ? bg1 : bg2;
    const currentInactiveDOMElement =
      activeBgLayer === "bg-image-1" ? bg2 : bg1;

    currentInactiveDOMElement.style.backgroundImage = `url(${featureImage})`;
    currentActiveDOMElement.style.opacity = "0";
    currentInactiveDOMElement.style.opacity = "1";

    const newActiveLayerId =
      activeBgLayer === "bg-image-1" ? "bg-image-2" : "bg-image-1";
    setActiveBgLayer(newActiveLayerId);

    const hoveredImageIndex = features.findIndex(
      (f) => f.image === featureImage
    );
    if (hoveredImageIndex !== -1) {
      setCurrentBgIndex(hoveredImageIndex);
    }
  };

  const handleCardMouseLeave = () => {
    setIsHoveringCard(false);
  };

  return (
    <section
      id="features"
      className="py-60 bg-black relative"
      ref={carouselRef}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black z-10"></div>

      {/* Background carousel container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          id="bg-image-1"
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out opacity-0"
        ></div>
        <div
          id="bg-image-2"
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out opacity-0"
        ></div>

        {/* Preload all images invisibly to improve cache */}
        <div className="hidden">
          {features.map((feature, index) => (
            <Image
              key={`preload-${index}`}
              src={feature.image}
              alt=""
              width={1}
              height={1}
              priority={index < 2}
              onLoad={() => {
                imageCache.set(feature.image, true);
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <SectionHeader
          title="V Arena Features"
          subtitle="Unleash Your Potential"
          description="Discover the unique features of V Arena"
        />
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-black via-red-950/10 to-black p-6 rounded-lg border border-red-900/30 hover:border-red-500/50 transition-all duration-500 relative overflow-hidden group h-80 backdrop-blur-sm"
              variants={scaleIn}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(139, 0, 0, 0.5)",
                transition: { duration: 0.3 },
              }}
              onMouseEnter={() => handleCardMouseEnter(feature.image)}
              onMouseLeave={handleCardMouseLeave}
            >
              {/* Content Container */}
              <div className="h-full flex flex-col items-center justify-center text-center relative z-10">
                {/* Icon and Title Container - Remove whileHover animation */}
                <div className="flex flex-col items-center transition-all duration-500 ease-in-out group-hover:opacity-0 group-hover:-translate-y-4">
                  <motion.div
                    className="mb-6 relative"
                    animate={{
                      y: [0, 5, 0],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      y: {
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                      },
                      opacity: {
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                      },
                    }}
                  >
                    <div className="w-20 h-20 mx-auto mb-4 relative">
                      {feature.icon === "command" && (
                        <Terminal className="w-full h-full text-red-600" />
                      )}
                      {feature.icon === "crossed-swords" && (
                        <Swords className="w-full h-full text-red-600" />
                      )}
                      {feature.icon === "calendar-clock" && (
                        <CalendarClock className="w-full h-full text-red-600" />
                      )}
                      {feature.icon === "moderation" && (
                        <ShieldCheck className="w-full h-full text-red-600" />
                      )}
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2 tracking-wider text-gray-100">
                    {feature.title.toUpperCase()}
                  </h3>
                </div>

                {/* Description - Remove whileHover animation */}
                <div className="w-full h-full absolute inset-0 flex items-center justify-center text-center px-6 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                  <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300"></div>
                  <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300"></div>
                  <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300"></div>
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300"></div>
                  <div className="relative">
                    <motion.div
                      className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-1 h-6 opacity-0 group-hover:opacity-80 transition-all duration-300 origin-bottom"
                      style={{ scaleY: 0 }}
                    />
                    <p className="text-gray-200 font-medium leading-relaxed text-lg text-shadow-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black z-10"></div>
    </section>
  );
};

export default FeatureCarousel;
