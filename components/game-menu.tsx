"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { menuItems } from "@/components/NavBar"

interface GameMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function GameMenu({ isOpen, onClose }: GameMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-black border-l-2 border-purple-900/30 z-50
                     shadow-[-10px_0_30px_-15px_rgba(139,0,0,0.3)]"
          >
            <div className="relative h-full p-6 flex flex-col">
              {/* Close Button */}
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6" />
              </motion.button>

              {/* Menu Items */}
              <nav className="mt-16 flex flex-col gap-2">
                {menuItems.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="group block"
                    >
                      <motion.div
                        className="p-4 bg-purple-950/20 rounded-lg border border-purple-900/30
                                 hover:border-purple-500/50 hover:bg-purple-900/20 transition-colors relative overflow-hidden"
                        whileHover={{ x: 10 }}
                      >
                        {/* Hover Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent
                                    opacity-0 group-hover:opacity-100 transition-opacity" />

                        <span className="relative z-10 text-lg font-bold tracking-wider
                                     text-gray-300 group-hover:text-white transition-colors">
                          {item.name}
                        </span>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom Section */}
              <div className="mt-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-4 relative overflow-hidden group border-2 border-purple-900
                             bg-gradient-to-r from-purple-950/50 to-black hover:from-purple-900 hover:to-purple-950"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 font-bold tracking-wider">JOIN DISCORD</span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
