"use client";

import { motion } from "framer-motion";
import { Terminal, Swords, CalendarClock, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image"; // Assuming you might want to use Next/Image for optimization later

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

const FeatureCarousel: React.FC<FeatureCarouselProps> = ({ features }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const bg1Ref = useRef<HTMLDivElement | null>(null);
  const bg2Ref = useRef<HTMLDivElement | null>(null);

  const [isHoveringCard, setIsHoveringCard] = useState(false);
  // currentBgIndex stores the index of the feature image currently visible/active.
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [activeBgLayer, setActiveBgLayer] = useState<'bg-image-1' | 'bg-image-2'>('bg-image-1');

  useEffect(() => {
    // Get DOM elements once after mount
    bg1Ref.current = document.getElementById('bg-image-1') as HTMLDivElement;
    bg2Ref.current = document.getElementById('bg-image-2') as HTMLDivElement;
  }, []);

  // Effect for preloading images and setting initial background state
  useEffect(() => {
    if (!features || features.length === 0 || !bg1Ref.current || !bg2Ref.current) return;

    // Preload all images
    features.forEach(feature => {
      const img = new (globalThis.Image)();
      img.src = feature.image;
    });

    const bg1 = bg1Ref.current;
    const bg2 = bg2Ref.current;

    bg1.style.backgroundImage = `url(${features[0].image})`;
    bg1.style.opacity = '1';
    bg2.style.opacity = '0';

    if (features.length > 1) {
      bg2.style.backgroundImage = `url(${features[1].image})`;
    } else {
      // If only one image, ensure bg2 is cleared or has same image and stays hidden
      bg2.style.backgroundImage = `url(${features[0].image})`;
    }

    setActiveBgLayer('bg-image-1');
    setCurrentBgIndex(0); // features[0] is now active

  }, [features]); // Rerun only if features array changes

  // Effect for Intersection Observer and Interval Logic for carousel
  useEffect(() => {
    if (!features || features.length <= 1 || !carouselRef.current || !bg1Ref.current || !bg2Ref.current) {
      return; // No carousel for 0 or 1 image, or if refs aren't set
    }

    const bg1 = bg1Ref.current;
    const bg2 = bg2Ref.current;
    let intervalId: NodeJS.Timeout;

    const startCarousel = () => {
      intervalId = setInterval(() => {
        if (!isHoveringCard) {
          const nextImageIndex = (currentBgIndex + 1) % features.length;

          const currentActiveDOMElement = activeBgLayer === 'bg-image-1' ? bg1 : bg2;
          const currentInactiveDOMElement = activeBgLayer === 'bg-image-1' ? bg2 : bg1;

          currentInactiveDOMElement.style.backgroundImage = `url(${features[nextImageIndex].image})`;
          currentActiveDOMElement.style.opacity = '0';
          currentInactiveDOMElement.style.opacity = '1';

          setActiveBgLayer(activeBgLayer === 'bg-image-1' ? 'bg-image-2' : 'bg-image-1');
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
  }, [features, isHoveringCard, currentBgIndex, activeBgLayer, carouselRef]);

  const handleCardMouseEnter = (featureImage: string) => {
    if (!bg1Ref.current || !bg2Ref.current || features.length === 0) return;
    setIsHoveringCard(true);

    const bg1 = bg1Ref.current;
    const bg2 = bg2Ref.current;

    const currentActiveDOMElement = activeBgLayer === 'bg-image-1' ? bg1 : bg2;
    const currentInactiveDOMElement = activeBgLayer === 'bg-image-1' ? bg2 : bg1;

    currentInactiveDOMElement.style.backgroundImage = `url(${featureImage})`;
    currentActiveDOMElement.style.opacity = '0';
    currentInactiveDOMElement.style.opacity = '1';

    const newActiveLayerId = activeBgLayer === 'bg-image-1' ? 'bg-image-2' : 'bg-image-1';
    setActiveBgLayer(newActiveLayerId);

    const hoveredImageIndex = features.findIndex(f => f.image === featureImage);
    if (hoveredImageIndex !== -1) {
      setCurrentBgIndex(hoveredImageIndex);
    }
  };

  const handleCardMouseLeave = () => {
    setIsHoveringCard(false);
  };

  return (
    <section id="features" className="py-60 bg-black relative" ref={carouselRef}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black z-10"></div>

      {/* Background carousel container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div id="bg-image-1" className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out opacity-0"></div>
        <div id="bg-image-2" className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out opacity-0"></div>
      </div>

      <div className="container mx-auto px-4 relative z-50">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="inline-block rounded-md bg-red-900/50 border border-red-900/50 px-6 py-2 text-xs mb-6 shadow-lg shadow-red-900/20">
            V ARENA FEATURES
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">UNLEASH YOUR POTENTIAL</h2>
          <p className="text-gray-100 max-w-2xl mx-auto">
            Discover the unique features of V Arena that enhance your gaming experience.
          </p>
        </motion.div>
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
                transition: { duration: 0.3 }
              }}
              onMouseEnter={() => handleCardMouseEnter(feature.image)}
              onMouseLeave={handleCardMouseLeave}
            >
              {/* Content Container */}
              <div className="h-full flex flex-col items-center justify-center text-center relative z-10">
                {/* Icon and Title Container */}
                <motion.div
                  className="flex flex-col items-center transition-all duration-500 ease-in-out"
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{
                    opacity: 0,
                    y: -20,
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.div
                    className="mb-6 relative"
                    animate={{
                      y: [0, 5, 0],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                      y: { duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
                      opacity: { duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }
                    }}
                  >
                    <div className="w-20 h-20 mx-auto mb-4 relative group-hover:opacity-0 transition-opacity duration-500">
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
                  <h3 className="text-xl font-bold mb-2 tracking-wider text-red-100 group-hover:opacity-0 transition-opacity duration-500">
                    {feature.title.toUpperCase()}
                  </h3>
                </motion.div>

                {/* Description */}
                <motion.div
                  className="w-full h-full absolute inset-0 flex items-center justify-center text-center px-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{
                    opacity: 1,
                    scale: 1,
                    transition: { duration: 0.4, delay: 0.1 }
                  }}
                >
                  <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300"></div>
                  <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300"></div>
                  <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300"></div>
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300"></div>
                  <div className="relative">
                    <motion.div
                      className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-1 h-6 opacity-0 group-hover:opacity-80"
                      initial={{ scaleY: 0 }}
                      whileHover={{
                        scaleY: 1,
                        transition: { duration: 0.4, delay: 0.3 }
                      }}
                    />
                    <p className="text-gray-200 font-medium leading-relaxed text-lg text-shadow-lg">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
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