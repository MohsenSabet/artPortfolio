"use client";

import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Vertex shader for full-screen quad
const vertSrc = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Fragment shader using custom colormap and fBM pattern
const fragSrc = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;

// Custom tanh for vec4
vec4 tanh4(vec4 x) {
  vec4 e2x = exp(x * 2.0);
  return (e2x - 1.0) / (e2x + 1.0);
}

// Distance field for gyroid
float g(vec4 p,float s){return abs(dot(sin(p*=s),cos(p.zxwy))-1.)/s;}

void main(){
  vec2 C = gl_FragCoord.xy;
  float T = uTime;
  vec4 o = vec4(0.), q, p, U = vec4(2.,1.,0.,3.);
  float d = 0., z = 0., s = 0.;
  vec2 r = uResolution.xy;
  for(float i = 0.; i < 79.; i += 1.0) {
    z += d + 5e-4;
    q = vec4(normalize(vec3(C - .5 * r, r.y)) * z, .2);
    q.z += T / 30.0;
    s = q.y + .1;
    q.y = abs(s);
    p = q;
    p.y -= .11;
    p.xy *= mat2(cos(11. * U.zywz - 2. * p.z));
    p.y -= .2;
    d = abs(g(p, 8.) - g(p, 24.)) / 4.;
    p = 1. + cos(.7 * U + 5. * q.z);
    o += (s > 0. ? 1. : .1) * p.w * p / max(s > 0. ? d : d * d * d, 5e-4);
  }
  o += (1.4 + sin(T) * sin(1.7 * T) * sin(2.3 * T)) * 1e3 * U / length(q.xy);
  vec4 O = tanh4(o / 1e5);
  gl_FragColor = O;
}
`;

function WarpMesh() {
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

export default function WarpBackground() {
  return (
    <Canvas
      frameloop="always"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1
      }}
      onCreated={({ gl }) => {
        gl.domElement.style.touchAction = 'none';
      }}
      gl={{ antialias: true }}
      camera={{ position: [0, 0, 1], fov: 75 }}
    >
      <WarpMesh />
    </Canvas>
  );
}
