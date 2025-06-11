import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { NebulaMesh } from './NebulaBackground';

function ReflectiveGlobe() {
  const meshRef = useRef();
  const { gl, scene } = useThree();
  const cubeRenderTarget = useRef(new THREE.WebGLCubeRenderTarget(256, { format: THREE.RGBAFormat }));
  const cubeCamera = useRef(new THREE.CubeCamera(0.1, 1000, cubeRenderTarget.current));

  // Procedural noise bump map
  const bumpMap = useMemo(() => {
    const size = 128;
    const data = new Uint8Array(size * size);
    for (let i = 0; i < size * size; i++) data[i] = Math.random() * 255;
    const tex = new THREE.DataTexture(data, size, size, THREE.LuminanceFormat);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useLayoutEffect(() => {
    scene.add(cubeCamera.current);
    const mat = meshRef.current.material;
    mat.envMap = cubeRenderTarget.current.texture;
    mat.needsUpdate = true;
  }, [scene]);

  useFrame(() => {
    if (cubeCamera.current) {
      cubeCamera.current.position.copy(meshRef.current.position);
      cubeCamera.current.update(gl, scene);
    }
    meshRef.current.rotation.y += 0.004;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhongMaterial
        color={0xffffff}
        shininess={200}
        specular={0xffffff}
        reflectivity={1}
        bumpMap={bumpMap}
        bumpScale={0.02}
      />
    </mesh>
  );
}

export default function CombinedScene() {
  return (
    <Canvas
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%', zIndex: -1,
        pointerEvents: 'none'
      }}
      camera={{ position: [0, 0, 3], fov: 75 }}
      gl={{ antialias: true }}
    >
      {/* Sphere with dynamic reflections */}
      <ReflectiveGlobe />
      {/* Nebula background behind globe */}
      <group position={[0, 0, -2]}>  {/* push nebula behind */}
        <NebulaMesh />
      </group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
    </Canvas>
  );
}
