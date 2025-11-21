"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useState } from "react";

export default function Hero() {
    const [playing, setPlaying] = useState(false)
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center flex-col pt-20 overflow-hidden bg-white">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      {/* Animated subtle elements */}
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 bg-gray-200/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-gray-300/30 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.2, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Hero Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-block"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-black text-sm shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Premium Video Tutorials
            </div>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-black leading-tight">
            Master The Art of
            <br />
            <span className="text-gray-800">
              Bouquet Making
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Learn from expert florists with step-by-step video tutorials designed for all skill levels
          </p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4"
          >
            <button className="group px-8 py-4 bg-black text-white rounded-xl font-semibold shadow-sm hover:bg-gray-800 transition-all flex items-center gap-2">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Browse Tutorials
            </button>
            <button className="px-8 py-4 rounded-xl border-2 border-gray-300 text-black font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm">
              Learn More
            </button>
          </motion.div>

          {/* Video Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-gray-100">
              <div className="aspect-video bg-gray-200 flex items-center justify-center group cursor-pointer">
                {/* Placeholder for video */}
               {!playing ? (
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="relative z-10 w-20 h-20 bg-black rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer"
          onClick={() => setPlaying(true)}
        >
          <Play className="w-8 h-8 text-white ml-1" />
        </motion.div>
      ) : (
        <video
          className="w-full h-full rounded-xl"
          controls
          autoPlay
        >
          <source src="/5.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
                
                {/* Sample text overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-left">
                  <div className="inline-block px-3 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-white text-sm">
                    ▶ Watch: Introduction to Bouquet Design
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="relative z-10 pb-12 flex flex-wrap gap-8 justify-center text-gray-700 text-sm md:text-base"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>50+ Video Tutorials</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          <span>Expert Instructors</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
          <span>Certificate on Completion</span>
        </div>
      </motion.div>
    </section>
  );
}
