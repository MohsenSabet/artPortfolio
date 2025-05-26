import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Cloud, OrbitControls, Stars, Sparkles } from '@react-three/drei';

// Animated nebula cloud layers
function NebulaClouds() {
  const ref = useRef();
  useFrame((state, delta) => { ref.current.rotation.z += delta * 0.01; });
  return (
    <group ref={ref}>
      <Cloud position={[0, 0, 0]} opacity={0.6} speed={0.3} width={30} depth={1.5} segments={50} color="#ff9ce6" />
      <Cloud position={[0, 0, 0]} opacity={0.4} speed={0.2} width={25} depth={1.5} segments={50} color="#6ec1ff" />
    </group>
  );
}

// Rotating, twinkling stars layer
function TwinklingStars() {
  const ref = useRef();
  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.02;
  });
  return (
    <group ref={ref}>
      <Stars radius={120} depth={80} count={4000} factor={4} saturation={0} fade speed={0.1} />
      <Sparkles count={300} scale={[120, 80, 120]} size={1.5} speed={0.5} noise={0.4} color="#ffffff" opacity={0.7} />
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <Canvas
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}
      camera={{ position: [0, 0, 5], fov: 75 }}
    >
      {/* soft pastel background and fog */}
      <color attach="background" args={["#0d0d2b"]} />
      <fog attach="fog" args={["#0d0d2b", 2, 10]} />
      {/* soft lighting */}
      <ambientLight intensity={0.4} />
      <hemisphereLight skyColor="#ffbdf4" groundColor="#080820" intensity={0.6} />
      {/* dreamy stars */}
      <TwinklingStars />
      {/* animated nebula background */}
      <NebulaClouds />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
