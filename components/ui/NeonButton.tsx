import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface NeonButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ 
  children, 
  variant = 'primary', 
  loading = false,
  size = 'md',
  className = '',
  ...props 
}) => {
  
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const variants = {
    primary: "bg-premium-gradient text-white shadow-lg shadow-primary/25 border-transparent hover:shadow-primary/40",
    secondary: "bg-white dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/20",
    outline: "bg-transparent border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:text-primary dark:hover:text-white",
    ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={loading || props.disabled}
      className={`
        relative rounded-xl font-medium tracking-wide transition-all duration-300 
        flex items-center justify-center gap-2 overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeStyles[size]}
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {/* Loading State Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-inherit flex items-center justify-center z-10">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {/* Content */}
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>
    </motion.button>
  );
};