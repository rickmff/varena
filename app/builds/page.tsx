"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Hammer, Plus, Swords } from 'lucide-react';
import BuilderNavBar from "@/components/BuilderNavBar";
import BuildsList from "@/components/builds/BuildsList";

export default function Builds() {
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

  return (
    <div className="min-h-screen bg-black text-white">
      <BuilderNavBar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
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
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="mb-8">
              <span className="text-red-500 text-sm font-medium tracking-widest uppercase relative inline-block pb-2 font-['Junge'] ">
                BUILD COLLECTION
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white uppercase tracking-wider">
              Your Builds
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Manage your saved builds, create new combinations
            </p>
          </motion.div>
        </div>
      </section>

      {/* Builds Section */}
      <section className="py-20 bg-black relative">
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <BuildsList />
          </motion.div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-12 bg-black border-t border-red-900/30">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center py-3text-white font-medium transition-all duration-200 hover:scale-105"
          >
            ← Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
