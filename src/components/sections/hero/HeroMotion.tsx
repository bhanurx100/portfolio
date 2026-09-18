import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll, useReducedMotion } from 'motion/react';

interface HeroMotionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const HeroMotionWrapper: React.FC<HeroMotionWrapperProps> = ({
  children,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768 && !window.matchMedia('(pointer: coarse)').matches);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Mouse position normalized (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs with high damping for restrained, non-distracting physics
  const springConfig = { damping: 28, stiffness: 180, mass: 0.8 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Very subtle rotational & translation values (degrees and pixels)
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [2.5, -2.5]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-3.5, 3.5]);
  const translateX = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8]);
  const translateY = useTransform(smoothMouseY, [-0.5, 0.5], [-6, 6]);

  // Scroll dynamics: as user scrolls away from hero, scale subtly reduces and translates
  const { scrollY } = useScroll();

  const scrollScale = useTransform(scrollY, [0, 600], [1, 0.96]);
  const scrollOpacity = useTransform(scrollY, [0, 500, 850], [1, 0.95, 0.4]);
  const scrollTranslateY = useTransform(scrollY, [0, 600], [0, 35]);

  useEffect(() => {
    if (prefersReducedMotion || !isDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalize from -0.5 to 0.5
      mouseX.set((e.clientX / innerWidth) - 0.5);
      mouseY.set((e.clientY / innerHeight) - 0.5);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, prefersReducedMotion, isDesktop]);

  if (prefersReducedMotion || !isDesktop) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={containerRef}
      style={{
        scale: scrollScale,
        opacity: scrollOpacity,
        y: scrollTranslateY,
      }}
      className={`perspective-1000 ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          x: translateX,
          y: translateY,
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
