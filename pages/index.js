import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
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

   // Scroll-driven animation hooks
   const progress = useMotionValue(0);
   const smooth = useSpring(progress, { stiffness: 60, damping: 25 });

   const welcomeOpacity = useTransform(smooth, [0, 0.3, 0.6], [1, 1, 0]);
   const welcomeY = useTransform(smooth, [0, 0.6], [0, -120]);
   const welcomeScale = useTransform(smooth, [0, 0.6], [1, 0.85]);

   const profileOpacity = useTransform(smooth, [0.4, 0.6], [0, 1]);
   const profileY = useTransform(smooth, [0.4, 0.6], [80, 0]);

   const contentOpacity = useTransform(smooth, [0.5, 0.7], [0, 1]);
   const contentY = useTransform(smooth, [0.5, 0.7], [80, 0]);

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
       style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}
     >
       <ThreeBackground />

       {/* Welcome */}
       <motion.div
         style={{
           position: 'absolute', top: '40%', left: '50%', x: '-50%',
           opacity: welcomeOpacity, y: welcomeY, scale: welcomeScale,
           zIndex: 2, textAlign: 'center'
         }}
       >
         <motion.h1
           className={homeStyles.rippleText}
           initial={{ opacity: 0, y: 60, scale: 0.85 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           transition={{ delay: 0.2, duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
           style={{ fontFamily: 'Great Vibes', fontSize: '4rem', textAlign: 'center', padding: '0 1rem' }}
         >
           Welcome to My Portfolio
         </motion.h1>
       </motion.div>

       {/* Profile & Social Section */}
       <div style={{ position: 'absolute', top: '20%', left: '10%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
         <motion.div style={{ opacity: imageOpacity, y: imageY, zIndex: 2 }}>
           <img
             src={profile.avatar_url}
             alt="Profile"
             style={{ width: 350, height: 400, objectFit: 'cover', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
           />
         </motion.div>
         <motion.div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', opacity: socialOpacity, y: socialY, zIndex: 2 }}>
           {profile.twitter && <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className={styles.socialMediaIcon}><FaTwitter size={30} /></a>}
           {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialMediaIcon}><FaLinkedin size={30} /></a>}
           {profile.instagram && <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialMediaIcon}><FaInstagram size={30} /></a>}
         </motion.div>
       </div>

       {/* Name & Bio */}
       <div style={{ position: 'absolute', top: '20%', right: '20%', maxWidth: '40%' }}>
         <motion.h2 style={{
             fontFamily: 'Great Vibes, cursive',
             fontSize: '2.2rem',
             margin: 0,
             background: 'linear-gradient(90deg, #6ec1ff, #ff9ce6)',
             backgroundClip: 'text',
             WebkitBackgroundClip: 'text',
             color: 'transparent',
             opacity: nameOpacity,
             y: nameY,
             zIndex: 2
         }}>
           {profile.first_name} {profile.last_name}
         </motion.h2>
         <motion.p style={{ color: '#fafafa', fontSize: '1.1rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap', opacity: bioOpacity, y: bioY, zIndex: 2 }}>
           {profile.bio}
         </motion.p>
       </div>

       {/* View Artworks Button */}
       <motion.div
         style={{
           position: 'absolute', bottom: '10%', left: '50%', x: '-50%',
           opacity: buttonOpacity, y: buttonY, zIndex: 2
         }}
       >
         <motion.a
           onClick={() => (window.location.href = '/artworks')}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1, duration: 1 }}
           whileHover={{ scale: 1.05, textShadow: '0 0 12px rgba(250,250,250,0.8)' }}
           whileTap={{ scale: 0.95 }}
           style={{
             background: 'none',
             border: 'none',
             padding: 0,
             color: '#fafafa',
             fontSize: '2rem',
             cursor: 'pointer',
             textDecoration: 'none',
             letterSpacing: '1px'
           }}
         >
           View My Artworks
         </motion.a>
       </motion.div>
     </div>
   );
}
