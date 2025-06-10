import React from 'react';
import { motion } from 'framer-motion';

export const MotionDisplayWrapper = ({ className, style, transitionDelay, children }: MotionDivWrapProps) => {
  return (
    <motion.div
      initial={{ zoom: "0%", opacity: 0}} 
      animate={{ zoom: ["35%", "70%", "100%"], opacity: [0, 1]}}
      transition={{duration: '0.5', delay: transitionDelay || 0.5}}
      className={className}
      style={style}
    >
      { children }
    </motion.div>
  )
}

interface MotionDivWrapProps {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  transitionDelay?: number;
}
