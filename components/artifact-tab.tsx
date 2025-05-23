"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import type { SchoolKey, SchoolColors } from "./jewels-tab"
import { effectsData, EffectId } from "../data/effects"
import { artifactDetailsMap } from "../data/artifact"
import type { ArtifactDetails } from "../data/artifact"
import Image from "next/image"

interface ArtifactTabProps {
  schoolColors: SchoolColors;
}

export default function ArtifactTab({ schoolColors }: ArtifactTabProps) {
  const [selectedWeaponKey, setSelectedWeaponKey] = useState<string | ''>('')
  const [selectedEffects, setSelectedEffects] = useState<EffectId[]>([])
  const [isWeaponOpen, setIsWeaponOpen] = useState(false)


  const selectedWeaponDetails: ArtifactDetails | null = selectedWeaponKey ? artifactDetailsMap[selectedWeaponKey] : null;
  const currentInfuse = selectedWeaponDetails?.infuse;
  const getEffectiveSchoolKey = (): SchoolKey => {
    if (currentInfuse && currentInfuse !== 'None') {
      const lowerInfuse = currentInfuse.toLowerCase() as SchoolKey;
      if (lowerInfuse in schoolColors) {
        return lowerInfuse;
      }
    }
    return 'blood';
  };
  const effectiveSchoolKey = getEffectiveSchoolKey();
  const currentArtifactColors = schoolColors[effectiveSchoolKey];


  const toggleEffect = (effectId: EffectId) => {
    if (!selectedWeaponKey) return;

    if (selectedEffects.includes(effectId)) {
      setSelectedEffects(selectedEffects.filter(id => id !== effectId));
    } else if (selectedEffects.length < 3) {
      setSelectedEffects([...selectedEffects, effectId]);
    } else {
      toast.warning('You can only select up to 3 attributes.', { duration: 2000, position: 'top-center' });
    }
  }

  const copyArtifactCommand = async () => {
    if (!selectedWeaponKey || !selectedWeaponDetails || selectedEffects.length !== 3) {
      toast.error('Please select a weapon and exactly 3 attributes.', { duration: 3000, position: 'top-center' });
      return;
    }
    if (selectedWeaponDetails.infuse === 'None') {
      toast.error('Cannot generate command for weapons with "None" infuse.', { duration: 3000, position: 'top-center' });
      return;
    }

    try {
      const formattedWeaponName = selectedWeaponDetails.artifactName.toLowerCase();
      const infuseForCommand = selectedWeaponDetails.infuse.toLowerCase();
      const command = `.lw ${formattedWeaponName} ${infuseForCommand} ${selectedEffects.join('')}`;
      await navigator.clipboard.writeText(command);
      toast.success('Artifact command copied!', {
        duration: 2000,
        position: 'top-center'
      });
    } catch (error) {
      toast.error('Failed to copy command');
    }
  }

  const canCopyArtifact = selectedWeaponKey && selectedWeaponDetails && selectedWeaponDetails.artifactName !== '' && selectedEffects.length === 3;
  const inputClass = (baseClass: string) => `${baseClass} ${currentArtifactColors.border} ${currentArtifactColors.focus}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="relative">
          <button
            onClick={() => setIsWeaponOpen(!isWeaponOpen)}
            className={inputClass(`w-full bg-black/70 border rounded-md px-5 text-white focus:ring-2 transition-all flex items-center justify-between capitalize ${!selectedWeaponKey ? 'py-6' : 'py-4'}`)}
          >
            {selectedWeaponDetails ? (
              <div className="flex items-center gap-2 capitalize">
                <Image
                  src={selectedWeaponDetails.image}
                  alt={selectedWeaponDetails.artifactName}
                  className="w-10 h-10 mr-4"
                  width={40}
                  height={40}
                />
                <span>{selectedWeaponDetails.artifactName.replace(/^The\s+/i, '')}</span>
              </div>
            ) : (
              <span>Select Artifact Weapon</span>
            )}
            <svg className={`w-4 h-4 transition-transform ${isWeaponOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isWeaponOpen && (
            <div className={`absolute z-20 w-full mt-1 bg-black/70 border ${currentArtifactColors.border} rounded-md shadow-lg overflow-y-auto max-h-[400px]`}>
              {Object.entries(artifactDetailsMap)
                .sort(([_, a], [__, b]) => a.artifactName.replace(/^The\s+/i, '').localeCompare(b.artifactName.replace(/^The\s+/i, '')))
                .map(([key, details]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedWeaponKey(key);
                      setSelectedEffects([]);
                      setIsWeaponOpen(false);
                    }}
                    className={`w-full px-5 py-4 text-left text-white hover:${currentArtifactColors.button} flex items-center`}
                  >
                    <Image
                      src={details.image}
                      alt={details.artifactName}
                      className="w-12 h-12 mr-4"
                      width={48}
                      height={48}
                    />
                    {details.artifactName.replace(/^The\s+/i, '')}
                  </button>
                ))}
            </div>
          )}
        </div>


      </div>

      {selectedWeaponKey && selectedWeaponDetails && (
        <motion.div
          className="space-y-4 pt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {selectedWeaponDetails.artifactName !== '' && (
            <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.entries(effectsData) as [EffectId, string][]).map(([id, effect]) => {
                const isSelected = selectedEffects.includes(id);
                const isDisabled = !isSelected && selectedEffects.length >= 4;
                return (
                  <button
                    key={id}
                    className={`
                    h-14 flex items-center justify-center p-2 rounded-md text-sm text-center  border transition-colors duration-200 ease-in-out opacity-100 text-white
                    ${currentArtifactColors.border}
                    ${isDisabled
                        ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed opacity-50'
                        : isSelected
                          ? `${currentArtifactColors.button} text-white shadow-md`
                          : `bg-black/50 text-gray-400 hover:${currentArtifactColors.button} hover:text-white hover:opacity-100 opacity-80`
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
          )}


          <div className="flex flex-col items-center justify-center pt-6">
            <span className="text-gray-400/50 mb-2 text-sm">Paste on your game chat:  </span>

            <div className={`bg-black px-4 py-2 rounded-md border w-full text-center ${currentArtifactColors.border}`}>
              <code className="text-gray-300  text-xl break-all bg-black/50 px-12 rounded-md">
                .art {selectedWeaponKey} {selectedEffects.join('')}
              </code>
            </div>


            {selectedWeaponDetails.artifactName !== '' && (
              <motion.div
                className="-pt-6 w-full"
                whileHover={{ scale: canCopyArtifact ? 1.01 : 1 }}
                whileTap={{ scale: canCopyArtifact ? 0.95 : 1 }}
              >
                <Button
                  variant="outline"
                  className={`w-full text-white relative overflow-hidden group border-${currentArtifactColors.primary}-900/70 ${canCopyArtifact ? currentArtifactColors.button : 'bg-gray-700/50 cursor-not-allowed'} transition-colors`}
                  onClick={copyArtifactCommand}
                  disabled={!canCopyArtifact}
                >
                  <span className="relative z-10">COPY COMMAND</span>
                  {canCopyArtifact && (
                    <motion.span
                      className="absolute inset-0 bg-white/10 z-0"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}