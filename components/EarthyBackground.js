"use client";

import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Vertex shader for full-screen quad (same as TunnelBackground)
const vertSrc = /* glsl */`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Fragment shader implementing the ray-marched tunnel with earthy/golden hues
const fragSrc = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;

  // Gyroid distance-field helper
  float g(vec4 p, float s) {
    return abs(dot(sin(p *= s), cos(p.zxwy)) - 1.0) / s;
  }

  // Custom tanh for floats
  float tanh_f(float x) {
    float e2x = exp(2.0 * x);
    return (e2x - 1.0) / (e2x + 1.0);
  }

  void main() {
    vec2 C = gl_FragCoord.xy;
    float T = uTime;
    vec4 o = vec4(0.0), q;
    float d = 0.0, z = 0.0;
    vec4 U = vec4(2.0, 1.0, 0.0, 3.0);

    vec2 uv = (C - 0.5 * uResolution) / min(uResolution.x, uResolution.y);

    // Raymarch loop
    for (float i = 0.0; i < 79.0; i++) {
      z += d + 5e-4;
      q = vec4(normalize(vec3(uv, 2.0)) * z, 0.2);
      q.z += T / 30.0;
      float s = q.y + 0.1;
      q.y = abs(s);
      vec4 p = q;
      p.y -= 0.11;
      p.xy *= mat2(cos(11.0 * U.zywz - 2.0 * p.z));
      p.y -= 0.2;
      d = abs(g(p, 8.0) - g(p, 24.0)) / 4.0;
      // earthy/golden color palette
      vec4 col = vec4(0.9, 0.7, 0.3, 1.0) + 1.2 * cos(vec4(0.9, 0.7, 0.3, 0.0) + 4.0 * q.z);
      o += (s > 0.0 ? 1.0 : 0.1) * col.w * col / max(s > 0.0 ? d : d * d * d, 5e-4);
    }

    // subtle wisp in gold tone
    vec2 wispPos = 1.2 * vec2(cos(T * 0.5), sin(T * 0.6));
    float wispDist = length(q.xy - wispPos);
    vec3 wispColor = vec3(1.0, 0.85, 0.5);
    o.xyz += (1.5 + sin(T * 1.5)) * 600.0 * wispColor / (wispDist + 0.3);

    // Tone mapping
    vec3 c3 = o.xyz / 1e5;
    c3.r = tanh_f(c3.r);
    c3.g = tanh_f(c3.g);
    c3.b = tanh_f(c3.b);
    gl_FragColor = vec4(c3, 1.0);
  }
`;

function EarthyBackgroundMesh() {
  const material = useRef();
  const { size, invalidate, camera } = useThree();

  useLayoutEffect(() => {
    if (!material.current) return;
    material.current.uniforms.uResolution.value.set(size.width, size.height);
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    invalidate();
  }, [size, camera, invalidate]);

  useFrame(({ clock }) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertSrc}
        fragmentShader={fragSrc}
        uniforms={{
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(size.width, size.height) }
        }}
      />
    </mesh>
  );
}

// Standalone canvas with earthy tunnel background
export default function EarthyBackground() {
  return (
    <Canvas
      frameloop="always"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}
      onCreated={({ gl }) => { gl.domElement.style.touchAction = 'none'; }}
      gl={{ antialias: true }}
      camera={{ position: [0, 0, 1], fov: 75 }}
    >
      <EarthyBackgroundMesh />
    </Canvas>
  );
}
