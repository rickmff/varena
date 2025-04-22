"use client"

import { motion } from "framer-motion"
import { Heart, Droplet } from "lucide-react"

interface ResourceBarProps {
  type: "health" | "blood"
  value: number
  max: number
}

export default function ResourceBar({ type, value, max }: ResourceBarProps) {
  const getColor = () => {
    if (type === "health") {
      return {
        bg: "bg-black/80",
        fill: "bg-white/80",
        icon: <Heart className="h-5 w-5 text-white" />,
      }
    } else {
      return {
        bg: "bg-black/80",
        fill: "bg-white/80",
        icon: <Droplet className="h-5 w-5 text-white" />,
      }
    }
  }

  const { bg, fill, icon } = getColor()

  return (
    <div className="flex items-center gap-3">
      <div className="p-1.5 rounded-full bg-black/90">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-32 ${bg} rounded-full overflow-hidden relative`}>
            <motion.div
              className={`absolute top-0 left-0 h-full ${fill}`}
              initial={{ width: 0 }}
              animate={{ width: `${value / max * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="text-sm text-white font-medium">
            {value}/{max}
          </div>
        </div>
        <div className="text-xs text-gray-400">123.123.1234.1234</div>
      </div>
    </div>
  )
}
