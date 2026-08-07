"use client"

import { motion } from "framer-motion"

export function BackgroundVideo() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="h-full w-full object-cover [filter:hue-rotate(-10deg)_saturate(1.1)_brightness(0.5)] motion-reduce:opacity-0"
      >
        <source src="/videos/aurora.mp4" type="video/mp4" />
      </motion.video>

      {/* readability overlays */}
      <div className="absolute inset-0 bg-background/65" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(9,9,11,0.6)_70%,rgba(9,9,11,0.85)_100%)]" />
      <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/80 to-transparent" />

      {/* film grain */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}