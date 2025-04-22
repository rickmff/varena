"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import spellData from "@/data/jewels"
import { EffectId, effectsData } from "./command-generator"

type SchoolKey = keyof typeof schoolsData;

const schoolsData = {
  blood: { name: "Blood", image: "/images/schools/blood.png" },
  chaos: { name: "Chaos", image: "/images/schools/chaos.png" },
  unholy: { name: "Unholy", image: "/images/schools/unholy.png" },
  illusion: { name: "Illusion", image: "/images/schools/illusion.png" },
  frost: { name: "Frost", image: "/images/schools/frost.png" },
  lightning: { name: "Lightning", image: "/images/schools/lightning.png" }
} as const;

type SchoolColors = {
  [key: string]: {
    primary: string;
    bg: string;
    border: string;
    focus: string;
    button: string;
  };
};

interface JewelTabProps {
  schoolColors: SchoolColors;
  onSchoolSelect: (school: string) => void;
}

export default function JewelTab({ schoolColors, onSchoolSelect }: JewelTabProps) {
  const [spellName, setSpellName] = useState('')
  const [selectedSchool, setSelectedSchool] = useState<SchoolKey | ''>('')
  const [selectedEffects, setSelectedEffects] = useState<EffectId[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSchoolOpen, setIsSchoolOpen] = useState(false)

  const currentColors = selectedSchool ? schoolColors[selectedSchool] : schoolColors.default

  const inputClass = (baseClass: string) => `${baseClass} ${currentColors.border} ${currentColors.focus}`

  const toggleEffect = (effectId: EffectId) => {
    if (selectedEffects.includes(effectId)) {
      setSelectedEffects(selectedEffects.filter(id => id !== effectId))
    } else if (selectedEffects.length < 4) {
      setSelectedEffects([...selectedEffects, effectId])
    }
  }

  const copyCommand = async () => {
    try {
      const command = `.j ${spellName} ${selectedEffects.join(' ')}`
      await navigator.clipboard.writeText(command)
      toast.success('Command copied to clipboard!', {
        duration: 2000,
        position: 'top-center'
      })
    } catch (error) {
      toast.error('Failed to copy command')
    }
  }

  const handleSchoolSelect = (school: SchoolKey) => {
    setSelectedSchool(school)
    onSchoolSelect(school)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* School Selection */}
        <div className="relative">
          <button
            onClick={() => setIsSchoolOpen(!isSchoolOpen)}
            className={inputClass(`w-full bg-black/50 border rounded-md px-5 py-4 text-white focus:ring-2 transition-all flex items-center justify-between`)}
          >
            {selectedSchool ? (
              <div className="flex items-center gap-2">
                <img
                  src={schoolsData[selectedSchool].image}
                  alt={schoolsData[selectedSchool].name}
                  className="w-10 h-10 object-cover rounded"
                />
                <span>{schoolsData[selectedSchool].name}</span>
              </div>
            ) : (
              <span>Select School</span>
            )}
            <svg
              className={`w-4 h-4 transition-transform ${isSchoolOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isSchoolOpen && (
            <div className={`absolute z-10 w-full mt-1 bg-black/90 border ${currentColors.border} rounded-md shadow-lg`}>
              {Object.entries(schoolsData).map(([key, school]) => (
                <button
                  key={key}
                  onClick={() => {
                    handleSchoolSelect(key as SchoolKey)
                    setSpellName('')
                    setSelectedEffects([])
                    setIsSchoolOpen(false)
                  }}
                  className={`w-full px-5 py-4 text-left text-white hover:${schoolColors[key as keyof typeof schoolColors].button} flex items-center gap-2`}
                >
                  <img
                    src={school.image}
                    alt={school.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <span>{school.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spell Selection */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={inputClass(`w-full bg-black/50 border rounded-md px-5 text-white focus:ring-2 transition-all flex items-center justify-between ${spellName === '' ? 'py-6' : 'py-4'}`)}
          >
            {spellName ? (
              <div className="flex items-center gap-2">
                <img
                  src={spellData[spellName].image ?? "/images/spells/fallback.jpg"}
                  alt={spellData[spellName].name}
                  className="w-10 h-10 object-cover rounded"
                />
                <span>{spellData[spellName].name}</span>
              </div>
            ) : (
              <span>Select Spell</span>
            )}
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className={`absolute z-10 w-full mt-1 bg-black/90 border ${currentColors.border} rounded-md shadow-lg max-h-96 overflow-y-auto`}>
              {Object.entries(spellData)
                .filter(([_, spell]) => !selectedSchool || spell.school === selectedSchool)
                .map(([key, spell]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSpellName(key)
                      setSelectedEffects([])
                      setIsOpen(false)
                    }}
                    className={`w-full px-5 py-4 text-left text-white hover:${currentColors.button} flex items-center gap-2`}
                  >
                    <img
                      src={spell.image ?? "/images/spells/fallback.jpg"}
                      alt={spell.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <span>{spell.name}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {spellName && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {spellData[spellName].effects.map((effect) => (
              <div
                key={effect.id as EffectId}
                className={`flex items-center space-x-3 p-3 rounded-md transition-all cursor-pointer ${selectedEffects.includes(effect.id as EffectId)
                  ? `${currentColors.button} border border-${currentColors.primary}-500/50`
                  : selectedEffects.length >= 4
                    ? `bg-black/20 border border-${currentColors.primary}-900/20 cursor-not-allowed opacity-50`
                    : `bg-black/30 border border-${currentColors.primary}-900/30 hover:bg-black/40`
                  }`}
                onClick={() => toggleEffect(effect.id as EffectId)}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center
                  ${selectedEffects.includes(effect.id as EffectId)
                    ? `border-${currentColors.primary}-500 bg-${currentColors.primary}-500`
                    : `border-${currentColors.primary}-900/50`}`}>
                  {selectedEffects.includes(effect.id as EffectId) && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <label className="text-sm text-white cursor-pointer">
                  {effect.name}
                </label>
              </div>
            ))}
          </div>

          <div className={`bg-black/30 p-4 rounded-md border ${currentColors.border}`}>
            <code className="text-gray-300 font-mono">
              .j {spellName} {selectedEffects.join('')}
            </code>
          </div>
        </div>
      )}

      <motion.div
        className="mt-6"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="outline"
          className={`w-full text-white relative overflow-hidden group border-${currentColors.primary}-900/70 ${currentColors.button}`}
          onClick={copyCommand}
        >
          <span className="relative">COPY COMMAND</span>
          <motion.span
            className="absolute inset-0 bg-white/10"
            initial={{ x: "-100%" }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.3 }}
          />
        </Button>
      </motion.div>
    </div>
  )
}