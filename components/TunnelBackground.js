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

// Fragment shader: ultra-slow, whimsical fractal galaxy with bright stars
const fragSrc = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;

// fractal field with very slow time scaling
float field(in vec3 p, float s) {
    float strength = 7. + .03 * log(1e-6 + fract(sin(uTime * 0.01) * 4373.11));
    float accum = s / 4.;
    float prev = 0.;
    float tw = 0.;
    for (int i = 0; i < 26; ++i) {
        float mag = dot(p, p);
        p = abs(p) / mag + vec3(-.5, -.4, -1.5);
        float w = exp(-float(i) / 7.);
        accum += w * exp(-strength * pow(abs(mag - prev), 2.2));
        tw += w;
        prev = mag;
    }
    return max(0., 5. * accum / tw - .7);
}

// fewer iterations for second layer, same slow scale
float field2(in vec3 p, float s) {
    float strength = 7. + .03 * log(1e-6 + fract(sin(uTime * 0.01) * 4373.11));
    float accum = s / 4.;
    float prev = 0.;
    float tw = 0.;
    for (int i = 0; i < 18; ++i) {
        float mag = dot(p, p);
        p = abs(p) / mag + vec3(-.5, -.4, -1.5);
        float w = exp(-float(i) / 7.);
        accum += w * exp(-strength * pow(abs(mag - prev), 2.2));
        tw += w;
        prev = mag;
    }
    return max(0., 5. * accum / tw - .7);
}

// random seed → vec3
vec3 nrand3(vec2 co) {
    vec3 a = fract(cos(co.x * 8.3e-3 + co.y) * vec3(1.3e5, 4.7e5, 2.9e5));
    vec3 b = fract(sin(co.x * 0.3e-3 + co.y) * vec3(8.1e5, 1.0e5, 0.1e5));
    return mix(a, b, 0.5);
}

void main() {
    vec2 fragCoord = vUv * uResolution;
    // apply ultra-slow rotation to UV
    float angle = uTime * 0.001;
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 uv = rot * (2. * fragCoord / uResolution - 1.);
    vec2 uvs = uv * uResolution / max(uResolution.x, uResolution.y);

    // base position
    vec3 p = vec3(uvs / 4., 0.) + vec3(1., -1.3, 0.);
    p += 0.2 * vec3(sin(uTime / 60.), sin(uTime / 50.), sin(uTime / 512.));

    // audio freqs faked as 1.0
    float f0 = 1.0;
    float f1 = 1.0;
    float f2 = 1.0;
    float f3 = 1.0;

    float t = field(p, f2);
    float v = (1.0 - exp((abs(uv.x) - 1.0) * 6.0)) * (1.0 - exp((abs(uv.y) - 1.0) * 6.0));

    // second layer
    vec3 p2 = vec3(
        uvs / (4.0 + sin(uTime * 0.02) * 0.08 + 0.2 + sin(uTime * 0.03) * 0.08 + 0.4),
        1.5
    ) + vec3(2.0, -1.3, -1.0);
    p2 += 0.25 * vec3(sin(uTime / 60.), sin(uTime / 50.), sin(uTime / 512.));
    float t2 = field2(p2, f3);
    vec4 c2 = mix(0.2, 1.0, v) * vec4(1.3 * t2 * t2 * t2, 1.8 * t2 * t2, t2 * f0, t2);

    // stars
    vec2 seed = floor(p.xy * uResolution.x * 2.0);
    vec2 seed2 = floor(p2.xy * uResolution.x * 2.0);
    vec3 rnd = nrand3(seed);
    vec3 rnd2 = nrand3(seed2);
    vec4 star = (vec4(pow(rnd.y, 50.0)) + vec4(pow(rnd2.y, 50.0))) * 2.5;
    star.a = 1.0;

    // combine fractal and stars
    vec4 galaxy = mix(f3 - 0.5, 1.0, v)
                  * vec4(1.2 * f2 * t * t * t, 1.1 * f1 * t * t, 0.8 * f3 * t, 1.0)
                  + c2 + star;

    // deep background tint
    vec3 darkTint = vec3(0.002, 0.0, 0.03);
    galaxy.rgb = mix(darkTint, galaxy.rgb, 0.2);

    gl_FragColor = galaxy;
}
`;

function WarpMesh() {
  const mat = useRef();
  const { size, camera, invalidate } = useThree();

  useLayoutEffect(() => {
    if (!mat.current) return;
    mat.current.uniforms.uResolution.value.set(size.width, size.height);
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    invalidate();
  }, [size, camera, invalidate]);

  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
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

export default function TunnelBackground() {
  return (
    <Canvas
      frameloop="always"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}
      onCreated={({ gl }) => { gl.domElement.style.touchAction = 'none'; }}
      gl={{ antialias: true }}
      camera={{ position: [0, 0, 1], fov: 75 }}
    >
      <WarpMesh />
    </Canvas>
  );
}
