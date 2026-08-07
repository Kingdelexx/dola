'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { usePathname } from 'next/navigation';

export default function RocketCursor() {
  const pathname = usePathname();
  const cursorRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Disable on touch devices
    if (window.matchMedia("(hover: none)").matches) {
      return;
    }

    // High performance GSAP quickTo setters for x and y
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.6, ease: "elastic.out(1, 0.75)" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.6, ease: "elastic.out(1, 0.75)" });

    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;
    
    // To prevent jitter, we'll store the current rotation and smoothly interpolate it
    const rotationObj = { angle: 45 };

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      
      // Update position with an offset so the rocket is placed exactly at the cursor tip
      xTo(e.clientX);
      yTo(e.clientY);

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      
      // Update rotation only if moving fast enough to avoid jitter
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        // Rocket emoji naturally points at -45 deg (top-right). Add 45 to align with movement direction.
        let targetAngle = angle + 45;
        
        // Smooth out rotation flipping when crossing 180 degrees
        const currentAngle = rotationObj.angle;
        let diff = targetAngle - currentAngle;
        
        // Normalize difference to -180..180
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        
        targetAngle = currentAngle + diff;
        rotationObj.angle = targetAngle;
        
        if (rocketRef.current) {
            gsap.to(rocketRef.current, {
              rotation: targetAngle,
              duration: 0.3,
              ease: "power2.out"
            });
        }
      }

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible, mounted]);

  if (!mounted) {
    return null;
  }

  if (pathname?.startsWith('/stage')) {
    return null;
  }

  if (typeof window !== 'undefined' && window.matchMedia("(hover: none)").matches) {
    return null;
  }

  return (
    <div 
      ref={cursorRef} 
      // Offset by -ml-5 and -mt-5 to put the center of the 40x40 div at the cursor tip
      className="pointer-events-none fixed top-0 left-0 z-[9999] transition-opacity duration-500 w-10 h-10 -ml-5 -mt-5 flex items-center justify-center"
      style={{ 
        opacity: isVisible ? 1 : 0 
      }}
    >
      <div ref={rocketRef} className="relative text-4xl drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] filter">
        🚀
        {/* Animated flame tail */}
        <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-orange-500 rounded-full blur-[8px] animate-pulse opacity-80 mix-blend-screen -z-10" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full blur-[4px] animate-pulse opacity-90 mix-blend-screen -z-10" />
      </div>
    </div>
  );
}
