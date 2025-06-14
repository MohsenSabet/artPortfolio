import React, { useState, useEffect, useRef, useMemo, } from 'react';
import { motion, animate, AnimatePresence } from 'framer-motion';
import { bgSpeed } from '@/lib/bgSpeed';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import CombinedScene from '@/components/CombinedScene';
import Image from 'next/image';

export default function Home() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    // detect mobile viewport
    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

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
     closed: { opacity: 0, x: 0, y: 0 },
     open: custom => {
       // dynamic position based on index
       const angles = [-90, 30, 150];
       const angle = angles[custom % angles.length];
       const rad = angle * (Math.PI / 180);
       const radius = isMobile ? 120 : 180;
       return {
         opacity: 1,
         x: Math.cos(rad) * radius,
         y: Math.sin(rad) * radius,
         transition: { type: 'spring', stiffness: 300 }
       };
     }
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
         transform: isMobile ? 'translate(-50%, -50%)' : 'translate(-50%, -60%)',
         display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3
       }}>
         <motion.div
           style={{
            position: 'relative',
            width: isMobile ? 180 : 250,
            height: isMobile ? 180 : 250,
            borderRadius: '50%', overflow: 'visible',
             display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
             border: '2px solid rgba(255, 255, 255, 0)'
           }}
           variants={menuVariants}
           initial="closed"
           animate={menuOpen ? 'open' : 'closed'}
           onClick={isMobile ? () => setMenuOpen(prev => !prev) : undefined}
           onHoverStart={e => { animate(bgSpeed, 10, { duration: 0.6 }); if (!isMobile) setMenuOpen(true); }}
           onHoverEnd={e => { animate(bgSpeed, 0.2, { duration: 0.5 }); if (!isMobile) setMenuOpen(false); }}
         >
          {/* Clickable menu trigger (transparent circle) */}
          <motion.div
            variants={{ open: {}, closed: {} }}
            transformTemplate={(transformProps, transform) => `translate(-50%, -50%) ${transform}`}
            style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 1 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          >
            <motion.div variants={{ open: { opacity: 0 }, closed: { opacity: 1 } }} transition={{ duration: 0.3 }} style={{ pointerEvents: 'none' }}>
              <Image priority src="/images/home/UFo1.png" alt="UFO1" width={260} height={260} />
            </motion.div>
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
           {options.map((option, idx) => (
             <motion.div
               key={option.label}
               custom={idx}
               variants={itemVariants}
               transformTemplate={(transformProps, transform) => `translate(-50%, -50%) ${transform}`}
               style={{
                 position: 'absolute', top: '50%', left: '50%',
                 background: 'rgba(255, 255, 255, 0.22)',
                 backdropFilter: 'blur(10px)',
                 WebkitBackdropFilter: 'blur(10px)',
                 border: '1px solid rgba(255, 255, 255, 0.12)',
                 borderRadius: '50%', width: 80, height: 80,
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 boxShadow: '0 8px 16px rgba(0, 0, 0, 0)', cursor: 'pointer'
               }}
               whileHover={{ scale: 1.2, background: 'rgba(255, 255, 255, 0.35)', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' }}
             >
               <Link href={option.href} style={{ color: '#000', textDecoration: 'none', fontSize: isMobile? '0.8rem':'1rem' }}>
                 {option.label}
               </Link>
             </motion.div>
           ))}
         </motion.div>
       </div>
     </div>
   );
}
