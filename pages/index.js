import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import { FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

// client-only 3D background
const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false });

export default function Home() {
  const router = useRouter();
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

  const containerRef = useRef(null);
  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * 0.0006;
    progress.set(Math.min(Math.max(progress.get() + delta, 0), 1));
  };

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const userId = session.user.id;
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, email: session.user.email }, { onConflict: 'id' })
        .select('*')
        .single();
      if (!error) setProfile(data);
      setLoading(false);
    };
    loadProfile();
  }, [router]);

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>No profile available.</div>;

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
          position: 'absolute', top: '50%', left: '50%', x: '-50%', y: '-50%',
          opacity: welcomeOpacity, y: welcomeY, scale: welcomeScale,
          zIndex: 2, textAlign: 'center'
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ fontSize: '3rem', color: '#fafafa' }}
        >
          Welcome to My Portfolio
        </motion.h1>
      </motion.div>

      {/* Profile & Social Section */}
      <motion.div
        style={{
          position: 'absolute', top: '20%', left: '10%',
          opacity: profileOpacity, y: profileY,
          zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}
      >
        <img
          src={profile.avatar_url || '/profile.jpg'}
          alt="Profile"
          style={{
            width: 250, height: 300, objectFit: 'cover',
            borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        />
        <motion.div
          style={{
            display: 'flex', gap: '1rem', marginTop: '1rem',
            opacity: contentOpacity, y: contentY
          }}
        >
          {profile.twitter && (
            <a href={profile.twitter} target="_blank" rel="noopener noreferrer">
              <FaTwitter size={28} color="#fafafa" />
            </a>
          )}
          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              <FaLinkedin size={28} color="#fafafa" />
            </a>
          )}
          {profile.instagram && (
            <a href={profile.instagram} target="_blank" rel="noopener noreferrer">
              <FaInstagram size={28} color="#fafafa" />
            </a>
          )}
        </motion.div>
      </motion.div>

      {/* Name & Bio */}
      <motion.div
        style={{
          position: 'absolute', top: '20%', right: '10%',
          opacity: contentOpacity, y: contentY,
          zIndex: 2, maxWidth: '40%'
        }}
      >
        <h2 style={{ color: '#fafafa', fontSize: '2.2rem', margin: 0 }}>
          {profile.first_name} {profile.last_name}
        </h2>
        <p style={{ color: '#fafafa', fontSize: '1.1rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
          {profile.bio}
        </p>
      </motion.div>

      {/* View Artworks Button */}
      <motion.div
        style={{
          position: 'absolute', bottom: '10%', left: '50%', x: '-50%',
          opacity: buttonOpacity, y: buttonY, zIndex: 2
        }}
      >
        <button
          onClick={() => (window.location.href = '/artworks')}
          style={{ padding: '1rem 2rem', fontSize: '1rem', cursor: 'pointer', borderRadius: '8px' }}
        >
          View My Artworks
        </button>
      </motion.div>
    </div>
  );
}
