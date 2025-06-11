// File: components/NebulaBackground.js
"use client";

import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { bgSpeed } from '@/lib/bgSpeed';

// Vertex shader (unchanged)
const vertSrc = /* glsl */`
precision highp float;
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

// Fragment shader with increased overall brightness
const fragSrc = /* glsl */`
precision mediump float;

uniform float uTime;
uniform vec2 uResolution;

#define iterations 4
#define formuparam2 0.89
#define volsteps 8
#define stepsize 0.190
#define zoom 3.900
#define tile 0.450
#define brightness 0.30    // raised from 0.20 to lighten nebula
#define distfading 0.560
#define saturation 0.400
#define transverseSpeed 1.1
#define cloud 0.30         // raised from 0.20 to boost cloud highlights

#define hueSpeed 0.02
#define hueOffsetScale 0.5

float field(in vec3 p) {
  float strength = 7.0 + 0.03 * log(1e-6 + fract(sin(uTime)*4373.11));
  float accum = 0., prev = 0., tw = 0.;
  for (int i = 0; i < 6; ++i) {
    float mag = dot(p,p);
    p = abs(p)/mag + vec3(
      -0.5,
      -0.8 + 0.1*sin(uTime*0.2 + 2.0),
      -1.1 + 0.3*cos(uTime*0.15)
    );
    float w = exp(-float(i)/7.0);
    accum += w * exp(-strength*pow(abs(mag - prev),2.3));
    tw += w;
    prev = mag;
  }
  return max(0.0, 5.0*accum/tw - 0.7);
}

void main() {
  vec2 uv2 = 2.0*gl_FragCoord.xy/uResolution.xy - 1.0;
  vec2 uvs = uv2 * uResolution.xy / max(uResolution.x,uResolution.y);
  float time2 = uTime;
  vec2 uv = uvs;

  float a_xz = 0.9, a_yz = -0.6, a_xy = 0.9 + uTime*0.04;
  mat2 rot_xz = mat2(cos(a_xz),sin(a_xz),-sin(a_xz),cos(a_xz));
  mat2 rot_yz = mat2(cos(a_yz),sin(a_yz),-sin(a_yz),cos(a_yz));
  mat2 rot_xy = mat2(cos(a_xy),sin(a_xy),-sin(a_xy),cos(a_xy));

  vec3 dir = vec3(uv*zoom,1.0);
  vec3 from = vec3(0.0);
  from.x -= 2.5; from.y -= 2.5;
  from.x += transverseSpeed*cos(0.01*uTime) + 0.001*uTime;
  from.y += transverseSpeed*sin(0.01*uTime) + 0.001*uTime;
  from.z += 0.003*uTime;

  dir.xy *= rot_xy; dir.xz *= rot_xz; dir.yz *= rot_yz;
  from.xy *= -rot_xy; from.xz *= rot_xz; from.yz *= rot_yz;

  float zooom = (time2 - 3311.0)*0.005*cos(time2*0.02 + 3.1415926/4.0);
  from += vec3(0.0,0.0,1.0)*zooom;

  float shift = mod(zooom, stepsize);
  float zoffset = -shift;
  float sampleShift = shift/stepsize;

  float s = 0.24, s3 = s + stepsize*0.5;
  vec3 v = vec3(0.0), backCol2 = vec3(0.0);
  float t3;

  for (int r = 0; r < volsteps; r++) {
    vec3 p2 = from + (s+zoffset)*dir;
    vec3 p3 = (from + (s3+zoffset)*dir)*(1.9/zoom);
    p2 = abs(vec3(tile) - mod(p2,vec3(tile*2.0)));
    p3 = abs(vec3(tile) - mod(p3,vec3(tile*2.0)));

    t3 = field(p3);

    float pa = 0.0, aVal = 0.0;
    for (int i = 0; i < iterations; i++) {
      p2 = abs(p2)/dot(p2,p2) - formuparam2;
      float D = abs(length(p2) - pa);
      if (i > 2) aVal += (i > 7 ? min(12.0,D) : D);
      pa = length(p2);
    }
    aVal = aVal*aVal*aVal;

    float fade = pow(distfading, max(0.0, float(r)-sampleShift));
    if (r==0) fade *= (1.0-sampleShift);
    if (r==volsteps-1) fade *= sampleShift;

    v += vec3(s+zoffset,(s+zoffset)*(s+zoffset),pow(s+zoffset,5.0)) * aVal * brightness * fade;

    float hueBase = t3*t3*t3 * fade * 0.15;
    float phase = float(r)*hueOffsetScale + uTime*hueSpeed;
    vec3 variedHue = vec3(
      0.5 + 0.25 * sin(phase + 0.0),
      0.4 + 0.15 * sin(phase + 2.0),
      0.6 + 0.25 * sin(phase + 4.0)
    );
    backCol2 += variedHue * hueBase;

    s += stepsize; s3 += stepsize;
  }

  v = mix(vec3(length(v)), v, saturation);
  vec3 swirlColor = vec3(v.x*0.10, v.y*0.05, v.z*0.30);
  vec4 col = vec4(swirlColor*0.015, 1.0);  // slightly boost base swirl
  backCol2 *= cloud;

  gl_FragColor = col + vec4(backCol2, 1.0);
}
`;

function NebulaMesh() {
  const material = useRef();
  const { size, invalidate, camera } = useThree();

  useLayoutEffect(() => {
    if (!material.current) return;
    material.current.uniforms.uResolution.value.set(size.width, size.height);
    camera.aspect = size.width/size.height;
    camera.updateProjectionMatrix();
    invalidate();
  }, [size, camera, invalidate]);

  useFrame((state, delta) => {
    if (material.current) {
      material.current.uniforms.uTime.value += delta * bgSpeed.get();
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2,2]} />
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

export { NebulaMesh };

export default function NebulaBackground() {
  return (
    <Canvas
      frameloop="always"
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: -1
      }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(window.devicePixelRatio||1);
        gl.domElement.style.touchAction = 'none';
      }}
      gl={{ antialias: true }}
      camera={{ position: [0,0,1], fov:75 }}
    >
      <NebulaMesh />
    </Canvas>
  );
}
