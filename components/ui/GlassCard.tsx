import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  delay = 0,
  hoverEffect = false 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} // Custom easing for premium feel
      whileHover={hoverEffect ? { y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)" } : undefined}
      className={`
        relative overflow-hidden
        rounded-2xl 
        bg-white/70 dark:bg-dark-900/60 
        backdrop-blur-xl 
        border border-white/20 dark:border-white/10 
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]
        transition-all duration-300
        ${className}
      `}
    >
      {/* Inner subtle noise or gradient overlay if desired, keeping it clean for now */}
      {children}
    </motion.div>
  );
};