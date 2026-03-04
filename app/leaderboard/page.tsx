"use client";

import Image from "next/image";
import NavBar from "@/components/NavBar";
import SectionHeader from "@/app/components/ui/SectionHeader";
import Leaderboard from "@/components/leaderboard/Leaderboard";

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-auto" id="builder-page">
      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="/hero-bg.webp"
            alt="V Rising Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <SectionHeader
            title="Leaderboard"
            subtitle="V Arena Rankeds"
          />
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="bg-black relative -mt-20 pb-20">
        <div className="container mx-auto px-4 relative z-10">
          <Leaderboard />
        </div>
      </section>
    </div>
  );
}
