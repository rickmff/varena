import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/better-auth/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sword, BookOpen, BarChart2, Shield, Mail, Calendar, Settings } from "lucide-react";
import Link from "next/link";
import LogoutButton from "./logout-button";
import ChangePassword from "./change-password";
import InlineNameEditor from "./inline-name-editor";
import SendPasswordResetButton from "./send-password-reset-button";
import prisma from "@/lib/prisma";
import NavBar from "@/components/NavBar";
import DataExportButton from "@/components/gdpr/DataExportButton";
import DeleteAccountButton from "@/components/gdpr/DeleteAccountButton";
import SteamLink from "./steam-link";
import PrivacyToggle from "./privacy-toggle";
import { Suspense } from "react";

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = session.user;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: {
      id: true,
      createdAt: true,
      steamId: true,
      profilePublic: true,
      badge: {
        select: {
          badgeType: true,
          description: true,
        },
      },
    },
  });

  const getUserInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }
    if (email) return email[0].toUpperCase();
    return "U";
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <NavBar />

      {/* Hero Banner */}
      <div className="relative h-52 md:h-64 overflow-hidden mt-0">
        {/* Dark atmospheric background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0820] via-[#0a0a1a] to-[#050510]" />
        {/* Blood moon accent */}
        <div className="absolute top-[-60px] right-[10%] w-72 h-72 rounded-full bg-[#8B0000]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080808] to-transparent" />
        {/* Decorative lines */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 40px,
              rgba(139,0,0,0.15) 40px,
              rgba(139,0,0,0.15) 41px
            )`
          }}
        />
        {/* Corner ornament */}
        <div className="absolute top-4 left-4 flex items-center gap-2 opacity-30">
          <Shield className="h-4 w-4 text-[#8B0000]" />
          <span className="text-xs tracking-[0.3em] uppercase text-gray-500">Player Profile</span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-8xl">
        {/* Avatar + Name header — overlaps banner */}
        <div className="relative -mt-16 md:-mt-20 mb-8 flex flex-col md:flex-row items-start md:items-end gap-5">
          {/* Avatar with glow ring */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-[#8B0000]/40 blur-md scale-110" />
            <div className="relative rounded-full p-[3px] bg-gradient-to-br from-[#8B0000] via-[#3d0000] to-[#8B0000]">
              <Avatar className="h-28 w-28 md:h-32 md:w-32 rounded-full border-2 border-[#080808]">
                <AvatarImage src={user.image || undefined} alt={user.name || user.email || "User"} />
                <AvatarFallback className="bg-[#0f0614] text-white text-3xl font-bold rounded-full">
                  {getUserInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-green-500 border-2 border-[#080808]" />
          </div>

          <div className="flex-1 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <InlineNameEditor
                currentName={user.name}
                badge={dbUser?.badge || null}
              />
            </div>
            <p className="text-gray-500 text-sm">{user.email}</p>
            {dbUser?.createdAt && (
              <p className="text-gray-600 text-xs mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Member since {formatDate(dbUser.createdAt)}
              </p>
            )}
          </div>

          {/* Quick sign out top right */}
          <div className="shrink-0 pb-2">
            <LogoutButton />
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-20">

          {/* Left column — navigation links */}
          <div className="md:col-span-1 space-y-2">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gray-600 mb-3 px-1">Navigate</p>

            <Link
              href="/builds"
              className="group flex items-center gap-3 px-4 py-3 rounded-sm bg-white/[0.03] hover:bg-[#8B0000]/20 border border-white/5 hover:border-[#8B0000]/40 transition-all"
            >
              <Sword className="h-4 w-4 text-[#8B0000] shrink-0" />
              <div>
                <p className="text-sm font-medium text-white/90 group-hover:text-white">My Builds</p>
                <p className="text-xs text-gray-600">View your saved builds</p>
              </div>
            </Link>

            <Link
              href="/builds/create"
              className="group flex items-center gap-3 px-4 py-3 rounded-sm bg-white/[0.03] hover:bg-[#8B0000]/20 border border-white/5 hover:border-[#8B0000]/40 transition-all"
            >
              <Shield className="h-4 w-4 text-[#8B0000] shrink-0" />
              <div>
                <p className="text-sm font-medium text-white/90 group-hover:text-white">Create Build</p>
                <p className="text-xs text-gray-600">Share a new build</p>
              </div>
            </Link>

            <Link
              href="/spells/tier-list"
              className="group flex items-center gap-3 px-4 py-3 rounded-sm bg-white/[0.03] hover:bg-[#8B0000]/20 border border-white/5 hover:border-[#8B0000]/40 transition-all"
            >
              <BookOpen className="h-4 w-4 text-[#8B0000] shrink-0" />
              <div>
                <p className="text-sm font-medium text-white/90 group-hover:text-white">Spell Tier List</p>
                <p className="text-xs text-gray-600">Rate and rank spells</p>
              </div>
            </Link>

            <Link
              href="/leaderboard"
              className="group flex items-center gap-3 px-4 py-3 rounded-sm bg-white/[0.03] hover:bg-[#8B0000]/20 border border-white/5 hover:border-[#8B0000]/40 transition-all"
            >
              <BarChart2 className="h-4 w-4 text-[#8B0000] shrink-0" />
              <div>
                <p className="text-sm font-medium text-white/90 group-hover:text-white">Leaderboard</p>
                <p className="text-xs text-gray-600">Top players</p>
              </div>
            </Link>

            {/* Steam + Privacy */}
            <div className="pt-4">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-600 mb-3 px-1">Connections</p>
              <div className="space-y-2">
                <div className="px-4 py-3 rounded-sm bg-white/[0.03] border border-white/5">
                  <Suspense fallback={null}>
                    <SteamLink steamId={dbUser?.steamId ?? null} />
                  </Suspense>
                </div>
                {dbUser?.steamId && (
                  <Link
                    href={`/players/${dbUser.steamId}`}
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-sm bg-white/[0.03] hover:bg-[#8B0000]/20 border border-white/5 hover:border-[#8B0000]/40 transition-all text-sm text-gray-500 hover:text-white"
                  >
                    <BarChart2 className="h-3.5 w-3.5 text-[#8B0000]" />
                    View my public profile
                  </Link>
                )}
                <PrivacyToggle initialPublic={dbUser?.profilePublic ?? true} />
              </div>
            </div>
          </div>

          {/* Right column — account settings */}
          <div className="md:col-span-2 space-y-4">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gray-600 mb-3 px-1">Account Settings</p>

            {/* Account info panel */}
            <div className="rounded-sm bg-white/[0.03] border border-white/5 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <Settings className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs tracking-wider uppercase text-gray-500 font-medium">Identity</span>
              </div>
              <div className="px-4 py-4">
                <p className="text-[11px] text-gray-600 uppercase tracking-wider mb-1">Email</p>
                <p className="text-white/80 text-sm flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gray-600" />
                  {user.email}
                </p>
              </div>
            </div>

            {/* Password */}
            <div className="rounded-sm bg-white/[0.03] border border-white/5 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs tracking-wider uppercase text-gray-500 font-medium">Security</span>
              </div>
              <div className="px-4 py-4 space-y-3">
                <SendPasswordResetButton email={user.email || ""} />
                <ChangePassword />
              </div>
            </div>

            {/* GDPR */}
            <div className="rounded-sm bg-white/[0.03] border border-white/5 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <span className="text-xs tracking-wider uppercase text-gray-500 font-medium">Data & Privacy</span>
              </div>
              <div className="px-4 py-4 space-y-3">
                <DataExportButton />
                <DeleteAccountButton userEmail={user.email || ""} />
                <p className="text-xs text-gray-600 mt-2">
                  Learn more in our{" "}
                  <Link href="/privacy-policy" className="text-[#8B0000] hover:text-red-400 underline underline-offset-2">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
