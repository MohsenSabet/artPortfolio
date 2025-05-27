import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Cloud, OrbitControls, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Dynamic gradient nebula background
function NebulaGradient() {
  const mesh = useRef();
  const colors = [
    new THREE.Color('#ff9ce6'),
    new THREE.Color('#6ec1ff'),
    new THREE.Color('#8a2be2'),
    new THREE.Color('#3cb371')
  ];
  let elapsed = 0;
  let idx = 0;
  let nextIdx = 1;
  const duration = 15;
  useFrame((state, delta) => {
    elapsed += delta;
    const t = (elapsed % duration) / duration;
    const curr = colors[idx];
    const next = colors[nextIdx];
    mesh.current.material.color.copy(curr.clone().lerp(next, t));
    if (t >= 1) {
      idx = (idx + 1) % colors.length;
      nextIdx = (idx + 1) % colors.length;
      elapsed = 0;
    }
  });
  return (
    <mesh ref={mesh} position={[0, 0, -15]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial side={THREE.BackSide} />
    </mesh>
  );
}

// Animated nebula cloud layers
function NebulaClouds() {
  const ref = useRef();
  const speeds = useRef({
    x: Math.random() * 0.02 - 0.01,
    y: Math.random() * 0.02 - 0.01,
    z: Math.random() * 0.02 - 0.01,
  });
  useFrame((state, delta) => {
    ref.current.rotation.x += delta * speeds.current.x;
    ref.current.rotation.y += delta * speeds.current.y;
    ref.current.rotation.z += delta * speeds.current.z;
  });
  return (
    <group ref={ref}>
      <Cloud position={[0, 0, 0]} opacity={0.6} speed={0.3} width={30} depth={1.5} segments={50} color="#ff9ce6" />
      <Cloud position={[0, 0, 0]} opacity={0.4} speed={0.2} width={25} depth={1.5} segments={50} color="#6ec1ff" />
      <Cloud position={[0, 0, 0]} opacity={0.3} speed={0.4} width={20} depth={1} segments={60} color="#8a2be2" />
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
      <Stars radius={100} depth={60} count={2000} factor={2} saturation={0} fade speed={0.2} />
      <Stars radius={150} depth={80} count={1000} factor={4} saturation={0} fade speed={0.05} />
      <Sparkles count={400} scale={[150, 80, 150]} size={2} speed={0.6} noise={0.5} color="#ffffdd" opacity={0.8} />
      <Sparkles count={200} scale={[100, 60, 100]} size={1} speed={0.3} noise={0.2} color="#ffddff" opacity={0.6} />
    </group>
  );
}

// Distant depth starfield
function DepthStars() {
  const ref = useRef();
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = 8000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 80 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - 20;
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);
  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial size={0.5} color="#666666" sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function ThreeBackground() {
  return (
    <Canvas
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}
      camera={{ position: [0, 0, 5], fov: 75 }}
    >
      {/* dynamic gradient background */}
      <NebulaGradient />
      {/* distant depth starfield */}
      <DepthStars />
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
