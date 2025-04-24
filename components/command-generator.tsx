"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useMemo } from "react"
import JewelTab, { schoolColors, schoolsData } from "./jewels-tab"
import type { SchoolKey } from "./jewels-tab"
import LegendaryTab from "./legendary-tab"
import ArtifactTab from "./artifact-tab"
const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6 },
  },
}

export default function CommandGenerator() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedJewelSchool, setSelectedJewelSchool] = useState<SchoolKey | ''>('')
  const [legendaryInfuse, setLegendaryInfuse] = useState<SchoolKey | ''>('')

  const jewelDefaultBg = 'bg-[url("/images/background/Shadow.png")]'
  const legendaryDefaultBg = 'bg-[url("/images/background/Passives.png")]'

  const changeTab = (tab: number) => {
    setActiveTab(tab)
    setLegendaryInfuse('')
    setSelectedJewelSchool('')
  }

  const computedBG = useMemo(() => {
    if (activeTab === 0) {
      return 'bg-[url("/images/background/Passives.png")]'
    } else if (activeTab === 1) {
      return legendaryInfuse ? schoolColors[legendaryInfuse as SchoolKey].bg : legendaryDefaultBg + ' bg-cover bg-left'
    } else if (activeTab === 2) {
      return selectedJewelSchool ? schoolColors[selectedJewelSchool as SchoolKey].bg : jewelDefaultBg + ' bg-cover bg-center'
    }
    return ''
  }, [activeTab, legendaryInfuse, selectedJewelSchool])

  return (
    <motion.div
      className="p-4"
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className={`max-w-4xl mx-auto rounded-lg border border-red-900/30 p-6 min-h-[600px] backdrop-blur-sm shadow-lg transition-all duration-500 ${computedBG}`}>
        <div className="relative flex justify-center gap-8 mb-8">
          {["Artifact", "Legendary", "Jewel"].map((tab, index) => (
            <motion.button
              key={tab}
              className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === index
                ? `text-white`
                : "text-gray-400 hover:text-white"
                }`}
              onClick={() => changeTab(index)}
              whileTap={{ scale: 0.7 }}
            >
              {activeTab === index && (
                <>
                  <motion.div
                    className={`absolute inset-0 ${index === 1 ? schoolColors.blood.button : schoolColors.blood.button} rounded-full`}
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                </>
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab}
              </span>
            </motion.button>
          ))}
        </div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === 0 && (
            <div className="space-y-6">
              <ArtifactTab schoolColors={schoolColors} />
            </div>
          )}

          {activeTab === 1 && (
            <LegendaryTab
              schoolColors={schoolColors}
              onLegendaryInfuseChange={(infuse) => {
                const isValid = (s: string): s is SchoolKey => {
                  return (Object.keys(schoolsData) as Array<string>).includes(s);
                };
                if (isValid(infuse)) {
                  setLegendaryInfuse(infuse);
                } else {
                  setLegendaryInfuse('');
                }
              }}
            />
          )}

          {activeTab === 2 && <JewelTab
            schoolColors={schoolColors}
            onSchoolSelect={(school) => {
              const isValid = (s: string): s is SchoolKey => {
                return (Object.keys(schoolsData) as Array<string>).includes(s);
              };
              if (isValid(school)) {
                setSelectedJewelSchool(school);
              } else {
                setSelectedJewelSchool('');
              }
            }}
          />}
        </motion.div>
      </div>
    </motion.div>
  )
}