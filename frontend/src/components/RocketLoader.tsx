"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Sparkles, Rocket } from 'lucide-react';

interface RocketLoaderProps {
  isLoading: boolean;
  title?: string;
  subTitle?: string;
}

export default function RocketLoader({
  isLoading,
  title = "Preparing for Launch...",
  subTitle = "Securing your coding journey..."
}: RocketLoaderProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const flameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading || !mounted) return;

    const ctx = gsap.context(() => {
      // Rocket rumble & hovering animation
      gsap.to(rocketRef.current, {
        y: -20,
        rotation: 3,
        duration: 0.7,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });

      // Shaking vibration effect for liftoff power
      gsap.to(rocketRef.current, {
        x: 3,
        duration: 0.07,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Pulsing flame animation
      gsap.to(flameRef.current, {
        scaleY: 1.4,
        scaleX: 0.85,
        opacity: 0.95,
        duration: 0.12,
        repeat: -1,
        yoyo: true,
        ease: "rough"
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isLoading, mounted]);

  if (!isLoading || !mounted) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm transition-all duration-300 animate-fadeIn pointer-events-auto"
    >
      {/* Pure Rocket Graphic */}
      <div className="relative flex flex-col items-center justify-center p-4 text-center">
        <div ref={rocketRef} className="relative z-10 flex flex-col items-center">
          {/* Rocket Icon / Body */}
          <div className="relative bg-gradient-to-tr from-sky-400 via-indigo-500 to-pink-500 p-6 rounded-full shadow-[0_0_40px_rgba(56,189,248,0.8)] border-4 border-white/80">
            <Rocket className="w-16 h-16 text-white -rotate-45 transform drop-shadow-lg" />
            <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-yellow-300 animate-spin" />
          </div>

          {/* Thruster Flames */}
          <div
            ref={flameRef}
            className="relative -mt-2 flex flex-col items-center origin-top"
          >
            {/* Core Flame */}
            <div className="w-8 h-16 bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600 rounded-b-full blur-[2px] shadow-[0_0_30px_rgba(239,68,68,1)]" />
            {/* Flame Glow Outer */}
            <div className="absolute -top-1 w-12 h-18 bg-orange-400/60 rounded-b-full blur-md -z-10" />
          </div>
        </div>

        {/* Exhaust Smoke Clouds */}
        <div className="relative -mt-4 flex items-center justify-center gap-1 opacity-80 z-0">
          <div className="w-10 h-10 bg-white/40 rounded-full blur-md animate-ping" />
          <div className="w-14 h-12 bg-sky-200/50 rounded-full blur-lg animate-pulse" />
          <div className="w-10 h-10 bg-white/40 rounded-full blur-md animate-ping" />
        </div>

        {/* Loading Text */}
        <div className="mt-8 space-y-2 relative z-10">
          <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            {title}
          </h3>
          <p className="text-sky-100 text-base font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {subTitle}
          </p>
        </div>
      </div>
    </div>
  );
}
