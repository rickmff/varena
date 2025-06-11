// Custom animation variants for premade builds
"use client";

import "@/components/vbuilds/styles.css";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

type Build = {
  name: string;
  code: string;
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

const slideInFromLeft = {
  hidden: { opacity: 0, x: -400, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom ease with deceleration
    },
  },
};

const slideInFromRight = {
  hidden: { opacity: 0, x: 400, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom ease with deceleration
    },
  },
};

const slideInFromLeftDelayed = {
  hidden: { opacity: 0, x: -500, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      delay: 0.2, // Edge delay for closing in effect
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const slideInFromRightDelayed = {
  hidden: { opacity: 0, x: 500, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      delay: 0.2, // Edge delay for closing in effect
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const premadeBuildsContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0, // No stagger, let individual animations handle timing
    },
  },
};

// Function to get the appropriate animation variant for each premade build
const getPremadeBuildVariant = (index: number) => {
  switch (index) {
    case 0:
      return slideInFromLeftDelayed; // CASTER - leftmost edge, delayed
    case 1:
      return slideInFromLeft; // ASSASSIN - from left
    case 2:
      return slideInFromRight; // BRAWLER - from right
    case 3:
      return slideInFromRightDelayed; // HYBRID - rightmost edge, delayed
    default:
      return scaleIn;
  }
};

const premadeBuilds = [
  {
    name: "CASTER",
    background: "/images/templates/caster.png",
    code: "722222222bcg9af3456g2456413656o6479n218700000000000000000000000000000033333961",
    baseBorder: "border-purple-500/30",
    hoverBorder: "hover:border-purple-500",
    hoverGlow: "from-purple-900/20",
  },
  {
    name: "ASSASSIN",
    background: "/images/templates/assassin.png",
    code: "622222222bcn8721367j1245523642d03824083200000000000000000000000000000014444751",
    baseBorder: "border-orange-500/30",
    hoverBorder: "hover:border-orange-500",
    hoverGlow: "from-orange-900/20",
  },
  {
    name: "BRAWLER",
    background: "/images/templates/brawler.png",
    code: "822222222bc1k42136734563223565103E8n218700000000000000000000000000000052222751",
    baseBorder: "border-red-500/30",
    hoverBorder: "hover:border-red-500",
    hoverGlow: "from-red-900/20",
  },
  {
    name: "SUPPORT",
    background: "/images/templates/support.png",
    code: "222222222bcaoif3462l3452412461c07B9b0B7900000000000000000000000000000041111643",
    baseBorder: "border-green-500/30",
    hoverBorder: "hover:border-green-500",
    hoverGlow: "from-green-900/20",
  },
];

export const StarterBuilds = () => {
  return (
    <motion.div
      className="mb-12"
      variants={premadeBuildsContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-red-400 to-red-600 rounded-full" />
        <h3 className="text-xl font-bold text-grey-100 tracking-wide">
          STARTER TEMPLATES
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-grey-600 to-transparent" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {premadeBuilds.map((build, index) => (
          <motion.div
            key={build.name}
            variants={getPremadeBuildVariant(index)}
            className="relative group cursor-pointer"
          >
            <Link
              href={`/builds/create?build=${encodeURIComponent(build.code)}`}
            >
              <div
                className={`relative aspect-video rounded-lg overflow-hidden border-2 ${build.baseBorder} ${build.hoverBorder} transition-all duration-300`}
              >
                {/* Background Image */}
                <Image
                  src={build.background}
                  alt={build.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

                {/* Text overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm md:text-base lg:text-lg font-junge tracking-widest drop-shadow-lg">
                    {build.name}
                  </span>
                </div>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${build.hoverGlow} to-transparent`}
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
