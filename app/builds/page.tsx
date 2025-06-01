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
            <div className="inline-block rounded-md bg-red-900/50 border border-red-900/50 px-6 py-2 text-xs mb-6 shadow-lg shadow-red-900/20">
              BUILD COLLECTION
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white uppercase tracking-wider">
              ⚔️ Your Builds
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Manage your saved builds, create new combinations
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="flex justify-center gap-4 mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Link
                href="/builds/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-900/50 border border-red-900/50 text-white font-medium rounded-lg hover:bg-red-900/70 hover:border-red-500 transition-all duration-200 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                Create New Build
              </Link>
            </motion.div>
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
            className="inline-flex items-center px-6 py-3 bg-red-900/50 border border-red-900/50 text-white font-medium rounded-lg hover:bg-red-900/70 hover:border-red-500 transition-all duration-200"
          >
            ← Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
