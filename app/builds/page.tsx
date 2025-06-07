import React from "react";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import BuildsList from "@/components/builds/BuildsList";
import SectionHeader from "@/app/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "V Arena - Builds",
};

export default function Builds() {
  return (
    <div
      className="min-h-screen bg-black text-white overflow-auto"
      id="builder-page"
    >
      <NavBar />

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
          <SectionHeader
            title="Build Collection"
            subtitle="⚔️ Your Builds"
            // description="Manage your saved builds, create new combinations"
          />
        </div>
      </section>

      {/* Builds Section */}
      <section className="bg-black relative h-full min-h-0">
        <div className="container px-4 absolute z-10 left-1/2 transform -translate-x-1/2 -top-32">
          <BuildsList />
        </div>
      </section>
      <section className="py-40 bg-black"></section>
    </div>
  );
}
