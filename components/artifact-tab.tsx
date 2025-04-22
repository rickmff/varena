"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import type { SchoolKey, SchoolColors } from "./jewels-tab"
import { effectsData, EffectId } from "../data/effects"
import { artifactDetailsMap } from "../data/artifact"
import type { ArtifactDetails } from "../data/artifact"

interface ArtifactTabProps {
  schoolColors: SchoolColors; // Pass the whole object
}

export default function ArtifactTab({ schoolColors }: ArtifactTabProps) {
  // State changes: Use selectedWeaponKey, remove artifactIn
  const [selectedWeaponKey, setSelectedWeaponKey] = useState<string | ''>('') // Store the key ('spear', 'slashers', etc.)
  const [selectedEffects, setSelectedEffects] = useState<EffectId[]>([])
  const [isWeaponOpen, setIsWeaponOpen] = useState(false)
  // Removed isInfuseOpen and setIsInfuseOpen

  // Get selected weapon details and derive infuse/colors
  const selectedWeaponDetails: ArtifactDetails | null = selectedWeaponKey ? artifactDetailsMap[selectedWeaponKey] : null;
  const currentInfuse = selectedWeaponDetails?.infuse;
  // Determine the SchoolKey for styling, defaulting for 'None' or no selection
  const getEffectiveSchoolKey = (): SchoolKey => {
    if (currentInfuse && currentInfuse !== 'None') {
      const lowerInfuse = currentInfuse.toLowerCase() as SchoolKey;
      // Check if the lowercase infuse exists as a key in schoolColors
      if (lowerInfuse in schoolColors) {
        return lowerInfuse;
      }
    }
    return 'blood'; // Default school key
  };
  const effectiveSchoolKey = getEffectiveSchoolKey();
  const currentArtifactColors = schoolColors[effectiveSchoolKey];


  const toggleEffect = (effectId: EffectId) => {
    // No changes needed here, but ensure it's only possible when a weapon is selected
    if (!selectedWeaponKey) return;

    if (selectedEffects.includes(effectId)) {
      setSelectedEffects(selectedEffects.filter(id => id !== effectId));
    } else if (selectedEffects.length < 4) {
      setSelectedEffects([...selectedEffects, effectId]);
    } else {
      toast.warning('You can only select up to 4 attributes.', { duration: 2000, position: 'top-center' });
    }
  }

  const copyArtifactCommand = async () => {
    // Use selectedWeaponKey and derived infuse
    if (!selectedWeaponKey || !selectedWeaponDetails || selectedEffects.length !== 4) {
      toast.error('Please select a weapon and exactly 4 attributes.', { duration: 3000, position: 'top-center' });
      return;
    }
    // Prevent copying if infuse is 'None'
    if (selectedWeaponDetails.infuse === 'None') {
      toast.error('Cannot generate command for weapons with "None" infuse.', { duration: 3000, position: 'top-center' });
      return;
    }

    try {
      // Use artifactName and lowercase infuse from the map
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

  // Update condition based on selectedWeaponKey and infuse !== 'None'
  const canCopyArtifact = selectedWeaponKey && selectedWeaponDetails && selectedWeaponDetails.infuse !== 'None' && selectedEffects.length === 4;
  const inputClass = (baseClass: string) => `${baseClass} ${currentArtifactColors.border} ${currentArtifactColors.focus}`;

  return (
    <div className="space-y-6">
      {/* Weapon Selector Only */}
      <div className="grid grid-cols-1 gap-4"> {/* Changed grid-cols-2 to grid-cols-1 */}
        {/* Weapon Selector - Updated */}
        <div className="relative">
          <button
            onClick={() => setIsWeaponOpen(!isWeaponOpen)}
            // Adjust py based on selection
            className={inputClass(`w-full bg-black/70 border rounded-md px-5 text-white focus:ring-2 transition-all flex items-center justify-between capitalize ${!selectedWeaponKey ? 'py-6' : 'py-4'}`)}
          >
            {selectedWeaponDetails ? (
              <div className="flex items-center gap-2 capitalize">
                {/* Use image and artifactName from details */}
                <img src={selectedWeaponDetails.image.src} alt={selectedWeaponDetails.artifactName} className="w-10 h-10 mr-4" />
                <span>{selectedWeaponDetails.artifactName}</span>
              </div>
            ) : (
              <span>Select Artifact Weapon</span>
            )}
            <svg className={`w-4 h-4 transition-transform ${isWeaponOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isWeaponOpen && (
            // Iterate over artifactDetailsMap
            <div className={`absolute z-20 w-full mt-1 bg-black/70 border ${currentArtifactColors.border} rounded-md shadow-lg overflow-y-auto max-h-[400px]`}>
              {Object.entries(artifactDetailsMap).map(([key, details]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedWeaponKey(key); // Set the key
                    setSelectedEffects([]); // Reset effects on weapon change
                    setIsWeaponOpen(false);
                    // No need to set infuse state anymore
                  }}
                  className={`w-full px-5 py-4 text-left text-white hover:${currentArtifactColors.button} flex items-center`}
                >
                  <img src={details.image.src} alt={details.artifactName} className="w-12 h-12 mr-4" />
                  {details.artifactName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infuse Selector - REMOVED */}

      </div>

      {/* Effects Selection, Command Display, Copy Button - Condition updated */}
      {selectedWeaponKey && selectedWeaponDetails && ( // Show this section only when a weapon is selected
        <motion.div
          className="space-y-4 pt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {/* Effects Buttons - Added check for infuse !== 'None' */}
          {selectedWeaponDetails.infuse !== 'None' ? (
            <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.entries(effectsData) as [EffectId, string][]).map(([id, effect]) => {
                const isSelected = selectedEffects.includes(id);
                const isDisabled = !isSelected && selectedEffects.length >= 4;
                return (
                  <button
                    key={id}
                    className={`
                    h-14 flex items-center justify-center p-2 rounded-md text-sm text-center font-mono border transition-colors duration-200 ease-in-out opacity-100 text-white
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
          ) : (
            <div className={`bg-black/30 p-4 rounded-md border ${currentArtifactColors.border} text-center text-gray-400`}>
              Attribute selection is not available for weapons with 'None' infuse.
            </div>
          )}


          {/* Command Display - Updated and conditional */}
          <div className={`bg-black/30 p-4 rounded-md border ${currentArtifactColors.border}`}>
            <code className="text-gray-300 font-mono text-sm break-all">
              {/* Use the selectedWeaponKey directly */}
              .art {selectedWeaponKey} {selectedEffects.join('')}
            </code>
          </div>


          {/* Copy Button - Updated condition */}
          {selectedWeaponDetails.infuse !== 'None' && ( // Only show copy button if infuse is not 'None'
            <motion.div
              className="mt-6"
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
        </motion.div>
      )}
    </div>
  );
}