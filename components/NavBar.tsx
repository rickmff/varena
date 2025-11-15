"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import GameMenu from "./game-menu";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/better-auth/client";
import { LogIn, User, LogOut, Hammer, Shield } from "lucide-react";
import { toast } from "sonner";

export const menuItems = [
  { name: "HOME", href: "/" },
  { name: "FEATURES", href: "/#features" },
  { name: "BUILDS", href: "/builds" },
  { name: "COMMANDS", href: "/commands" },
  { name: "NEWS", href: "/news" },
];

export const DiscordButton = ({
  size = "sm",
  className,
}: {
  size?: ButtonProps["size"];
  className?: string;
}) => (
  <motion.div
    animate={{
      scale: [1, 1.08, 1],
    }}
    transition={{
      duration: 1.0,
      repeat: Infinity,
      repeatDelay: 2.5,
      ease: [0.68, -0.55, 0.265, 1.55], // Bounce easing
    }}
  >
    <Button
      variant="outline"
      size={size}
      className={`hidden md:flex text-xs font-bold text-white bg-[#0f0a47] hover:bg-[#4752C4] border-[#5865F2] hover:border-[#4752C4] transition-all duration-300 relative overflow-hidden ${className || ""
        }`}
    >
      <div className="flex items-center justify-center gap-2 relative z-10">
        <Link
          href="https://discord.gg/varena"
          target="_blank"
          className="flex items-center justify-center gap-2"
        >
          <Image
            src="/discord.svg"
            alt="Discord Logo"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          <span className="pt-0">JOIN US</span>
        </Link>
      </div>

      {/* Diagonal flash effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ x: "100%" }}
        animate={{ x: "-100%" }}
        transition={{
          duration: 0.4,
          repeat: Infinity,
          repeatDelay: 2.5,
          ease: [0.76, 0, 0.24, 1],
        }}
      >
        <div className="absolute inset-0 w-8 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent transform rotate-45 translate-x-4 -translate-y-2" />
      </motion.div>

      {/* Second diagonal flash following behind */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ x: "100%" }}
        animate={{ x: "-100%" }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatDelay: 2.2,
          ease: [0.87, 0, 0.13, 1],
          delay: 0.2,
        }}
      >
        <div className="absolute inset-0 w-6 h-full bg-gradient-to-r from-transparent via-blue-200/15 to-transparent transform rotate-45 translate-x-2 -translate-y-1" />
      </motion.div>
    </Button>
  </motion.div>
);

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();
  const { isAuthenticated, isLoading, user, refetch, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully!");
      refetch(); // Update session state
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error signing out");
    }
  };

  const getUserInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  useEffect(() => {
    let scrollContainer;

    scrollContainer = document.getElementById("builder-page");

    if (!scrollContainer) {
      scrollContainer = window; // Fallback to documentElement if not found
    }

    const handleScroll = () => {
      if (scrollContainer !== window) {
        // HTMLElement has scrollTop property
        setScrollY((scrollContainer as HTMLElement).scrollTop);
      } else {
        setScrollY(window.scrollY);
      }
    };

    // Add the event listener to the scrolling container
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial position
    }

    // Clean up
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <>
      <GameMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <header className="fixed top-0 left-0 right-0 z-50">
        <motion.div
          className="container mx-auto px-4 py-4 flex items-center justify-between"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={false}
            animate={{
              backgroundColor:
                scrollY > 50 ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0)",
              backdropFilter: scrollY > 50 ? "blur(12px)" : "blur(0px)",
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              mass: 1,
              duration: 0.5,
            }}
            className="absolute inset-0"
          />

          <Link href="/" className="flex items-center gap-2 z-50">
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Image
                src="/logo.svg"
                alt="V Rising Logo"
                width={40}
                height={40}
                className="h-14 w-14"
              />
            </motion.div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 relative z-50 ml-14">
            {menuItems.map(
              (item: { name: string; href: string }, i: number) => (
                <motion.div
                  key={item.name}
                  whileHover={{ y: -2, color: "#ffffff" }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 10,
                    delay: i * 0.1,
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.div
                    animate={{
                      color: scrollY > 50 ? "rgb(209 213 219)" : "#ffffff",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                    }}
                  >
                    <Link
                      href={item.href}
                      className="text-sm hover:text-white transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                </motion.div>
              )
            )}
          </nav>
          <div className="flex items-center gap-3 relative z-50">
            {isLoading ? (
              <Skeleton className="h-10 w-10 rounded-full hidden md:block" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden md:flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:ring-offset-2 focus:ring-offset-black"
                  >
                    <Avatar className="h-10 w-10 border-2 border-[#5865F2]/50 hover:border-[#4752C4] transition-colors">
                      <AvatarImage src={user.image || undefined} alt={user.name || user.email || "User"} />
                      <AvatarFallback className="bg-[#0f0a47] text-white font-semibold">
                        {getUserInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black border-[#5865F2]/30">
                  <DropdownMenuLabel className="text-white">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name || "User"}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#5865F2]/30" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer text-white hover:bg-[#0f0a47]">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/builds" className="cursor-pointer text-white hover:bg-[#0f0a47]">
                      <Hammer className="mr-2 h-4 w-4" />
                      <span>My Builds</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-[#5865F2]/30" />
                      <DropdownMenuItem asChild>
                        <Link href="/capibara" className="cursor-pointer text-yellow-400 hover:bg-yellow-950/20">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-[#5865F2]/30" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-400 hover:bg-red-950/20 hover:text-red-300"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  asChild
                  variant="outline"
                  className="hidden md:flex text-xs font-bold text-white bg-[#0f0a47] hover:bg-[#4752C4] border-[#5865F2] hover:border-[#4752C4] transition-all duration-300"
                >
                  <Link href="/auth/signin" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                </Button>
              </motion.div>
            )}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                initial={{
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  backgroundColor: "rgba(127, 29, 29, 0)",
                }}
                animate={{
                  borderColor:
                    scrollY > 50 ? "rgb(127 29 29)" : "rgba(255, 255, 255, 0.3)",
                  backgroundColor:
                    scrollY > 50 ? "rgba(127, 29, 29, 0.1)" : "rgba(127, 29, 29, 0)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                }}
              >
                <DiscordButton />
              </motion.div>
            </motion.div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white z-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="sr-only">Open menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </motion.div>
      </header>
    </>
  );
}
