"use client";

import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// vertex shader
const vertexShader = /* glsl */`
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

// fragment shader implementing "Sunset" by @XorDev
const fragmentShader = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;

  // "Sunset" shader based on XorDev
  void mainImage(out vec4 O, vec2 I)
  {
      float t = uTime;
      float i;
      float z;
      float d;
      float s;
      
      for(O = vec4(0.0); i++ < 100.0; )
      {
          vec3 p = z * normalize(vec3(I + I, 0.0) - uResolution.xyy);
          for(d = 5.0; d < 200.0; d += d)
              p += 0.6 * sin(p.yzx * d - 0.2 * t) / d;
          z += d = 0.005 + max(s = 0.3 - abs(p.y), -s * 0.2) / 4.0;
          O += (cos(s / 0.07 + p.x + 0.5 * t - vec4(3.0,4.0,5.0,0.0)) + 1.5) * exp(s / 0.1) / d;
      }
      O = tanh(O * O / 4e8);
  }

  void main() {
    vec4 color;
    mainImage(color, gl_FragCoord.xy);
    color.rgb *= 0.6; // darken colors
    gl_FragColor = color;
  }
`;

function ShaderMesh() {
  const materialRef = useRef();
  const { size, invalidate, camera } = useThree();

  useLayoutEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    invalidate();
  }, [size, camera, invalidate]);

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(size.width, size.height) }
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

export default function SunsetBackground() {
  return (
    <Canvas
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}
      frameloop="always"
      onCreated={({ gl }) => { gl.domElement.style.touchAction = 'none'; }}
      gl={{ antialias: true }}
      camera={{ position: [0, 0, 1], fov: 75 }}
    >
      <ShaderMesh />
    </Canvas>
  );
}
