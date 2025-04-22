"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ServerStatusProps {
  currentPlayers?: number
  maxPlayers?: number
  ipAddress: string
  countryCode?: string
}

export default function ServerStatus({
  currentPlayers = 30,
  maxPlayers = 60,
  ipAddress = "123.123.1234.1234",
  countryCode = "US"
}: ServerStatusProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(ipAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-end gap-3 backdrop-blur-sm px-3 py-2 rounded-lg text-xs">
      <div className="flex items-center gap-2 bg-red-950/20 rounded-lg p-2">
        <div className="text-white/90">
          {currentPlayers} / {maxPlayers}
        </div>
        <div className="relative h-5 w-5 rounded-full overflow-hidden">
          <Image
            src={`https://flagcdn.com/${countryCode.toLowerCase()}.svg`}
            alt={`${countryCode} flag`}
            fill
            className="object-cover"
          />
        </div>

      </div>

      <div className="flex items-center gap-2">
        <span className="text-white/90">{ipAddress}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-white/10"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4 text-white/70" />
          <span className="sr-only">Copy IP address</span>
        </Button>
      </div>
    </div>
  )
}