"use client"

import { motion } from "framer-motion"
import { useState } from "react"
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

  const legendaryDefaultBg = schoolColors.blood.bg
  const jewelDefaultBg = 'bg-[url("/images/background/Shadow.png")]'

  return (
    <motion.div
      className="p-4"
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className={`
        ${activeTab === 0 ? 'bg-[url("/images/background/Passives.png")] bg-cover bg-center' : ''}
        ${activeTab === 1 ? (legendaryDefaultBg + ' bg-cover bg-center') : ''}
        ${activeTab === 2 ? (selectedJewelSchool ? schoolColors[selectedJewelSchool as SchoolKey].bg : jewelDefaultBg + ' bg-cover bg-center') : ''}
        max-w-4xl mx-auto rounded-lg border border-red-900/30 p-6 min-h-[600px] backdrop-blur-sm shadow-lg transition-all duration-500`}>
        <div className="relative flex justify-center gap-8 mb-8">
          {["Artifact", "Legendary", "Jewel"].map((tab, index) => (
            <motion.button
              key={tab}
              className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === index
                ? `text-white`
                : "text-gray-400 hover:text-white"
                }`}
              onClick={() => setActiveTab(index)}
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
                {activeTab === index && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                    className="w-2 h-2 rounded-full bg-white"
                  />
                )}
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
            />
          )}

          {activeTab === 2 && <JewelTab
            schoolColors={schoolColors}
            onSchoolSelect={(school) => {
              const isValidSchool = (s: string): s is SchoolKey => {
                return (Object.keys(schoolsData) as Array<string>).includes(s);
              };
              if (isValidSchool(school)) {
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