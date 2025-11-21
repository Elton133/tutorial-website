"use client";

import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverScale?: boolean;
}

export default function Card({ 
  children, 
  className = "", 
  onClick,
  hoverScale = true 
}: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverScale ? { scale: 1.02, y: -4 } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`
        bg-white rounded-2xl shadow-sm 
        hover:shadow-xl hover:shadow-blue-100/50
        transition-shadow cursor-pointer overflow-hidden
        border border-gray-100/50
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
