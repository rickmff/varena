"use client";
import React, { useState } from "react";
import CommandGenerator from "@/components/command-generator";
import NavBar from "@/components/NavBar";
import SectionHeader from "../components/ui/SectionHeader";

export default function CommandsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <SectionHeader
            title="Command Generator"
            subtitle="Server Commands"
            description="Generate commands for V Arena"
          />
          <CommandGenerator />
        </div>
      </section>
    </div>
  );
}
