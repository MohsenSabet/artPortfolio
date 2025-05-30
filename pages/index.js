import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useSpring, animate } from 'framer-motion';
import { bgSpeed } from '@/lib/bgSpeed';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import { FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import homeStyles from '@/styles/Home.module.css';
import styles from '@/styles/SocialMediaHover.module.css';

// client-only 3D background
const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false });

export default function Home() {
   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(true);
   // memoize background to avoid re-mounts
   const background = useMemo(() => <ThreeBackground />, []);
   // mask grayscale level: 0.8 => 80%, 0 => 0%
   const maskLevel = useMotionValue(0.99);
   const maskFilter = useTransform(maskLevel, g => `grayscale(${g * 100}%)`);

   // Scroll-driven animation hooks
   const progress = useMotionValue(0);
   const smooth = useSpring(progress, { stiffness: 60, damping: 25 });

   const buttonOpacity = useTransform(smooth, [0.95, 1], [0, 1]);
   const buttonY = useTransform(smooth, [0.95, 1], [80, 0]);

   // Staggered scroll-driven transforms for separate elements
   const imageOpacity = useTransform(smooth, [0.4, 0.6], [0, 1]);
   const imageY = useTransform(smooth, [0.4, 0.6], [80, 0]);
   const socialOpacity = useTransform(smooth, [0.5, 0.7], [0, 1]);
   const socialY = useTransform(smooth, [0.5, 0.7], [80, 0]);
   const nameOpacity = useTransform(smooth, [0.55, 0.75], [0, 1]);
   const nameY = useTransform(smooth, [0.55, 0.75], [80, 0]);
   const bioOpacity = useTransform(smooth, [0.6, 0.8], [0, 1]);
   const bioY = useTransform(smooth, [0.6, 0.8], [80, 0]);

   const containerRef = useRef(null);
   const onWheel = (e) => {
     e.preventDefault();
     const delta = e.deltaY * 0.0006;
     progress.set(Math.min(Math.max(progress.get() + delta, 0), 1));
   };
  
   // Mouse-driven spotlight with framer-motion spring smoothing
   const mouseX = useMotionValue(0);
   const mouseY = useMotionValue(0);
   // set initial center position on client only
   useEffect(() => {
     if (typeof window !== 'undefined') {
       mouseX.set(window.innerWidth / 2);
       mouseY.set(window.innerHeight / 2);
     }
   }, []);
   const smoothX = useSpring(mouseX, { stiffness: 50, damping: 15 });
   const smoothY = useSpring(mouseY, { stiffness: 50, damping: 15 });
   const maskStyle = useTransform([smoothX, smoothY], ([x, y]) =>
     `radial-gradient(circle 200px at ${x}px ${y}px, transparent 0%, transparent 140px, rgba(0,0,0,0.5) 200px, black 260px)`
   );
   const onMouseMove = (e) => {
     mouseX.set(e.clientX);
     mouseY.set(e.clientY);
   };

   // Load profile
   useEffect(() => {
     async function loadProfile() {
       const { data: profiles, error } = await supabase
         .from('profiles')
         .select('*');
       if (!error && profiles.length > 0) {
         setProfile(profiles[0]);
       }
       setLoading(false);
     }
     loadProfile();
   }, []);

   if (loading) return <div>Loading...</div>;
   if (!profile) return <div>Profile not found.</div>;

   return (
     <div
       ref={containerRef}
       onWheel={onWheel}
       onMouseMove={onMouseMove}
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
        <img
          src="/logo.svg"
          alt="Logo"
          style={{ width: 340, height: 340, marginBottom: '2.5rem', userSelect: 'none' }}
          draggable={false}
        />
        <a
          onMouseEnter={() => {
            animate(bgSpeed, 20, { duration: 0.6 });
            animate(maskLevel, 0, { duration: 0.9 });
          }}
          onMouseLeave={() => {
            animate(bgSpeed, 1, { duration: 0.5 });
            animate(maskLevel, 0.8, { duration: 0.5 });
          }}
          href="/artworks"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: '#fafafa',
            fontSize: '2rem',
            cursor: 'pointer',
            textDecoration: 'none',
            letterSpacing: '1px',
            marginTop: 0
          }}
        >
          View My Artworks
        </a>
      </div>

       {/* grayscale overlay with color spotlight */}
       <motion.div
         style={{
           position: 'fixed', top: 0, left: 0,
           width: '100%', height: '100%',
           pointerEvents: 'none',
           backdropFilter: maskFilter,
           maskImage: maskStyle,
           WebkitMaskImage: maskStyle,
           maskPosition: 'center',
           WebkitMaskPosition: 'center',
           maskRepeat: 'no-repeat',
           WebkitMaskRepeat: 'no-repeat',
           transition: 'mask-position 0.3s ease-out, -webkit-mask-position 0.3s ease-out'
         }}
       />
     </div>
   );
}
