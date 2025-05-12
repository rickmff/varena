"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import GameMenu from './game-menu'

export const menuItems = [
  { name: "FEATURES", href: "#features" },
  { name: "NEWS", href: "#news" },
  { name: "LEADERBOARD", href: "#leaderboard" },
  { name: "GUIDES", href: "#guides" },
  { name: "COMMANDS", href: "#commands" },
]

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
              backgroundColor: scrollY > 50 ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0)",
              backdropFilter: scrollY > 50 ? "blur(12px)" : "blur(0px)",
              borderBottom: scrollY > 50 ? "1px solid rgba(139, 0, 0, 0.3)" : "1px solid rgba(139, 0, 0, 0.0)",
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              mass: 1,
              duration: 0.5
            }}
            className="absolute inset-0"
          />

          <Link href="/" className="flex items-center gap-2 z-50">
            <motion.div whileHover={{ rotate: 10 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Image
                src="/logo.svg"
                alt="V Rising Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
            </motion.div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 relative z-50">
            {menuItems.map((item: { name: string; href: string }, i: number) => (
              <motion.div
                key={item.name}
                whileHover={{ y: -2, color: "#ffffff" }}
                transition={{ type: "spring", stiffness: 400, damping: 10, delay: i * 0.1 }}
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
                    href={`#${item.href}`}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </nav>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-50"
          >
            <motion.div
              animate={{
                borderColor: scrollY > 50 ? "rgb(127 29 29)" : "rgba(255, 255, 255, 0.3)",
                backgroundColor: scrollY > 50 ? "rgba(127, 29, 29, 0.1)" : "transparent",
              }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
              }}
            >
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex text-xs font-bold text-white hover:bg-red-950/50 transition-all duration-300"
              >
                <Link href="https://discord.gg/varena" target="_blank" className="flex items-center justify-center gap-4">
                  <Image
                    src="/discord.svg"
                    alt="Discord Logo"
                    width={20}
                    height={20}
                    className="h-5 w-5 mr-2"
                  />
                  JOIN US
                </Link>
              </Button>
            </motion.div>
          </motion.div>
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
  )
}



