// GlassButton component: CSS version
import React from 'react';
import { motion } from 'framer-motion';

export default function GlassButton() {
  return (
    <motion.div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'transparent',
        backdropFilter: 'blur(12px) saturate(180%)',  // stronger glass blur
        border: '1px solid rgba(255, 255, 255, 0.2)',  // softer edge
        boxShadow: '0 0 30px rgba(255,255,255,0.3)',  // larger, gentler glow
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative'
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
    </motion.div>
  );
}