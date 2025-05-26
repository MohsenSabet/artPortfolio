import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import dynamic from 'next/dynamic';

// client-only 3D background
const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false });

export default function Home() {
  // raw wheel-driven progress [0,1]
  const progress = useMotionValue(0);
  // apply spring smoothing for graceful motion
  const smooth = useSpring(progress, { stiffness: 60, damping: 25 });

  // welcome animation: stays until 30%, then fades out by 60%
  const welcomeOpacity = useTransform(smooth, [0, 0.3, 0.6], [1, 1, 0]);
  const welcomeY = useTransform(smooth, [0, 0.6], [0, -120]);
  const welcomeScale = useTransform(smooth, [0, 0.6], [1, 0.85]);

  // profile section: 40%–60%
  const profileOpacity = useTransform(smooth, [0.4, 0.6], [0, 1]);
  const profileY = useTransform(smooth, [0.4, 0.6], [80, 0]);

  // name section: 50%–70%
  const nameOpacity = useTransform(smooth, [0.5, 0.7], [0, 1]);
  const nameX = useTransform(smooth, [0.5, 0.7], [120, 0]);

  // bio section: 60%–80%
  const bioOpacity = useTransform(smooth, [0.6, 0.8], [0, 1]);
  const bioY = useTransform(smooth, [0.6, 0.8], [80, 0]);

  // social links: 80%–95%
  const socialOpacity = useTransform(smooth, [0.8, 0.95], [0, 1]);
  const socialY = useTransform(smooth, [0.8, 0.95], [80, 0]);

  // button: 95%–100%
  const buttonOpacity = useTransform(smooth, [0.95, 1], [0, 1]);
  const buttonY = useTransform(smooth, [0.95, 1], [80, 0]);

  // wheel handler: smoother, slower progression per tick
  const containerRef = useRef(null);
  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * 0.0006; // finer control
    progress.set(Math.min(Math.max(progress.get() + delta, 0), 1));
  };

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
          opacity: welcomeOpacity,
          y: welcomeY,
          scale: welcomeScale,
          zIndex: 2,
          textAlign: 'center'
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ fontSize: '3rem', color: '#fafafa' }}
        >
          Welcome to My Portfolio
        </motion.h1>
      </motion.div>

      {/* Profile picture */}
      <motion.img
        src="/profile.jpg"
        alt="Profile"
        style={{
          position: 'absolute', top: '20%', left: '10%',
          width: 100, height: 100, borderRadius: '50%',
          opacity: profileOpacity,
          y: profileY,
          zIndex: 2
        }}
      />

      {/* Name */}
      <motion.h2
        style={{
          position: 'absolute', top: '20%', left: '25%',
          fontSize: '2rem', color: '#fafafa',
          opacity: nameOpacity,
          x: nameX,
          zIndex: 2
        }}
      >
        Mohsen Sabet
      </motion.h2>

      {/* Bio */}
      <motion.p
        style={{
          position: 'absolute', top: '30%', left: '10%',
          maxWidth: '40%', color: '#fafafa', fontSize: '1.2rem',
          opacity: bioOpacity,
          y: bioY,
          zIndex: 2
        }}
      >
        I am a digital media artist and developer specializing in immersive visuals and interactive experiences.
      </motion.p>

      {/* Social Links */}
      <motion.div
        style={{
          position: 'absolute', top: '50%', left: '10%',
          display: 'flex', gap: '1rem',
          opacity: socialOpacity,
          y: socialY,
          zIndex: 2
        }}
      >
        <a href="https://twitter.com/your">Twitter</a>
        <a href="https://github.com/your">GitHub</a>
        <a href="https://linkedin.com/in/your">LinkedIn</a>
      </motion.div>

      {/* Visit Artworks Button */}
      <motion.div
        style={{
          position: 'absolute', bottom: '10%', left: '50%', x: '-50%',
          opacity: buttonOpacity,
          y: buttonY,
          zIndex: 2
        }}
      >
        <button
          onClick={() => window.location.href = '/artworks'}
          style={{ padding: '1rem 2rem', fontSize: '1rem', cursor: 'pointer' }}
        >
          View My Artworks
        </button>
      </motion.div>

    </div>
  );
}
