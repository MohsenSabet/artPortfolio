import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, animate, AnimatePresence } from 'framer-motion';
import { bgSpeed } from '@/lib/bgSpeed';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import CombinedScene from '@/components/CombinedScene';
import Image from 'next/image';

export default function Home() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
   // Menu button variants and options
   const menuVariants = {
     open: {
       scale: 1.2,
       rotate: 10,
       transition: {
         scale: { type: 'spring', stiffness: 300, damping: 20 },
         rotate: { repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', duration: 1.5 }
       }
     },
     closed: {
       scale: 1,
       rotate: 0,
       transition: {
         scale: { type: 'spring', stiffness: 300, damping: 20 }
       }
     }
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
            border: '2px solid rgba(255, 255, 255, 0)'
          }}
          variants={menuVariants} initial="closed" whileHover="open"
          onHoverStart={() => animate(bgSpeed, 10, { duration: 0.6 })}
          onHoverEnd={() => animate(bgSpeed, 0.2, { duration: 0.5 })}
        >
          {/* Clickable menu trigger (transparent circle) */}
          <motion.div variants={{ open: {}, closed: {} }} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
            <Image src="/images/home/UFo1.png" alt="UFO1" width={260} height={260} style={{ pointerEvents: 'none' }} />
            <motion.div variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none' }} transition={{ duration: 0.3 }}>
              <Image src="/images/home/Ufo2.PNG" alt="UFO2" width={260} height={260} />
            </motion.div>
            <motion.div 
              variants={{
                open: {
                  opacity: 1,
                  filter: 'brightness(1.8) sepia(0.4) saturate(1.5)',
                  transition: { duration: 1, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
                },
                closed: {
                  opacity: 0,
                  filter: 'brightness(1.2) sepia(0.2) saturate(1.2)'
                }
              }}
              style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', filter: 'brightness(1.2) sepia(0.2) saturate(1.2)' }}
            >
              <Image src="/images/home/Ufo3.PNG" alt="UFO3" width={260} height={260} />
            </motion.div>
          </motion.div>
          {/* Three buttons around the globe on hover */}
          {options.map((option, idx) => {
            const angles = [-90, 30, 150];
            const angle = angles[idx % angles.length];
            const rad = angle * (Math.PI / 180);
            const radius = 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            return (
              <motion.div
                key={option.label}
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                  background: 'rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '50%',
                  width: 80, height: 80,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0)',
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
