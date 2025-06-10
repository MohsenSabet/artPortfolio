import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useSpring, animate } from 'framer-motion';
import { bgSpeed } from '@/lib/bgSpeed';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// client-only 3D background
const NebulaBackground = dynamic(() => import('@/components/NebulaBackground'), { ssr: false });

export default function Home() {
   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(true);
   // memoize background to avoid re-mounts
   const background = useMemo(() => <NebulaBackground />, []);
   // mask grayscale level: 0.8 => 80%, 0 => 0%
   const maskLevel = useMotionValue(0.99);
   const maskFilter = useTransform(maskLevel, g => `grayscale(${g * 100}%)`);

   return (
     <div
       style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}
     >
      {background}

      {/* Centered Logo and Button */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 2
        }}
      >
        <Link href="/artworks" passHref>
          <motion.img
            src="/logo.svg"
            alt="Logo"
            draggable={false}
            style={{ width: 340, height: 340, marginBottom: '2.5rem', userSelect: 'none', cursor: 'pointer' }}
            animate={{
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            onMouseEnter={() => {
              animate(bgSpeed, 10, { duration: 0.6 });
              animate(maskLevel, 0, { duration: 0.9 });
            }}
            onMouseLeave={() => {
              animate(bgSpeed, 0.2, { duration: 0.5 });
              animate(maskLevel, 0.8, { duration: 0.5 });
            }}
          />
        </Link>
      </div>

       {/* grayscale overlay with color spotlight */}
       <motion.div
         style={{
           position: 'fixed', top: 0, left: 0,
           width: '100%', height: '100%',
           pointerEvents: 'none',
           backdropFilter: maskFilter,
           maskPosition: 'center',
           WebkitMaskPosition: 'center',
           maskRepeat: 'no-repeat',
           WebkitMaskRepeat: 'no-repeat',
           transition: 'mask-position 0.3s ease-out, -webkit-mask-position 0.3s ease-out',
        
         }}
       />
     </div>
   );
}
