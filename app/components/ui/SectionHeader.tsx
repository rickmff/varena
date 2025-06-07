"use client";

import { motion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, description }) => {
  return (
    <motion.div
      className="text-center mb-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
    >
      <div className="flex items-center justify-center mb-3">
        <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent to-red-600/50 relative">
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-red-600/80 rounded-full"></div>
        </div>
        <span className="px-6 text-xl font-junge text-red-600 tracking-wider uppercase">
          {title}
        </span>
        <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent to-red-600/50 relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-red-600/80 rounded-full"></div>
        </div>
      </div>
      {subtitle && (
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white uppercase">{subtitle}</h2>
      )}
      {description && (
        <p className="text-gray-100 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeader; 