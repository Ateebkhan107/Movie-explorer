'use client';

import { Film } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <div className="relative h-[350px] flex items-center justify-center text-center overflow-hidden mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-500 opacity-90 -z-10" />
      
      {/* Animated background noise/grain overlay could be added here if desired, using a static image or CSS */}
      
      <div className="z-10 text-white px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 flex items-center justify-center gap-3 drop-shadow-lg tracking-tight"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Film className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-400 drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]" />
          </motion.div>
          Movie Explorer
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-base sm:text-xl font-light opacity-90 max-w-2xl mx-auto px-2"
        >
          Discover the latest and greatest films from around the world
        </motion.p>
      </div>
    </div>
  );
}
