import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Cloud, OrbitControls, Stars } from '@react-three/drei';

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

export default function ThreeBackground() {
  return (
    <Canvas
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      camera={{ position: [0, 0, 5], fov: 75 }}
    >
      {/* soft pastel background and fog */}
      <color attach="background" args={["#0d0d2b"]} />
      <fog attach="fog" args={["#0d0d2b", 2, 10]} />
      {/* soft lighting */}
      <ambientLight intensity={0.4} />
      <hemisphereLight skyColor="#ffbdf4" groundColor="#080820" intensity={0.6} />
      {/* dreamy stars */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.3} />
      {/* animated nebula background */}
      <NebulaClouds />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
