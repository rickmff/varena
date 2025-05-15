"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { bloodData } from "@/data/blood"
import Image from "next/image"
import { Check, PlusCircle } from "lucide-react"

type BloodKey = keyof typeof bloodData;

export default function BloodTab() {
  const [primaryBlood, setPrimaryBlood] = useState<BloodKey | ''>('')
  const [secondaryBlood, setSecondaryBlood] = useState<BloodKey | ''>('')
  const [selectedPerk, setSelectedPerk] = useState<number | null>(null)
  const [isPrimaryOpen, setIsPrimaryOpen] = useState(false)
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(false)

  const copyCommand = async () => {
    try {
      const command = `.bp ${primaryBlood} ${secondaryBlood} ${selectedPerk}`
      await navigator.clipboard.writeText(command.toLowerCase())
      toast.success('Command copied to clipboard!', {
        duration: 2000,
        position: 'top-center'
      })
    } catch (error) {
      toast.error('Failed to copy command')
    }
  }

  const canCopyCommand = primaryBlood && secondaryBlood && selectedPerk !== null

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Blood Selection */}
        <div className="relative">
          <button
            onClick={() => setIsPrimaryOpen(!isPrimaryOpen)}
            className={`w-full bg-black/50 border border-red-900/30 rounded-md px-5 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all flex items-center justify-between ${primaryBlood === '' ? 'py-6' : 'py-4'}`}
          >
            {primaryBlood ? (
              <div className="flex items-center gap-2">
                <Image
                  src={`/images/vbuilds/blood/${primaryBlood.toLowerCase()}-blood.jpg`}
                  alt={primaryBlood}
                  className="w-10 h-10 object-cover rounded"
                  width={40}
                  height={40}
                  onError={(e) => {
                    e.currentTarget.src = "/images/vbuilds/blood/brute-blood.jpg"
                  }}
                />
                <span>{primaryBlood}</span>
              </div>
            ) : (
              <span>Select Primary Blood</span>
            )}
            <svg
              className={`w-4 h-4 transition-transform ${isPrimaryOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isPrimaryOpen && (
            <div className="absolute z-10 w-full mt-1 bg-black/90 border border-red-900/30 rounded-md shadow-lg max-h-96 overflow-y-auto">
              {Object.keys(bloodData).map((blood) => (
                <button
                  key={blood}
                  onClick={() => {
                    setPrimaryBlood(blood as BloodKey)
                    setIsPrimaryOpen(false)
                    setSecondaryBlood('')
                    setSelectedPerk(null)
                  }}
                  className="w-full px-5 py-4 text-left text-white hover:bg-red-900/50 flex items-center gap-2"
                >
                  <Image
                    src={`/images/vbuilds/blood/${blood.toLowerCase()}-blood.jpg`}
                    alt={blood}
                    className="w-10 h-10 object-cover rounded"
                    width={40}
                    height={40}
                    onError={(e) => {
                      e.currentTarget.src = "/images/vbuilds/blood/brute-blood.jpg"
                    }}
                  />
                  <span>{blood}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Secondary Blood Selection */}
        <div className="relative">
          <button
            onClick={() => setIsSecondaryOpen(!isSecondaryOpen)}
            disabled={!primaryBlood}
            className={`w-full bg-black/50 border border-red-900/30 rounded-md px-5 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all flex items-center justify-between py-6 ${secondaryBlood === '' ? 'py-6' : '!py-4'} ${!primaryBlood ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {secondaryBlood ? (
              <div className="flex items-center gap-2">
                <Image
                  src={`/images/vbuilds/blood/${secondaryBlood.toLowerCase()}-blood.jpg`}
                  alt={secondaryBlood}
                  className="w-10 h-10 object-cover rounded"
                  width={40}
                  height={40}
                  onError={(e) => {
                    e.currentTarget.src = "/images/vbuilds/blood/brute-blood.jpg"
                  }}
                />
                <span>{secondaryBlood}</span>
              </div>
            ) : (
              <span>Select Secondary Blood</span>
            )}
            <svg
              className={`w-4 h-4 transition-transform ${isSecondaryOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isSecondaryOpen && (
            <div className="absolute z-10 w-full mt-1 bg-black/90 border border-red-900/30 rounded-md shadow-lg max-h-96 overflow-y-auto">
              {Object.keys(bloodData)
                .filter(blood => blood !== primaryBlood)
                .map((blood) => (
                  <button
                    key={blood}
                    onClick={() => {
                      setSecondaryBlood(blood as BloodKey)
                      setIsSecondaryOpen(false)
                      setSelectedPerk(null)
                    }}
                    className="w-full px-5 py-4 text-left text-white hover:bg-red-900/50 flex items-center gap-2"
                  >
                    <Image
                      src={`/images/vbuilds/blood/${blood.toLowerCase()}-blood.jpg`}
                      alt={blood}
                      className="w-10 h-10 object-cover rounded"
                      width={40}
                      height={40}
                      onError={(e) => {
                        e.currentTarget.src = "/images/vbuilds/blood/brute-blood.jpg"
                      }}
                    />
                    <span>{blood}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary Blood effects Display */}
      {primaryBlood && (
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Blood effects */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center">
                <span className="mr-2">Primary Blood</span>
                <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">All effects included</div>
              </h3>
              <div className="space-y-2">
                {bloodData[primaryBlood as BloodKey].map((perk, index) => (
                  <div
                    key={index}
                    className="bg-black/30 border border-green-900/30 p-3 rounded-md"
                  >
                    <div className="flex items-center">
                      <div className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full mr-2">
                        <Check className="w-3 h-4" />
                      </div>
                      <p className="text-sm text-white">{index + 1}. {perk}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary Blood effects */}
            {secondaryBlood && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center">
                  <span className="mr-2">Secondary Blood</span>
                  <div className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">Choose One Effect ( 1 - 3 )</div>
                </h3>
                <div className="space-y-2">
                  {/* Selectable effects (1-3) */}
                  {bloodData[secondaryBlood as BloodKey].slice(0, 3).map((perk, index) => (
                    <div
                      key={index}
                      className={`flex items-center p-3 rounded-md transition-all cursor-pointer ${selectedPerk === index + 1
                        ? 'bg-red-900/50 border border-red-500/50'
                        : 'bg-black/30 border border-red-900/30 hover:bg-black/40'
                        }`}
                      onClick={() => setSelectedPerk(index + 1)}
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full mr-3 flex items-center justify-center border ${selectedPerk === index + 1 ? 'bg-red-500/50 border-red-400' : 'bg-black/50 border-gray-600'
                        }`}>
                        {selectedPerk === index + 1 && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-white">{index + 1}. {perk}</p>
                    </div>
                  ))}

                  {/* Always included 4th perk */}
                  <div className="bg-black/30 border border-green-900/30 p-3 rounded-md">
                    <div className="flex items-center">
                      <div className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full mr-2">
                        <Check className="w-3 h-4" />
                      </div>
                      <p className="text-sm text-white">4. {bloodData[secondaryBlood as BloodKey][3]}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* If no secondary blood is selected yet, show a prompt */}
            {!secondaryBlood && (
              <div className="flex flex-col items-center justify-center h-full bg-black/20 border border-red-900/30 rounded-md p-6">
                <div className="text-red-900 mb-3 opacity-50">
                  <PlusCircle className="w-12 h-12" />
                </div>
                <p className="text-center text-gray-400">Select a secondary blood type to see available effects</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Command Display - only show when all selections are made */}
      {primaryBlood && secondaryBlood && selectedPerk !== null && (
        <div className="flex flex-col items-center justify-center pt-6">
          <span className="text-gray-400/50 text-sm mb-2">Paste on your game chat:</span>

          <div className="bg-black px-4 py-2 rounded-md border border-red-900/30 w-full text-center">
            <code className="text-gray-300  text-xl break-all bg-black/50 px-12 rounded-md lowercase">
              .bp {primaryBlood} {secondaryBlood} {selectedPerk}
            </code>
          </div>
          <motion.div
            className="w-full mt-2"
            whileHover={{ scale: canCopyCommand ? 1.01 : 1 }}
            whileTap={{ scale: canCopyCommand ? 0.95 : 1 }}
          >
            <Button
              variant="outline"
              className={`w-full text-white relative overflow-hidden group border-red-900/70 ${canCopyCommand ? 'bg-red-900/50 hover:bg-red-800' : 'bg-gray-700/50 cursor-not-allowed'} transition-colors`}
              onClick={copyCommand}
              disabled={!canCopyCommand}
            >
              <span className="relative z-10">COPY COMMAND</span>
              {canCopyCommand && (
                <motion.span
                  className="absolute inset-0 bg-white/10 z-0"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
