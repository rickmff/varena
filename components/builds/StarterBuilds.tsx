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
    background: "/images/templates/caster.webp",
    code: "722222222bcg9af3456g2456413656o6479n218700000000000000000000000000000033333961",
    baseBorder: "border-purple-500/30",
    hoverBorder: "hover:border-purple-500",
    hoverGlow: "from-purple-900/20",
  },
  {
    name: "ASSASSIN",
    background: "/images/templates/assassin.webp",
    code: "622222222bcn8721367j1245523642d03824083200000000000000000000000000000014444751",
    baseBorder: "border-orange-500/30",
    hoverBorder: "hover:border-orange-500",
    hoverGlow: "from-orange-900/20",
  },
  {
    name: "BRAWLER",
    background: "/images/templates/brawler.webp",
    code: "822222222bc1k42136734563223565103E8n218700000000000000000000000000000052222751",
    baseBorder: "border-red-500/30",
    hoverBorder: "hover:border-red-500",
    hoverGlow: "from-red-900/20",
  },
  {
    name: "SUPPORT",
    background: "/images/templates/support.webp",
    code: "222222222bcaoif3462l3452412461c07B9b0B7900000000000000000000000000000041111643",
    baseBorder: "border-green-500/30",
    hoverBorder: "hover:border-green-500",
    hoverGlow: "from-green-900/20",
  },
];
