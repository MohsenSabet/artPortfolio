import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, animate, AnimatePresence } from 'framer-motion';
import { bgSpeed } from '@/lib/bgSpeed';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import CombinedScene from '@/components/CombinedScene';

export default function Home() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
   // Menu button variants and options
   const menuVariants = {
     open: { scale: 1.2, transition: { type: 'spring', stiffness: 300, damping: 20 } },
     closed: { scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
   };
   const itemVariants = {
     open: { opacity: 1 },
     closed: { opacity: 0 }
   };
   const options = [
     { label: 'Artworks', href: '/artworks' },
     { label: 'About', href: '/about' },
     { label: 'Portfolio', href: '/portfolio' }
   ];

    return (
      <div
        style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}
      >
       {/* Combined nebula + reflective globe rendered via Three Fiber */}
       <CombinedScene />

      {/* Centered Menu Button */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -60%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3
      }}>
        <motion.div
          style={{
            position: 'relative', width: 250, height: 250, borderRadius: '50%', overflow: 'visible',
            display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
            boxShadow: '0 0 30px rgba(255,255,255,0.3)'
          }}
          variants={menuVariants} initial="closed" whileHover="open"
          onHoverStart={() => animate(bgSpeed, 10, { duration: 0.6 })}
          onHoverEnd={() => animate(bgSpeed, 0.2, { duration: 0.5 })}
        >
          {/* Clickable menu trigger (transparent circle) */}
          {/* Three buttons around the globe on hover */}
          {options.map((option, idx) => {
            const angles = [-90, 30, 150];
            const angle = angles[idx % angles.length];
            const rad = angle * (Math.PI / 180);
            const radius = 125;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            return (
              <motion.div
                key={option.label}
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                  background: '#fff', borderRadius: '4px', padding: '8px 12px',
                  cursor: 'pointer'
                }}
                variants={itemVariants}
              >
                <Link href={option.href} style={{ color: '#000', textDecoration: 'none' }}>
                  {option.label}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
     </div>
   );
}
