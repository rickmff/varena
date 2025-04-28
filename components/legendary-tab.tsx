"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { schoolsData } from "./jewels-tab"
import type { SchoolKey, SchoolColors } from "./jewels-tab"
import { epicWeaponsDropdown, EpicWeapon } from "../data/epicWeapon"
import { effectsData, EffectId } from "../data/effects"

export interface LegendaryTabProps {
  schoolColors: SchoolColors;
  onLegendaryInfuseChange: (infuse: SchoolKey | '') => void;
}

export default function LegendaryTab({ schoolColors, onLegendaryInfuseChange }: LegendaryTabProps) {
  // State moved from CommandGenerator
  const [legendaryWeapon, setLegendaryWeapon] = useState<EpicWeapon | ''>('')
  const [legendaryInfuse, setLegendaryInfuse] = useState<SchoolKey | ''>('')
  const [selectedEffects, setSelectedEffects] = useState<EffectId[]>([])
  const [isWeaponOpen, setIsWeaponOpen] = useState(false)
  const [isInfuseOpen, setIsInfuseOpen] = useState(false)

  // Logic moved from CommandGenerator
  const currentLegendaryColors = legendaryInfuse ? schoolColors[legendaryInfuse] : schoolColors.blood;

  const toggleEffect = (effectId: EffectId) => {
    if (selectedEffects.includes(effectId)) {
      setSelectedEffects(selectedEffects.filter(id => id !== effectId));
    } else if (selectedEffects.length < 3) {
      setSelectedEffects([...selectedEffects, effectId]);
    } else {
      toast.warning('You can only select up to 3 attributes.', { duration: 2000, position: 'top-center' });
    }
  }

  const copyLegendaryCommand = async () => {
    if (!legendaryWeapon || !legendaryInfuse || selectedEffects.length !== 3) {
      toast.error('Please select a weapon, an infuse, and exactly 3 attributes.', { duration: 3000, position: 'top-center' });
      return;
    }
    try {
      const formattedWeaponName = legendaryWeapon.replace(/_/g, ' ').replace('Epic', '').trim().toLowerCase();
      const command = `.lw ${formattedWeaponName} ${legendaryInfuse} ${selectedEffects.join('')}`;
      await navigator.clipboard.writeText(command);
      toast.success('Legendary command copied!', {
        duration: 2000,
        position: 'top-center'
      });
    } catch (error) {
      toast.error('Failed to copy command');
    }
  }

  const canCopyLegendary = legendaryWeapon && legendaryInfuse && selectedEffects.length === 3;
  const inputClass = (baseClass: string) => `${baseClass} ${currentLegendaryColors.border} ${currentLegendaryColors.focus}`;

  // Return the JSX previously inside activeTab === 1 condition
  return (
    <div className="space-y-6">
      {/* Weapon and Infuse Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weapon Selector */}
        <div className="relative">
          <button
            onClick={() => setIsWeaponOpen(!isWeaponOpen)}
            className={inputClass(`w-full bg-black/70 border rounded-md px-5 text-white focus:ring-2 transition-all flex items-center justify-between capitalize ${legendaryWeapon === '' ? 'py-6' : 'py-4'}`)}
          >
            {legendaryWeapon ? (
              <div className="flex items-center gap-2 capitalize">
                <img src={epicWeaponsDropdown.find(w => w.name === legendaryWeapon)?.image.src} alt={legendaryWeapon} className="w-10 h-10 mr-4" />
                <span>{legendaryWeapon.replace(/_/g, ' ').replace('Epic', '').trim()}</span>
              </div>
            ) : (
              <span>Select Legendary Weapon</span>
            )}
            <svg className={`w-4 h-4 transition-transform ${isWeaponOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isWeaponOpen && (
            <div className={`absolute z-20 w-full mt-1 bg-black/70 border ${currentLegendaryColors.border} rounded-md shadow-lg overflow-y-auto max-h-[400px]`}>
              {epicWeaponsDropdown.map(({ name, image }) => (
                <button
                  key={name}
                  onClick={() => {
                    setLegendaryWeapon(name as EpicWeapon);
                    setLegendaryInfuse(''); // Reset infuse on weapon change
                    setSelectedEffects([]); // Reset effects on weapon change
                    setIsWeaponOpen(false);
                  }}
                  className={`w-full px-5 py-4 text-left text-white hover:${currentLegendaryColors.button} flex items-center`}
                >
                  <img src={image.src} alt={name} className="w-12 h-12 mr-4" />
                  {name.replace(/_/g, ' ').replace('Epic', '').trim()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infuse Selector */}
        <div className="relative">
          <button
            onClick={() => setIsInfuseOpen(!isInfuseOpen)}
            disabled={!legendaryWeapon}
            className={inputClass(`w-full bg-black/70 border rounded-md px-5 text-white focus:ring-2 transition-all flex items-center justify-between capitalize ${legendaryInfuse === '' ? 'py-6' : 'py-4'} ${!legendaryWeapon ? 'opacity-50 cursor-not-allowed' : ''}`)}
          >
            {legendaryInfuse ? (
              <div className="flex items-center gap-2 capitalize">
                <img src={schoolsData[legendaryInfuse as SchoolKey].image} alt={schoolsData[legendaryInfuse as SchoolKey].name} className="w-10 h-10 mr-4" />
                <span>{schoolsData[legendaryInfuse as SchoolKey].name}</span>
              </div>
            ) : (
              <span>Select Infuse</span>
            )}
            <svg className={`w-4 h-4 transition-transform ${isInfuseOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isInfuseOpen && legendaryWeapon && (
            <div className={`absolute z-20 w-full mt-1 bg-black/70 border ${currentLegendaryColors.border} rounded-md shadow-lg overflow-y-auto max-h-[400px]`}>
              {(Object.entries(schoolsData) as [SchoolKey, { name: string; image: string }][]).map(([key, school]) => (
                <button
                  key={key}
                  onClick={() => {
                    setLegendaryInfuse(key);
                    setSelectedEffects([]); // Reset effects on infuse change
                    setIsInfuseOpen(false);
                    onLegendaryInfuseChange(key);
                  }}
                  className={`w-full px-5 py-4 text-left text-white hover:${currentLegendaryColors.button} flex items-center`}
                >
                  <img src={school.image} alt={school.name} className="w-12 h-12 mr-4" />
                  {school.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Effects Selection, Command Display, Copy Button */}
      {legendaryWeapon && legendaryInfuse && (
        <motion.div
          className="space-y-4 pt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {/* Effects Buttons */}
          <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.entries(effectsData) as [EffectId, string][]).map(([id, effect]) => {
              const isSelected = selectedEffects.includes(id);
              const isDisabled = !isSelected && selectedEffects.length >= 4;
              return (
                <button
                  key={id}
                  className={`
                    h-14 flex items-center justify-center p-2 rounded-md text-sm text-center font-mono border transition-colors duration-200 ease-in-out opacity-100 text-white
                    ${currentLegendaryColors.border}
                    ${isDisabled
                      ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed opacity-50'
                      : isSelected
                        ? `${currentLegendaryColors.button} text-white shadow-md`
                        : `bg-black/50 text-gray-400 hover:${currentLegendaryColors.button} hover:text-white hover:opacity-100 opacity-80`
                    }
                  `}
                  onClick={() => toggleEffect(id)}
                  disabled={isDisabled}
                >
                  {effect.replace('StatMod_', '').replace(/([a-z])([A-Z])/g, '$1 $2')}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col items-center justify-center pt-6">
            <span className="text-gray-400/50 text-sm mb-2">Paste on your game chat:  </span>

            <div className={`bg-black px-4 py-2 rounded-md border w-full text-center ${currentLegendaryColors.border}`}>
              <code className="text-gray-300 font-mono text-xl break-all bg-black/50 px-12 rounded-md">
                .lw {legendaryWeapon.replace(/_/g, ' ').replace('Epic', '').trim().toLowerCase()} {legendaryInfuse} {selectedEffects.join('')}
              </code>
            </div>

            <motion.div
              className="-pt-6 w-full"
              whileHover={{ scale: canCopyLegendary ? 1.01 : 1 }}
              whileTap={{ scale: canCopyLegendary ? 0.95 : 1 }}
            >
              <Button
                variant="outline"
                className={`w-full text-white relative overflow-hidden group border-${currentLegendaryColors.primary}-900/70 ${canCopyLegendary ? currentLegendaryColors.button : 'bg-gray-700/50 cursor-not-allowed'} transition-colors`}
                onClick={copyLegendaryCommand}
                disabled={!canCopyLegendary}
              >
                <span className="relative z-10">COPY COMMAND</span>
                {canCopyLegendary && (
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
        </motion.div>
      )}
    </div>
  );
}